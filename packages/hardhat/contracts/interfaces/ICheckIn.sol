// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface ICheckIn {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    event CkeckedIn(address owner, uint newStart, uint newEnd);

    /**
     * @dev Returns the admin role that controls `role`. See {grantRole} and
     * {revokeRole}.
     *
     * To change a role's admin, use {AccessControl-_setRoleAdmin}.
     */
	function checkInNow() external;
	function activeTrusteeCheckInNow() external;
	function setCheckInPeriod(uint256 periodInDays) external;
    function getCheckInPeriod() external view returns (uint256);
    function getLastCheckInTime() external view returns (uint256);
    function getExpirationTime() external view returns(uint256);
    function returnTrustState() external view returns (string memory);


}