// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface ITrusteeMixin {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    event SetInitialTrustee(address owner, address initialTrusteeAddress);
    event AddedSccessorTrustee(address owner, address successorTrustees, uint256 position);
    event RemovedSuccessorTrustee(address owner, address successorTrustees, uint256 newPeriod);
    event successorTrusteePeriodSet(address owner, uint256 newPeriod);
}