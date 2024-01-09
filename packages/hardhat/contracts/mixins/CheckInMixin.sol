pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "../mixins/AccessControlMixin.sol";
import "../interfaces/ICheckInMixin.sol";

/// @title CheckIn
/// @author sters.eth
/// @notice Contract controls time related function of Trust
abstract contract CheckInMixin is AccessControlMixin, ICheckInMixin {
    
    /// dev Initial Trustee modifier to always check in on modifications
    modifier onlyInitialTrustee() {
        _checkRole(_initializableStore().INITIAL_TRUSTEE_ROLE);
        _;
        _initializableStore().lastCheckInTime = block.timestamp;         
    }

    // dev Initial Trustee modifier to always check in on modifications
    modifier onlyActiveTrustee() {
        _checkRole(_initializableStore().ACTIVE_TRUSTEE_ROLE);
        _;
        _initializableStore().activeTrusteeLastCheckInTime = block.timestamp;        
    }  

    function _getExpirationTime() internal view returns(uint256) {
        return _initializableStore().lastCheckInTime + _initializableStore().checkInPeriod;
    }

    /**
     * @notice called by owner to change check in period
     */
	function _setCheckInPeriod(uint256 periodInDays) internal onlyInitialTrustee {
        require(periodInDays > 0, "New period must be an integer > 0");
		_initializableStore().checkInPeriod = periodInDays * 1 days;
        emit PeriodSet(msg.sender, periodInDays);
	}   


    function _isState(SimpleTEnums.TrustStates _expectedState) internal view {
        require(
            _initializableStore().TrustState[0].trustStates == _expectedState, 
            "Trust is not in the expected TrustState"
        );
    }


    modifier isState(SimpleTEnums.TrustStates expectedState) {
        _isState(expectedState);
        _;
    }
}
