pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "../mixins/CheckInMixin.sol";
import "../interfaces/ICheckIn.sol";

/// @title CheckIn
/// @author sters.eth
/// @notice Contract controls time related function of Trust
contract CheckIn is ICheckIn, CheckInMixin {

    /**
     * @notice called by owner periodically to prove grantor is alive
     * This is the only Initial Trustee function to use the onlyRole mod
     */
	function checkInNow() public onlyRole(_initializableStore().INITIAL_TRUSTEE_ROLE) {
        _initializableStore().lastCheckInTime = block.timestamp;
    }

    /**
     * @notice called by owner periodically to prove grantor is alive
     * This is the only Initial Trustee function to use the onlyRole mod
     */
	function activeTrusteeCheckInNow() public onlyRole(_initializableStore().ACTIVE_TRUSTEE_ROLE) {
        _initializableStore().activeTrusteeLastCheckInTime = block.timestamp;
    }

    /**
     * @notice called by owner to change check in period
     */
    function setCheckInPeriod(uint256 periodInDays) external onlyInitialTrustee {
        require(periodInDays > 0, "New period must be an integer > 0");
        _setCheckInPeriod(periodInDays);
    }

    function getCheckInPeriod() external view returns (uint256) {
        return _initializableStore().checkInPeriod;
    }

    function getLastCheckInTime() external view returns (uint256) {
        return _initializableStore().lastCheckInTime;
    }

    function getExpirationTime() external view returns(uint256) {
        return _getExpirationTime();
    }

    function returnTrustState() external view returns (string memory) {
        SimpleTEnums.TrustStates currentTrustState = _initializableStore().TrustState[0].trustStates;
        if (currentTrustState == SimpleTEnums.TrustStates.Inactive) {return "Inactive";}
        else if (currentTrustState == SimpleTEnums.TrustStates.Active) {return "Active";}
        else if (currentTrustState == SimpleTEnums.TrustStates.Executing) {return "Executing";}
        else if (currentTrustState == SimpleTEnums.TrustStates.Executed) {return "Executed";}
        else {return "Ya got probs";}
    }

}
