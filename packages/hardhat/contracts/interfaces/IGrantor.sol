// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface IGrantor {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */



	function addGrantors(address[] memory _grantorAddresses) external ;
	function assignAssetsToTrust() external ;
	function grantorRemoveSelf() external ;
	function adminRemoveGrantor(address _grantorAddress) external ;
	function findIsAGrantor(address grantor) external returns (bool isAGrantor);
	function getGrantorsLength() external returns (uint256);
	function getGrantorsTokenID(address _grantor) external returns (uint256);
    function getTokensPerGrantor() external view returns (uint256);
	function setDistribution(string memory _distribution) external;
	function returnDistributionType() external view returns (string memory);
}