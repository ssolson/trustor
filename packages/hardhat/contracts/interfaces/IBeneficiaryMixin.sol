// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface IBeneficiaryMixin {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    event BeneficiaryAdded(address sender, address account, uint256 shares);
    event BeneficiaryUpdated(address sender, address account, uint256 shares);
    event BeneficiaryUpdatedProRata(
        address sender, 
        address removed,  
        uint256 shares_redistributed        
    );
    event BeneficiaryRemoved(address sender, address beneficiary, uint256 shares);
    event AssetsReleased(address to, uint256 amount);
    event AssetsReceived(address from, uint256 amount);
}