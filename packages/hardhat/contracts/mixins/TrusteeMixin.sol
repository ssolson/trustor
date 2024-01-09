pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "../interfaces/ITrusteeMixin.sol";

import "../mixins/CheckInMixin.sol";
import "../mixins/ERC1155Mixin.sol";
import "../storage/InitializableStorage.sol";


/// @title CheckIn
/// @author sters.eth
/// @notice Contract controls time related function of Trust
abstract contract TrusteeMixin is CheckInMixin, ERC1155Mixin, ITrusteeMixin {
    /**
     * @dev ADMIN may set initial Trustee.
     * @param initialTrusteeAddress address of trustee.
     */
    function _setInitialTrustee(address initialTrusteeAddress) internal onlyRole(_initializableStore().DEFAULT_ADMIN_ROLE) {
        require(initialTrusteeAddress != address(0), "address can not be zero address");
        // TODO: If not null revoke role
        _initializableStore().initialTrustees.push(initialTrusteeAddress);
        _grantRole(_initializableStore().INITIAL_TRUSTEE_ROLE, initialTrusteeAddress);
        emit SetInitialTrustee(msg.sender, initialTrusteeAddress);
    }


    function _addSuccessorTrustees(
        address[] memory trusteeAddresses, 
        uint256[] memory _successorTrusteePositions
      ) internal onlyInitialTrustee {
        require(
            trusteeAddresses.length == _successorTrusteePositions.length, 
            "Addresses & positions must have equal length"
        );
        for (uint256 idx = 0; idx < trusteeAddresses.length; idx++) {
            // addSuccessorTrustee(trusteeAddresses[idx], _successorTrusteePositions[idx]);
            address _trusteeAddress = trusteeAddresses[idx];
            uint256 position = _successorTrusteePositions[idx];
            require(_trusteeAddress != address(0), "Trustee: address can not be zero address");
            require(!(_hasRole(_initializableStore().SUCCESSOR_TRUSTEE_ROLE, _trusteeAddress)), "Trustee: address already successor trustee");
            require(position>0, "successor_position cannot be the default value" );

            _initializableStore().successorTrustees.push(_trusteeAddress);
            _initializableStore().successorTrusteePosition[_trusteeAddress] = position;
            _grantRole(_initializableStore().SUCCESSOR_TRUSTEE_ROLE, _trusteeAddress);
            emit AddedSccessorTrustee(msg.sender, _trusteeAddress, position);
        }
    }

    /// @dev iterates over grantors array to find passed address
    function _findIsATrustee(address _trustee) internal view returns (bool isATrustee) {
        isATrustee = false;
        for (uint i=0; i < _initializableStore().successorTrustees.length; i++) {
            if (_trustee == _initializableStore().successorTrustees[i]) {
                isATrustee = true;
                break;
            }
        }        
        return isATrustee;
    }

    /**
     * @notice Set Period in weeks between succsor trustees
     */
    function _setSuccessorPeriod(uint256 newPeriod) internal onlyInitialTrustee {
        require(newPeriod >= 1, "New period must be an integer greater than 0");
        require(newPeriod <= 8, "New period must be an integer less than 36");
        _initializableStore().successorTrusteePeriod = newPeriod * 1 weeks;
        emit successorTrusteePeriodSet(msg.sender, newPeriod);
    }

    /**
     * @dev Initial Trustee may remove a successor Trustee.
     * Removing a Grantor will burn its tokens, revoke the GRANTOR_ROLE, insure assests assigned are false.
     * If there are no more grantors then the state mut go to Inactive 
     * @param _successorTrusteeAddress address of trustee to remove.
     */
    function _removeSuccessorTrustee(address _successorTrusteeAddress) internal {
        require(_initializableStore().successorTrustees.length>1, "Cannot remove last successor trustee. Please add replacement before removal.");

        for (
            uint256 idx = 0;
            idx < _initializableStore().successorTrustees.length;
            idx++
        ) {
            if(_successorTrusteeAddress == _initializableStore().successorTrustees[idx]){
                _initializableStore().successorTrustees[idx] = _initializableStore().successorTrustees[_initializableStore().successorTrustees.length - 1];
                _initializableStore().successorTrustees.pop(); 
                
                if (msg.sender == _successorTrusteeAddress) {
                    _renounceRole(_initializableStore().SUCCESSOR_TRUSTEE_ROLE, _successorTrusteeAddress);  
                } else {
                    _revokeRole(_initializableStore().SUCCESSOR_TRUSTEE_ROLE, _successorTrusteeAddress); 
                }

                emit RemovedSuccessorTrustee(
                    msg.sender, 
                    _successorTrusteeAddress, 
                    _initializableStore().successorTrusteePosition[_successorTrusteeAddress]
                );
            }
        }
    }

    function _getActiveTrusteeExpirationTime() internal view returns(uint256) {
        return _initializableStore().activeTrusteeLastCheckInTime + _initializableStore().successorTrusteePeriod;
    }

    function _getSuccessorTrusteeLength() internal view returns (uint256) {
        return _initializableStore().successorTrustees.length;
    }
}
