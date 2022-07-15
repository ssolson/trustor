pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT

import "./Grantor.sol";
import "./Trustee.sol";
import "./Beneficiary.sol";
import "./EnumerableMap.sol";
// import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
// import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

// import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";


// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/governance/TimelockController.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract will allow for simple asset transfers
contract SimpleT is  Beneficiary, Trustee, Grantor { 
    event CkeckIn(address owner, uint256 newStart, uint256 newEnd);
    event PeriodSet(address owner, uint256 newPeriod);    

    string public constant name = "Simple T";    
   
    // /// @dev set the possible Trust States
    // enum TrustStates{ Initializing, Active, Paused, Admin, Executed}
    // TrustStates trustState;
    // TrustStates constant defaultState = TrustStates.Initializing;
    bool public assetsReleased;

    using EnumerableMap for EnumerableMap.AddressToUintMap;       
    EnumerableMap.AddressToUintMap private grantor;

    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private uniqueAssets;

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

    // ADD SUCCESSOR TRUSTEE AT INSTANTIATION
    constructor(
        address _grantor,
        address _initial_trustee,
        address[] memory _beneficiaries,
        uint256[] memory _percentages
     ) {
        // Trust is initialized at deployment
        initializedTrust=block.timestamp;
        checkInPeriodStart=block.timestamp;       
        periods=12;
        checkInPeriodEnd = checkInPeriodStart + periods * secondsIn30Days;
        trustEnd=checkInPeriodEnd;

        assetsReleased=false;

        // Set Role Admins        
        _setRoleAdmin(GRANTOR_ADMIN_ROLE, DEFAULT_ADMIN_ROLE);                
        _setRoleAdmin(GRANTOR_ROLE, GRANTOR_ADMIN_ROLE);                
        _setRoleAdmin(TRUSTEE_ROLE, GRANTOR_ADMIN_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, GRANTOR_ADMIN_ROLE);

        // Assign address to roles        
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(GRANTOR_ADMIN_ROLE, msg.sender);
        _setupRole(GRANTOR_ROLE, msg.sender);
        _setupRole(TRUSTEE_ROLE, _initial_trustee);
        
        // Assign beneficiaries
        addGrantor(_grantor);
        addTrustee(_initial_trustee);
        setBeneficiaries(_beneficiaries, _percentages);
        
        if (msg.sender != _grantor){
            grantRole(DEFAULT_ADMIN_ROLE, _grantor);
            grantRole(GRANTOR_ADMIN_ROLE, _grantor);
            grantRole(GRANTOR_ROLE, _grantor);
            revokeRole(GRANTOR_ROLE, msg.sender);
            revokeRole(GRANTOR_ADMIN_ROLE, msg.sender);
            revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
        }
    }


    receive() payable external {}

    /**
     * @notice Set Period in months. Must be at least 1 month and at most 12 months.
     */
    function setPeriods(uint128 newPeriod) external onlyRole(GRANTOR_ROLE) {
        require(newPeriod >= 1, "New period must be an integer greater than 0");
        require(newPeriod <= 12, "New period must be an integer less than 13");
        periods = newPeriod;
        emit PeriodSet(msg.sender, newPeriod);
    }


    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function releaseAssets() public onlyRole(TRUSTEE_ROLE) {
        // require(block.timestamp > checkInPeriodEnd, "Check-In Period is still live.") ;               
        assetsReleased=true;
        // for (uint256 idx = 0; idx < beneficiaries.length; idx++) {
        //     setApprovalForAll(beneficiaries[idx], true);
        // }
    }

    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function claim()  external onlyRole(BENEFICIARY_ROLE) {
        require(assetsReleased, "SimpleT: Assets have not been released.");
        require(_shares[msg.sender] > 0, "SimpleT: account has no shares");


        // Check for previous payments
        // uint256 payment = releasable(token, account);
        // require(payment != 0, "SimpleT: account is not due payment");

        uint256 total_tokens=grantors.length;
        uint256[] memory token_ids = new uint256[](total_tokens);
        uint256[] memory amounts = new uint256[](total_tokens);
        
        // Iterate over Grantor wallets to get 1155 token IDs                 
        for (uint256 i=0; i<total_tokens; i++) {
            address grantor_addr = grantors[i];
            uint256 token_id = _token_ids[grantor_addr];
            token_ids[i] = token_id;
            amounts[i] = tokensPerGrantor;
        }  

        _safeBatchTransferFrom(
            address(this), 
            msg.sender, 
            token_ids, 
            amounts,
            "");
    }


    /// @dev returns array of addresses with active stakers
    function getTrustAddress() external view returns (address) {
        return address(this);
    }    



}

