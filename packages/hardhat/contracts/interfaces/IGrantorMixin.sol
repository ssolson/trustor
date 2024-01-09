// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface IGrantorMixin {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    event AddedGrantor(address owner, address grantorAddress);
    event RemovedGrantor(address owner, address grantorAddress);
    event ResetGrantors(address owner);
    event AssetsAssigned(address owner);
}