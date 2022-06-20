pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
// import "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract will allow for simple asset transfers
/// PascalCase for Struct and event names 
/// camelCase for function, modifier and variable name
// Part 1: Define custom data, like enums and structs
// Part 2: Define fixed-size (scalar) data, like uint, 
// Part 3: Define dynamic-size (non-scalar) data, like mappings and arrays
// Part 4: Define events
// Part 5: Define public & external functions. External consumers can quickly find out your smart contract "API" here.
// Part 6: Define internal & private functions
// Part 7: Define modifiers
contract SimpleT is AccessControlEnumerable, ReentrancyGuard { 

    string public constant name = "Simple T";    
   
    /// @dev set the possible Trust States
    enum TrustStates{ Initializing, Active, Paused, Admin, Executed}
    TrustStates trustState;
    TrustStates constant defaultState = TrustStates.Initializing;

    /// @dev GRANTOR_ROLE Controls trust while checkin is live
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");

    /// @dev TRUSTEE_ROLE may execute the trust
    bytes32 public constant TRUSTEE_ROLE = keccak256("TRUSTEE_ROLE");
    // Initial Trustee

    /// @dev BENEFICIARY_ROLE may recieve assets from trust
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

    /// @dev PAUSER_ROLE Special role which allows Trust to be paused
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");


    /// @dev TRUST_ROLE allows the Trust contract to act as participant in the Trust
    // bytes32 public constant TRUST_ROLE = keccak256("TRUST_ROLE");

    /// @dev Array of grantor's wallets
    address[] public grantor;

    /// @dev Array of trustees
    address[] public trustees;

    /// @dev Array of beneficiaries
    address[] public beneficiaries;

    /// @dev grantor addresses are mapped addresses of tokens they hold
    mapping(address => address[]) public GrantorAssets;

    /// @dev bene addresses are mapped to the % of assets they are to recieve
    mapping(address => uint256) public BeneficiaryPercentages;

    // percentage_decimals=18;

    /// @dev the time trust was initialized
    uint256 public initializedTrust;

    /// @dev the time the trustor last checked in
    uint256 public checkInPeriodStart;

    /// @dev the time at which the deadman switch expires
    uint256 public checkInPeriodEnd;

    /// @dev the number of seconds in 1 period
    uint256 public constant secondsIn30Days=2592000;

    /// @dev The number of periods after each checkin
    uint128 public periods;

    /// @dev the trust will transfer to Trustees after this period of time
    uint256 public trustEnd;

    // bool public whitelist;
    // Initialize events
    event CkeckIn(address owner, uint256 newStart, uint256 newEnd);
    event PeriodSet(address owner, uint256 newPeriod);
    event AddedGrantor(address owner, address grantorAddress);
    event AddedERC20(address owner, address token);
    event AddedTrustee(address owner, address trusteeAddress);
    event RemovedTrustee(address owner, address trusteeAddress);
    event ResetTrustees(address owner);
    event UpdatedBeneficiaries(address owner, address[] beneficiaries, uint256[] _percentages);


    constructor(
        address _grantor,
        address _initial_trustee,
        address[] memory _beneficiaries,
        uint256[] memory _percentages
    ) {
        // Trust is initialized at deployment
        initializedTrust=block.timestamp;

        // First check in is at deployment
        checkInPeriodStart=block.timestamp;

        // Intialize trust at 1 year checkin
        periods=12;

        // The end of the first checkpoint
        checkInPeriodEnd = checkInPeriodStart + periods * secondsIn30Days;

        // Set the Trust end to 1 year
        trustEnd=checkInPeriodEnd;

        // Set Role Admins        
        _setRoleAdmin(GRANTOR_ROLE, GRANTOR_ROLE);
        _setRoleAdmin(TRUSTEE_ROLE, GRANTOR_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, GRANTOR_ROLE);
        // _setRoleAdmin(TRUST_ROLE, TRUST_ROLE);

        // Assign address to roles
        _setupRole(DEFAULT_ADMIN_ROLE, _grantor);
        _setupRole(GRANTOR_ROLE, _grantor);
        _setupRole(TRUSTEE_ROLE, _initial_trustee);
        _setupRole(PAUSER_ROLE, _grantor);
        // _setupRole(TRUST_ROLE, address(this));
        
        // Assign beneficiaries
        _setupRole(GRANTOR_ROLE, msg.sender);
        setBeneficiaries(_beneficiaries, _percentages);
        revokeRole(GRANTOR_ROLE, msg.sender);
    }


    // function pause() public onlyRole(PAUSER_ROLE) {
    //     _pause();
    // }

    // function unpause() public onlyRole(PAUSER_ROLE) {
    //     _unpause();
    // }

    /**
     * @notice Checkin to Trust
     */
    function checkIn() external onlyRole(GRANTOR_ROLE) {
        checkInPeriodStart = block.timestamp;
        checkInPeriodEnd = checkInPeriodStart + periods * secondsIn30Days;
        emit CkeckIn(msg.sender, checkInPeriodStart, checkInPeriodEnd);
    }


    /**
     * @notice Set Period in months. Must be at least 1 month and at greatest 12 months.
     */
    function setPeriods(uint128 newPeriod) external onlyRole(GRANTOR_ROLE) {
        require(newPeriod >= 1, "New period must be an integer greater than 0");
        require(newPeriod <= 12, "New period must be an integer less than 13");
        periods = newPeriod;
        emit PeriodSet(msg.sender, newPeriod);
    }

    
    /**
    * @dev Owner may add an addresses with owned assets.
    * @param _grantorAddress address of grantor.
    */  
    function addGrantor(address _grantorAddress) external onlyRole(GRANTOR_ROLE) {
        require(_grantorAddress != address(0), 'address can not be zero address');
        grantor.push(_grantorAddress);
        // grantRole(GRANTOR_ROLE, _grantorAddress);
        emit AddedGrantor(msg.sender, _grantorAddress);
    }


    /// @dev deletes all address from grantor array, removes grantor role for all addresses
    function resetGrantor() public {
        require(hasRole(GRANTOR_ROLE, msg.sender));
        
        for (
            uint256 idx = 0;
            idx < grantor.length;
            idx++
        ){

        }

        delete grantor;

        // REMOVES GRANTOR ROLE

        // emit ResetTrustees(msg.sender);
    }

    /**
    * @dev Owner may add ERC20 token addresses.
    * @param _token token to add.
    */  
    function addERC20ToTrust(address _token) external onlyRole(GRANTOR_ROLE) {
        require(_token != address(0), 'address can not be zero address');
        // require(allowance>balance) //Need to add inputs for this check
        GrantorAssets[msg.sender].push(_token);

        emit AddedERC20(msg.sender, _token);
    }


    /**
    * @dev Owner may add addresses as Trustees.
    * @param trusteeAddress address of trustee.
    */  
    function addTrustee(address trusteeAddress) external onlyRole(GRANTOR_ROLE) {
        require(trusteeAddress != address(0), 'address can not be zero address');
        trustees.push(trusteeAddress);
        emit AddedTrustee(msg.sender, trusteeAddress);
    }


    /**
    * @dev Owner may remove an address from Trustees.
    * @param trusteeAddress address of trustee.
    */  
    function removeTrustee(address trusteeAddress) external onlyRole(GRANTOR_ROLE) {
        // REMOVES TRUSTEE ROLE 
        for (
            uint256 idx = 0;
            idx < trustees.length;
            idx++
        ) {
            if(trusteeAddress == trustees[idx]){
                if(trustees.length == 1){
                    resetTrustees();
                }                    
                else {
                    trustees[idx] = trustees[trustees.length - 1];
                    trustees.pop(); // Remove the last element
                    emit RemovedTrustee(msg.sender, trusteeAddress);
                }
            }
        }
    }


    /// @dev deletes all address from trustees
    function resetTrustees() public onlyRole(GRANTOR_ROLE) {
        delete trustees;
        emit ResetTrustees(msg.sender);
    }


    /**
    * @dev Owner may set beneficiary addresses as Trustees. This
    * function will overwrite previous beneficiaries bc changing only 1 
    * beneficiary will require a change in more than 1 beneficiary percentage.
    * @param _beneficiaries ordered array addresses of the beneficiary.
    * @param _percentages ordered array of percentages associated with the beneficiary.
    */  
    function setBeneficiaries(
        address[] memory  _beneficiaries, 
        uint256[] memory _percentages) 
        public onlyRole(GRANTOR_ROLE)
    {
        // require(
        //     block.timestamp-initializedFarmsTime >= secondsIn48hours,
        //     "Time Locked: Must wait 48 hours after last Farm initialization"
        // );    
        
        require(
            _beneficiaries.length >= 1,
            "At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == _percentages.length,
            "Must specify the same number of beneficiaries and percentages."
        );
                
        uint256 totalPercent=0;
        totalPercent=calculateTotalPercent(_percentages);
        require(totalPercent==100, "Total Percent must be 100");

        beneficiaries = _beneficiaries;

        for (
            uint256 idx = 0;
            idx < beneficiaries.length;
            idx++
        ) {
            address addr = beneficiaries[idx];
            require(addr != address(0), 'address can not be zero address');
            BeneficiaryPercentages[addr]=_percentages[idx];
        }

        emit UpdatedBeneficiaries(msg.sender, beneficiaries, _percentages);    
    }


    /// @dev Owner may calculate the the total percent from all initialized farms
    function calculateTotalPercent(
        uint256[] memory  _percentages)
        internal 
        onlyRole(GRANTOR_ROLE)
        view 
        returns (uint256)
    {
        uint256 totalPercent = 0;
        for (
            uint256 idx = 0;
            idx < _percentages.length;
            idx++
        ) {
            totalPercent+=_percentages[idx];
        }
        return totalPercent;
    }


    /**
     * @notice Checks the balance of a passed token for a provided wallet.
     * @param _token The target token.
     * @param _wallet The target token.
     */
    function erc20Balance(
        address _token, 
        address _wallet) 
        view 
        public 
        returns (uint256 total) 
    {
        total = IERC20(_token).balanceOf(_wallet);
        return total;
    }

    // /**
    //  * @notice Checks  approves contract to spend the passed token.
    //  * @param _token The target token.
    //  * @param _value The value the contract may spend.
    //  */
    // function erc20Approval(IERC20 _token, address _spender, uint256 _value) public {
    //     (bool sent) = _token.approve(_spender, _value);
    //     require(sent, "Failed to approve tokens");
    // }

    /**
     * @notice transfers the passed token from the grantor to the specified address.
     * @param _token The target token.
     * @param _from The grantor's wallet.
     * @param _to The trustee or beneficiary's wallet
     * @param _amount The _amount to send.
     */
    function erc20TransferFrom(  
        address _token,    
        address _from,
        address _to,
        uint256 _amount
        ) public 
    {
        IERC20(_token).transferFrom( _from, _to, _amount);
    }



    /**
    * @dev Owner may set beneficiary addresses as Trustees. This
    * function will overwrite previous beneficiaries bc changing only 1 
    * beneficiary will require a change in more than 1 beneficiary percentage.
    * @param _beneficiaries ordered array addresses of the beneficiary.
    * @param _percentages ordered array of percentages associated with the beneficiary.
    */  
    function TrusteeSetBeneficiaries(
        address[] calldata  _beneficiaries, 
        uint256[] calldata _percentages) 
        external onlyRole(TRUSTEE_ROLE)
    {
        // require(block.timestamp > checkInPeriodEnd, "Check-In Period is still live.") ;

        // require(
        //     block.timestamp-initializedFarmsTime >= secondsIn48hours,
        //     "Time Locked: Must wait 48 hours after last Farm initialization"
        // );    
        
        require(
            _beneficiaries.length >= 1,
            "At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == _percentages.length,
            "Must specify the same number of beneficiaries and percentages."
        );
                
        uint256 totalPercent=0;
        totalPercent=calculateTotalPercent(_percentages);
        require(totalPercent==100, "Total Percent must be 100");

        beneficiaries = _beneficiaries;

        for (
            uint256 idx = 0;
            idx < beneficiaries.length;
            idx++
        ) {
            address addr = beneficiaries[idx];
            require(addr != address(0), 'address can not be zero address');
            BeneficiaryPercentages[addr]=_percentages[idx];
        }

        emit UpdatedBeneficiaries(msg.sender, beneficiaries, _percentages);    
    }


    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function executeTrust() public onlyRole(TRUSTEE_ROLE) {
        // require(block.timestamp > checkInPeriodEnd, "Check-In Period is still live.") ;
        // require(msg.sender == trustees, "Executer is not an active Trustee.") ;
        
        // Iterate over Grantor wallets
        for (
            uint256 grantor_wallet_idx = 0;
            grantor_wallet_idx < grantor.length;
            grantor_wallet_idx++
        ) {
            // Iterate over tokens in Grantor wallet
            address grantor_addr = grantor[grantor_wallet_idx];            
            address[] memory grantor_addr_tokens = GrantorAssets[grantor_addr];
            for (
                uint256 asset_idx = 0;
                asset_idx < grantor_addr_tokens.length;
                asset_idx++
            ) {
                address asset_addr = grantor_addr_tokens[asset_idx];
                uint256 total_assets = erc20Balance(asset_addr, grantor_addr);
                // require(sent, "Failed to get balance.");
                // if (total_assets==0) {pass}
                // Iterate over tokens beneficiaries
                for (
                    uint256 beneficiary_idx = 0;
                    beneficiary_idx < beneficiaries.length;
                    beneficiary_idx++
                ) {
                    address beneficiary_addr = beneficiaries[beneficiary_idx];
                    uint256 percentage = BeneficiaryPercentages[beneficiary_addr];
                    uint256 amountToTransfer = total_assets * percentage / 100;
                    erc20TransferFrom( asset_addr, grantor_addr, beneficiary_addr, amountToTransfer);
                    // (bool sent) =
                    // require(sent, "Failed to withdraw tokens");

                }
            }
        }
        
    }




//     /**
//     /** @dev Owner may remove an address from Trustees.
//     * @param trusteeAddress address of trustee.
//     */  
//     function removeTrustee(address trusteeAddress) external onlyOwner {
//         for (
//             uint256 idx = 0;
//             idx < trustees.length;
//             idx++
//         ) {
//             if(trusteeAddress == trustees[idx]){
//                 if(trustees.length == 1){
//                     resetTrustees();
//                 }                    
//                 else {
//                     trustees[idx] = trustees[trustees.length - 1];
//                     trustees.pop(); // Remove the last element
//                     emit RemovedTrustee(msg.sender, trusteeAddress);
//                 }
//             }
//         }
//     }

//   /// @dev deletes all address from trustees
//   function resetTrustees() public onlyOwner {
//       delete trustees;
//       emit ResetTrustees(msg.sender);
//   }



    // function seeTrust() public {
    //     if (msg.sender != trustor){
    //         // require(block.timestamp > checkInPeriodEnd, "Check-In Period is still live.") ;
    //         // require(msg.sender == trustees, "Executer is not an active Trustee.") ;
    //     }        
    // }


//     /**
//     * @notice Set the USDC to Crown rate with 6 digit accuracy (e.g. $0.20 CROWN/USDC = 200000)
//     */
//     function setUSDCPerCrown(uint256 rate) external onlyOwner {
//        USDCPerCrown = rate;
//     }


//     /** @dev set whitelist to true or false.
//     */  
//     function setWhitelist(bool status) external onlyOwner {
//         whitelist = status;
//         emit WhitelistStatusUpdated(msg.sender, status);
//     }


//     /** @dev Owner may add addresses to whitelist.
//     * @param userAddress address of user with whitelist access.
//     */  
//     function addToWhitelist(address userAddress) external onlyOwner {
//         require(userAddress != address(0), 'address can not be zero address');
//         wlAddresses.push(userAddress);
//         emit AddedWlAddress(msg.sender, userAddress);
//     }


//     /// @dev deletes an address from the whitelist if found in whitelist
//     function removeAddressFromWl(address userAddress) external onlyOwner {
//         for (
//             uint256 wlIndex = 0;
//             wlIndex < wlAddresses.length;
//             wlIndex++
//         ) {
//             if(userAddress == wlAddresses[wlIndex]){
//                 if(wlAddresses.length == 1){
//                     resetWhitelist();
//                 }                    
//                 else {
//                     wlAddresses[wlIndex] = wlAddresses[wlAddresses.length - 1];
//                     wlAddresses.pop(); // Remove the last element
//                     emit RemovedWlAddress(msg.sender, userAddress);
//                 }
//             }
//         }
//     }


//   /// @dev deletes all entries from whitelist
//   function resetWhitelist() public onlyOwner {
//       delete wlAddresses;
//       emit ResetWhitelist(msg.sender);
//   }


//     /**
//     * @notice Allow users to buy crown for USDC by specifying the number of Crown tokens desired. 
//     */
//     function buyCrown(uint256 crownTokens) external nonReentrant {
//         // Check that the requested amount of tokens to sell is more than 0
//         require(crownTokens > 0, "Specify an amount of Crown greater than zero");

//         // Check that the Vendor's balance is enough to do the swap
//         uint256 vendorBalance = _crownToken.balanceOf(address(this));
//         require(vendorBalance >= crownTokens, "Vendor contract does not have a suffcient Crown balance.");
        
//         // Check if whitelist is active
//         if(whitelist){
//             bool userOnWhitelist = false;
//             for (
//                 uint256 wlIndex = 0;
//                 wlIndex < wlAddresses.length;
//                 wlIndex++
//             ) {
//                 if(msg.sender == wlAddresses[wlIndex]){
//                     userOnWhitelist = true;
//                 }
//             }
//             require(userOnWhitelist, "User not found on whitelist");
//         }

//         // Calculate USDC needed
//         uint256 usdcToSpend = crownToUSDC(crownTokens);

//         // Check that the user's USDC balance is enough to do the swap
//         address sender = msg.sender;
//         uint256 userBalance = _usdcToken.balanceOf(sender);
//         require(userBalance >= usdcToSpend, "You do not have enough USDC.");

//         // Check that user has approved the contract
//         uint256 contractAllowance = _usdcToken.allowance(sender, address(this));
//         require(contractAllowance >= usdcToSpend, "Must approve this contract to spend more USDC.");

//         // Transfer USDC from user to contract
//         (bool recieved) = _usdcToken.transferFrom(sender, address(this), usdcToSpend);
//         require(recieved, "Failed to transfer USDC from vendor to user");
//         emit PayUSDC(sender, usdcToSpend);

//         // Send Crown to Purchaser
//         (bool sent) = _crownToken.transfer(sender, crownTokens);
//         require(sent, "Failed to transfer Crown from  to vendor");
//         emit BoughtCrown(sender, crownTokens);
//     }


//     /**
//     * @notice Allow the owner of the contract to withdraw all $USDC
//     */
//     function withdrawUSDC() external onlyOwner {
//       uint256 vendorBalance = _usdcToken.balanceOf(address(this));
//       require(vendorBalance > 0, "Nothing to Withdraw");
//       (bool sent) = _usdcToken.transfer(msg.sender, vendorBalance);
//       require(sent, "Failed to transfer tokens from user to Farm");

//       emit WithdrawUSDC(msg.sender, vendorBalance);
//     }


//     /**
//     * @notice Allow the owner of the contract to withdraw all $CROWN
//     */
//     function withdrawCrown() external onlyOwner {
//       uint256 vendorBalance = _crownToken.balanceOf(address(this));
//       require(vendorBalance > 0, "Nothing to Withdraw");
//       (bool sent) = _crownToken.transfer(msg.sender, vendorBalance);
//       require(sent, "Failed to transfer tokens from user to Farm");

//       emit WithdrawCrown(msg.sender, vendorBalance);
//     }


//     /**
//     * @notice Helper function: Convert Crown tokens to USDC 
//     */
//     function crownToUSDC(uint256 crownTokens) public view returns (uint256 usdc) {
//       usdc = (crownTokens * USDCPerCrown)/10**18;
//       return usdc;
//     }


}
