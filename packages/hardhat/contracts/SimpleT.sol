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

    string public constant VERSION = "2022.10.0";

    string public name;

    bool public assetsReleased;

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
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
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