/// PascalCase for Struct and event names 
/// camelCase for function, modifier and variable name
// Part 1: Define custom data, like enums and structs
// Part 2: Define fixed-size (scalar) data, like uint, 
// Part 3: Define dynamic-size (non-scalar) data, like mappings and arrays
// Part 4: Define events
// Part 5: Define public & external functions. 
// Part 6: Define internal & private functions
// Part 7: Define modifiers




    // /**
    // * @dev Owner may add ERC20 token addresses.
    // * @param _token token to add.
    // */  
    // function addERC20ToTrust(address _token) external {
    //     require(_token != address(0), 'address can not be zero address');
    //     // require(allowance>balance) //Need to add inputs for this check
    //     GrantorAssets[msg.sender].push(_token);
    //     uniqueAssets.add(_token);
    //     emit AddedERC20(msg.sender, _token);
    // }    


    // /**
    //  * @notice Checks the balance of a passed token for a provided wallet.
    //  * @param _token The target token.
    //  * @param _wallet The target token.
    //  */
    // function erc20Balance(
    //     address _token, 
    //     address _wallet) 
    //     view 
    //     public 
    //     returns (uint256 total) 
    // {
    //     total = IERC20(_token).balanceOf(_wallet);
    //     return total;
    // }


    // /**
    //  * @notice transfers the passed token from the grantor to the specified address.
    //  * @param _token The target token.
    //  * @param _from The grantor's wallet.
    //  * @param _to The trustee or beneficiary's wallet
    //  * @param _amount The _amount to send.
    //  */
    // function erc20TransferFrom(  
    //     address _token,    
    //     address _from,
    //     address _to,
    //     uint256 _amount
    //     ) public 
    // {
    //     IERC20(_token).transferFrom( _from, _to, _amount);
    // }

    // /**
    //  * @notice transfers fungibles to the beneficiaries
    //  */
    // function executeERC20Trust() public onlyRole(TRUSTEE_ROLE) {
    //     // require(block.timestamp > checkInPeriodEnd, "Check-In Period is still live.") ;
    //     require(address(beneficiaryContract) != address(0));
        
    //     // Iterate over Grantor wallets
    //     for (
    //         uint256 grantor_wallet_idx = 0;
    //         grantor_wallet_idx < grantor.length();
    //         grantor_wallet_idx++
    //     ) {
    //         // Iterate over tokens in Grantor wallet
    //         address grantor_addr = grantor.at(grantor_wallet_idx);            
    //         address[] memory grantor_addr_tokens = GrantorAssets[grantor_addr];
    //         for (
    //             uint256 asset_idx = 0;
    //             asset_idx < grantor_addr_tokens.length;
    //             asset_idx++
    //         ) {
    //             address asset_addr = grantor_addr_tokens[asset_idx];
    //             uint256 total_assets = erc20Balance(asset_addr, grantor_addr);                
    //             // require(sent, "Failed to get balance.");
    //             // if (total_assets==0) {pass}
    //             erc20TransferFrom( asset_addr, 
    //                 grantor_addr, 
    //                 address(beneficiaryContract), 
    //                 total_assets
    //             );
    //             // (bool sent) =
    //             // require(sent, "Failed to withdraw tokens");
    //         }
    //     }        
    // }    

    //     /**
    //  * @notice transfers fungibles to the beneficiaries
    //  */
    // function claimERC20() public {
    //     // Send ether
    //     beneficiaryContract.release(msg.sender);

    //     // Iterate over tokens in Grantor wallet
    //     address grantor_addr = grantor[grantor_wallet_idx];            
    //     address[] memory grantor_addr_tokens = GrantorAssets[grantor_addr];
    //     for (
    //         uint256 asset_idx = 0;
    //         asset_idx < grantor_addr_tokens.length;
    //         asset_idx++
    //     ) {
    //         address asset_addr = grantor_addr_tokens[asset_idx];
    //         uint256 total_assets = erc20Balance(asset_addr, grantor_addr);
    //         // require(sent, "Failed to get balance.");
    //         // if (total_assets==0) {pass}
    //          beneficiaryContract.release(asset_addr, msg.sender);
    //         // (bool sent) =
    //         // require(sent, "Failed to withdraw tokens");
    //     }
    // }