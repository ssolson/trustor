pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "./Roles.sol";

/// @title CheckIn
/// @author sters.eth
/// @notice Contract controls time related function of Trust
contract CheckIn is Roles {
    event CkeckedIn(address owner, uint newStart, uint newEnd);
    event PeriodSet(address owner, uint periodInDays);

   
    /// @dev the time the trustor last checked in
    uint256 public lastCheckInTime;

    /// @dev The number of periods after each checkin
    uint256 public checkInPeriod;

    /// @dev the time the Active last checked in
    uint256 public activeTrusteeLastCheckInTime;


    /**
     * @notice called by owner periodically to prove grantor is alive
     * This is the only Initial Trustee function to use the onlyRole mod
     */
	function checkInNow() public onlyRole(INITIAL_TRUSTEE_ROLE) {
        lastCheckInTime = block.timestamp;
    }
    
    // @ dev Initial Trustee modifier to always check in on modifications
    modifier onlyInitialTrustee() {
        _checkRole(INITIAL_TRUSTEE_ROLE);
        _;        
        checkInNow();        
    }



    /**
     * @notice called by owner to change check in period
     */
	function setCheckInPeriod(uint256 periodInDays) public onlyInitialTrustee  {
        require(periodInDays > 0, "New period must be an integer > 0");

		checkInPeriod = periodInDays * 1 days;

        emit PeriodSet(_msgSender(), periodInDays);
	}    


    function getExpirationTime() public view returns(uint256) {
        return lastCheckInTime + checkInPeriod;
    }

        /**
     * @notice called by owner periodically to prove grantor is alive
     * This is the only Initial Trustee function to use the onlyRole mod
     */
	function activeTrusteeCheckInNow() public onlyRole(ACTIVE_TRUSTEE_ROLE) {
        activeTrusteeLastCheckInTime = block.timestamp;
    }

    // @ dev Initial Trustee modifier to always check in on modifications
    modifier onlyActiveTrustee() {
        _checkRole(ACTIVE_TRUSTEE_ROLE);
        _;        
        activeTrusteeCheckInNow();        
    }


}
