pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "./Grantor.sol";
import "./Trustee.sol";
import "./Beneficiary.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract will allow for simple asset transfers
contract SimpleT is Beneficiary, Trustee, Grantor {
    event CkeckIn(address owner, uint256 newStart, uint256 newEnd);
    event PeriodSet(address owner, uint128 newPeriod);

    string public constant VERSION = "0.1.0";

    string public name;

    /**  @dev set the possible Trust States */
    // enum TrustStates{ Initializing, Active, Paused, Admin, Executed}
    // TrustStates trustState;
    // TrustStates constant defaultState = TrustStates.Initializing;
    bool public assetsReleased;

    // using EnumerableMap for EnumerableMap.AddressToUintMap;
    // EnumerableMap.AddressToUintMap private grantor;

    // using EnumerableSet for EnumerableSet.AddressSet;
    // EnumerableSet.AddressSet private uniqueAssets;

    /// @dev the time trust was initialized
    uint256 public initializedTrust;

    /// @dev the time the trustor last checked in
    uint256 public checkInPeriodStart;

    /// @dev the time at which the deadman switch expires
    uint256 public checkInPeriodEnd;

    /// @dev the number of seconds in 1 period
    uint256 public constant SECONDS_IN_30_DAYS = 2592000;

    /// @dev The number of periods after each checkin
    uint128 public periods;

    /// @dev the trust will transfer to Trustees after this period of time
    uint256 public trustEnd;

    constructor(
        string memory _name,
        address _initialTrustee,
        uint128 _checkInPeriod,
        address[] memory _grantors,
        address[] memory _successorTrustees,
        uint256[] memory _successorTrusteePositions,
        uint256 _successorTrusteePeriod,
        address[] memory _beneficiaries,
        uint256[] memory _beneficiaryPercentages
    ) {
        // Set Trust Name
        name = _name;
        // Trust is initialized at deployment
        initializedTrust = block.timestamp;
        checkInPeriodStart = block.timestamp;
        periods = _checkInPeriod;
        checkInPeriodEnd = checkInPeriodStart + periods * SECONDS_IN_30_DAYS;
        trustEnd = checkInPeriodEnd;

        assetsReleased = false;

        // Set Role Admins
        _setRoleAdmin(INITIAL_TRUSTEE_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(TRUSTEE_ROLE, INITIAL_TRUSTEE_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, INITIAL_TRUSTEE_ROLE);

        // Initialize roles
        _setupRole(DEFAULT_ADMIN_ROLE, _initialTrustee);
        _setupRole(INITIAL_TRUSTEE_ROLE, msg.sender);

        // Setup Trust
        setInitialTrustee(_initialTrustee);
        setPeriods(_checkInPeriod);
        addGrantors(_grantors);
        addSuccessorTrustees(_successorTrustees);
        addSuccessorTrustee(_initialTrustee);
        setBeneficiaries(_beneficiaries, _beneficiaryPercentages);

        if (msg.sender != _initialTrustee) {
            grantRole(DEFAULT_ADMIN_ROLE, _initialTrustee);
            grantRole(INITIAL_TRUSTEE_ROLE, _initialTrustee);
            revokeRole(INITIAL_TRUSTEE_ROLE, msg.sender);
            revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
        }
    }


    /**
     * @notice Set Period in months. Must be at least 1 month and at most 12 months.
     */
    function setPeriods(uint128 newPeriod) public onlyRole(INITIAL_TRUSTEE_ROLE) {
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
        assetsReleased = true;
        // for (uint256 idx = 0; idx < beneficiaries.length; idx++) {
        //     setApprovalForAll(beneficiaries[idx], true);
        // }
    }

    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function claim() external onlyRole(BENEFICIARY_ROLE) {
        require(assetsReleased, "SimpleT: Assets have not been released.");
        require(_shares[msg.sender] > 0, "SimpleT: account has no shares");

        // Check for previous payments
        // uint256 payment = releasable(token, account);
        // require(payment != 0, "SimpleT: account is not due payment");

        uint256 totalTokens = grantors.length;
        uint256[] memory tokenIds = new uint256[](totalTokens);
        uint256[] memory amounts = new uint256[](totalTokens);

        // Iterate over Grantor wallets to get 1155 token IDs
        for (uint256 i = 0; i < totalTokens; i++) {
            address grantorAddress = grantors[i];
            uint256 tokenId = _tokenIds[grantorAddress];
            tokenIds[i] = tokenId;
            amounts[i] = TOKENS_PER_GRANTOR;
        }

        _safeBatchTransferFrom(address(this), msg.sender, tokenIds, amounts, "");
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
//         address grantorAddress = grantor.at(grantor_wallet_idx);
//         address[] memory grantorAddress_tokens = GrantorAssets[grantorAddress];
//         for (
//             uint256 asset_idx = 0;
//             asset_idx < grantorAddress_tokens.length;
//             asset_idx++
//         ) {
//             address asset_addr = grantorAddress_tokens[asset_idx];
//             uint256 total_assets = erc20Balance(asset_addr, grantorAddress);
//             // require(sent, "Failed to get balance.");
//             // if (total_assets==0) {pass}
//             erc20TransferFrom( asset_addr,
//                 grantorAddress,
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
//     address grantorAddress = grantor[grantor_wallet_idx];
//     address[] memory grantorAddress_tokens = GrantorAssets[grantorAddress];
//     for (
//         uint256 asset_idx = 0;
//         asset_idx < grantorAddress_tokens.length;
//         asset_idx++
//     ) {
//         address asset_addr = grantorAddress_tokens[asset_idx];
//         uint256 total_assets = erc20Balance(asset_addr, grantorAddress);
//         // require(sent, "Failed to get balance.");
//         // if (total_assets==0) {pass}
//          beneficiaryContract.release(asset_addr, msg.sender);
//         // (bool sent) =
//         // require(sent, "Failed to withdraw tokens");
//     }
// }
