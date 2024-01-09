pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

import "../interfaces/ITrustee.sol";
import "../mixins/TrusteeMixin.sol";
import "../mixins/CheckInMixin.sol";
import "../mixins/GrantorMixin.sol";


/// @title Simple T
/// @author sters.eth
/// @notice Contract contains Trustee functions
contract Trustee is CheckInMixin, GrantorMixin, TrusteeMixin, ITrustee {    
    using ECDSA for bytes32;

    /**
     * @dev ADMIN may set initial Trustee.
     * @param initialTrusteeAddress address of trustee.
     */
    function setInitialTrustee(address initialTrusteeAddress) external onlyRole(_initializableStore().DEFAULT_ADMIN_ROLE) {
        require(initialTrusteeAddress != address(0), "address can not be zero address");
        _setInitialTrustee(initialTrusteeAddress);
    }


    function addSuccessorTrustees(
        address[] memory trusteeAddresses, 
        uint256[] memory _successorTrusteePositions
      ) external onlyInitialTrustee {
        require(
            trusteeAddresses.length == _successorTrusteePositions.length, 
            "Addresses & positions must have equal length"
        );
        _addSuccessorTrustees(trusteeAddresses, _successorTrusteePositions);
    }


    /// @dev iterates over grantors array to find passed address
    function findIsATrustee(address _trustee) external view returns (bool isATrustee) { 
        return _findIsATrustee(_trustee);
    }


    /**
     * @notice Set Period in weeks between succsor trustees
     */
    function setSuccessorPeriod(uint256 newPeriod) external onlyInitialTrustee {
        _setSuccessorPeriod(newPeriod);
    }

    function initialTrusteeRemoveSuccessorTrustee(address _grantorAddress) external onlyInitialTrustee {
        _removeSuccessorTrustee(_grantorAddress);
    }

    function removeActiveTrustee() external onlyRole(_initializableStore().SUCCESSOR_TRUSTEE_ROLE) {
        require(
            block.timestamp > getActiveTrusteeExpirationTime(), 
            "Active trustee has not been inactive long enough."
        );
        _revokeRole(_initializableStore().ACTIVE_TRUSTEE_ROLE, _initializableStore().activeTrustee);
        _initializableStore().activeTrustee = address(0);
        _setTrustState(SimpleTEnums.TrustStates.Active);
    }

    function getActiveTrusteeExpirationTime() public view returns(uint256) {
        return _getActiveTrusteeExpirationTime();
    }

    /**
     * [3.5] If a beneficiary predeceases the Grantor, the beneficiary’s
     *  share shall be distributed [pro rata to the other beneficiaries
     *  designated in this trust; or per stirpes/per capita to the
     *  descendants of the beneficiary.
     */

    /**
     * @notice transfers fungibles to the beneficiaries
     */
    // function releaseAssets() 
    //   public 
    //   onlyRole(ACTIVE_TRUSTEE_ROLE) 
    //   isState(TrustStates.Executing) {
    //     trustState = TrustStates.Executed;
    // }

    /// @dev returns the number of trustees
    function getSuccessorTrusteeLength() external view returns (uint256) {
        return _initializableStore().successorTrustees.length;
    }
    
    function getSuccessorTrusteePosition(address _successorTrusteeAddress) external view returns (uint256) {
        return _initializableStore().successorTrusteePosition[_successorTrusteeAddress];
    }

    function getSuccessorTrusteePeriod() external view returns (uint256) {
        return _initializableStore().successorTrusteePeriod;
    }

    function getDEDHash() external view returns (bytes32) {
        return _getDEDHash();
    }

     /**
     * @notice  Checks that the sender signed the passed message.
     */
    function _isValidSignature(bytes calldata signature) internal view returns (bool) {
        bytes32 DED = _getDEDHash();
        return DED.toEthSignedMessageHash().recover(signature) == msg.sender;
    }

    /**
     * @notice  A successor Trustee may begin the execution of an active Trust 
     *  by passing the DED signed message.
     * 
     */
    function initiateTrustExecution(bytes calldata signature) 
        external 
        isState(SimpleTEnums.TrustStates.Active)
        onlyRole(_initializableStore().SUCCESSOR_TRUSTEE_ROLE) {

        require(
            _isValidSignature(signature),
            "SignatureChecker: Invalid Signature"
        );
        
        uint256 successor_position = _initializableStore().successorTrusteePosition[msg.sender];
        require(successor_position>0, "successor_position cannot be the default value" );
        require(
            _getExpirationTime() + (successor_position-1)*_initializableStore().successorTrusteePeriod < block.timestamp, 
            'This Succesor Trustee is not availble to act on this trust yet.'
        );
        
        // Set the sender as the Active Trustee
        _grantRole(_initializableStore().ACTIVE_TRUSTEE_ROLE, msg.sender);
        _initializableStore().activeTrustee = msg.sender;

        // Change the Admin of Successor & Beneficiary roles to the smart contract
        _setRoleAdmin(_initializableStore().SUCCESSOR_TRUSTEE_ROLE, _initializableStore().DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(_initializableStore().BENEFICIARY_ROLE, _initializableStore().DEFAULT_ADMIN_ROLE);

        // Revoked Initial Trustee Roles 
        for (uint i=0; i < _initializableStore().initialTrustees.length; i++) {
            _revokeRole(_initializableStore().INITIAL_TRUSTEE_ROLE, _initializableStore().initialTrustees[i]);
        }

        // Grantors may no longer revoke assets from trust
        for (uint i=0; i < _initializableStore().grantors.length; i++) {
            address grantorAddress = _initializableStore().grantors[i];
            _revokeRole(_initializableStore().GRANTOR_ROLE, grantorAddress);

            if (!_initializableStore().assignedAssets[grantorAddress]) {       
                // Revisit this universal declaration
                _initializableStore().unassignedGrantors.push(grantorAddress);
            }
        }
        
        _setRoleAdmin(_initializableStore().GRANTOR_ROLE, _initializableStore().ACTIVE_TRUSTEE_ROLE);        
        // Remove grantors who did not assign assets
        for (uint i=0; i < _initializableStore().unassignedGrantors.length; i++) {
            address removeAddress = _initializableStore().unassignedGrantors[i];
            _removeGrantor(removeAddress);
        }
        _setRoleAdmin(_initializableStore().GRANTOR_ROLE, _initializableStore().DEFAULT_ADMIN_ROLE);

        // State is now executing
        _setTrustState(SimpleTEnums.TrustStates.Executing);
        _initializableStore().activeTrusteeLastCheckInTime=block.timestamp;

        // Set generation 1 to the beneficiaries specified at Trust execution
        // Default value is 0
        _initializableStore().generations[1] = _initializableStore().beneficiaries;
        for (uint i=0; i < _initializableStore().beneficiaries.length; i++) {
            address currentBeneficiary= _initializableStore().beneficiaries[i];
            _initializableStore().beneficiaryGeneration[currentBeneficiary]=1;
        }
    }

    function openClaims() 
      external onlyActiveTrustee
      isState(SimpleTEnums.TrustStates.Executing) 
      {
        _setTrustState(SimpleTEnums.TrustStates.Executed);

    }

    function getActiveTrustee() external view returns (address) {
        return _initializableStore().activeTrustee;
    }

}
