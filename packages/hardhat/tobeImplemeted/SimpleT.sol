pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0
import "./Beneficiary.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";


/// @title Simple T
/// @author sters.eth
/// @notice Contract will allow for simple asset transfers
contract SimpleT is Beneficiary {
    string public constant VERSION = "2022.10.0";
    string public name;

    /// @dev the time trust was initialized
    uint256 public initializedTrust;

    using ECDSA for bytes32;
    bytes32 public constant DED = keccak256("The Grantor is Ded");

    constructor(
        string memory _name,
        address _initialTrustee,
        uint128 _checkInPeriod,
        address[] memory _grantors,
        string memory distributionType,
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

        // Set Role Admins
        // _setRoleAdmin(INITIAL_TRUSTEE_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(GRANTOR_ROLE, INITIAL_TRUSTEE_ROLE);
        _setRoleAdmin(SUCCESSOR_TRUSTEE_ROLE, INITIAL_TRUSTEE_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, INITIAL_TRUSTEE_ROLE);

        // Initialize roles
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(INITIAL_TRUSTEE_ROLE, msg.sender);

        // Setup Trust
        addGrantors(_grantors);        
        setDistribution(distributionType);
        setCheckInPeriod(_checkInPeriod);
        setInitialTrustee(_initialTrustee);
        addSuccessorTrustees(_successorTrustees, _successorTrusteePositions);
        setSuccessorPeriod(_successorTrusteePeriod);
        setBeneficiaries(_beneficiaries, _beneficiaryPercentages);

        // Finalize Roles
        if (msg.sender != _initialTrustee) {
            grantRole(INITIAL_TRUSTEE_ROLE, _initialTrustee);
            revokeRole(INITIAL_TRUSTEE_ROLE, msg.sender);
        }
        grantRole(DEFAULT_ADMIN_ROLE, address(this));
        revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);

    }


   




}
