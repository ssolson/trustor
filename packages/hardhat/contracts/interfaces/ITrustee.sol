// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface ITrustee {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    // event RemovedGrantor(address owner, address grantorAddress);
    // event ResetGrantors(address owner);
    // event AssetsAssigned(address owner);

    function setInitialTrustee(address initialTrusteeAddress) external ;
    function addSuccessorTrustees(
        address[] memory trusteeAddresses, 
        uint256[] memory _successorTrusteePositions
      ) external;
    function findIsATrustee(address _trustee) external view returns (bool isATrustee);
    function setSuccessorPeriod(uint256 newPeriod) external;
    function initialTrusteeRemoveSuccessorTrustee(address _grantorAddress) external;
    function removeActiveTrustee() external;
    function getActiveTrusteeExpirationTime() external view returns(uint256);
    function getSuccessorTrusteeLength() external view returns (uint256);
    function getSuccessorTrusteePosition(address _successorTrusteeAddress) external returns (uint256);
    function getDEDHash() external view returns (bytes32);
    function initiateTrustExecution(bytes calldata signature) external;
    function getSuccessorTrusteePeriod() external view returns (uint256);
    function getActiveTrustee() external view returns (address);
    function openClaims() external;
}