// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface ICheckInMixin {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    event PeriodSet(address owner, uint periodInDays);
}