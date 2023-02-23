//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


/**
 * @title Mixin for Roles.
 */
abstract contract RolesMixin {
    /**
     * @dev Reverts if contract is not initialized.
     */
    modifier onlyIfInitialized() {
        if (!_isInitialized()) {
            revert InitError.NotInitialized();
        }
        _;
    }

    // /**
    //  * @dev Reverts if contract is already initialized.
    //  */
    // modifier onlyIfNotInitialized() {
    //     if (_isInitialized()) {
    //         revert InitError.AlreadyInitialized();
    //     }

    //     _;
    // }

    // /**
    //  * @dev Override this function to determine if the contract is initialized.
    //  * @return True if initialized, false otherwise.
    //  */
    // function _isInitialized() internal view virtual returns (bool);
}
