pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT

import "./Grantor.sol";
import "./Trustee.sol";
import "./Beneficiary.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
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
// Part 5: Define public & external functions. 
// Part 6: Define internal & private functions
// Part 7: Define modifiers
contract SimpleT is Beneficiary, Trustee, Grantor { 

    string public constant name = "Simple T";    
   
    // /// @dev set the possible Trust States
    // enum TrustStates{ Initializing, Active, Paused, Admin, Executed}
    // TrustStates trustState;
    // TrustStates constant defaultState = TrustStates.Initializing;


    /// @dev grantor addresses are mapped addresses of tokens they hold
    mapping(address => address[]) public GrantorAssets;

    // // percentage_decimals=18;

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

    // // bool public whitelist;
    // // Initialize events
    event CkeckIn(address owner, uint256 newStart, uint256 newEnd);
    event PeriodSet(address owner, uint256 newPeriod);
    event AddedERC20(address owner, address token);


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
        // _setRoleAdmin(GRANTOR_ROLE, GRANTOR_ROLE);
        _setRoleAdmin(GRANTOR_ROLE, DEFAULT_ADMIN_ROLE);                
        _setRoleAdmin(TRUSTEE_ROLE, GRANTOR_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, GRANTOR_ROLE);

        // Assign address to roles        
        _setupRole(DEFAULT_ADMIN_ROLE, _grantor);
        _setupRole(GRANTOR_ROLE, _grantor);
        _setupRole(TRUSTEE_ROLE, _initial_trustee);

        _setupRole(GRANTOR_ROLE, msg.sender);
        grantRole(DEFAULT_ADMIN_ROLE, _grantor);
        // Assign beneficiaries
        
        addGrantor(_grantor);
        setBeneficiaries(_beneficiaries, _percentages);
        
        // // if (msg.sender != _grantor){
        // //     revokeRole(GRANTOR_ROLE, msg.sender);
        // // }
    }


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

}
