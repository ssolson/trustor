pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT
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




    /**
     * @notice  Checks that the sender signed the passed message.
     */
    function isValidSignature(bytes calldata signature) internal view returns (bool) {
        return DED.toEthSignedMessageHash().recover(signature) == msg.sender;
    }

    /**
     * @notice  A successor Trustee may begin the execution of an active Trust 
     *  by passing the DED signed message.
     * 
     */
    function initiateTrustExecution(bytes calldata signature) 
        external 
        onlyRole(SUCCESSOR_TRUSTEE_ROLE)
        isState(TrustStates.Active) {

        require(
            isValidSignature(signature),
            "SignatureChecker: Invalid Signature"
        );
        
        uint256 successor_position = successorTrusteePosition[msg.sender];
        require(successor_position>0, "successor_position cannot be the default value" );
        require(
            getExpirationTime() + (successor_position-1)*successorTrusteePeriod < block.timestamp, 
            'This Succesor Trustee is not availble to act on this trust yet.'
        );
        
        // Set the sender as the Active Trustee
        _grantRole(ACTIVE_TRUSTEE_ROLE, _msgSender());
        activeTrustee = _msgSender();

        // Change the Admin of Successor & Beneficiary roles to the smart contract
        _setRoleAdmin(SUCCESSOR_TRUSTEE_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(BENEFICIARY_ROLE, DEFAULT_ADMIN_ROLE);

        // Revoked Initial Trustee Roles 
        for (uint i=0; i < initialTrustees.length; i++) {
            _revokeRole(INITIAL_TRUSTEE_ROLE, initialTrustees[i]);
        }

        // Grantors may no longer revoke assets from trust
        for (uint i=0; i < grantors.length; i++) {
            _revokeRole(GRANTOR_ROLE, grantors[i]);
        }

        trustState = TrustStates.Executing;
        activeTrusteeLastCheckInTime=block.timestamp;
    }


    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function claim() external onlyRole(BENEFICIARY_ROLE) isState(TrustStates.Executed) {
        require(_shares[_msgSender()] > 0, "SimpleT: account has no shares");

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

        _safeBatchTransferFrom(address(this), _msgSender(), tokenIds, amounts, "");
    }

    /// @dev returns array of addresses with active stakers
    function getTrustAddress() external view returns (address) {
        return address(this);
    }
}
