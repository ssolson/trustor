// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts v4.4.1 (access/IAccessControl.sol)

pragma solidity ^0.8.0;

/**
 * @dev External interface CheckIn
 */
interface IBeneficiary {
    /**
     * @dev Emitted when checkin occurs
     *
     * `owner` is... TODO
     */
    function getBeneficiaries() external view returns (address[] memory);
    function getBeneficiaryShares(address _addr) external view returns (uint256);
    function getTotalShares() external view returns (uint256);
    function setBeneficiaries(address[] memory _beneficiaries, uint256[] memory shares_) external;
    function adminRemoveBeneficiary(address beneficiaryAddress) external;
    function claim() external;
    function beneficiaryDeceasedProRata(address beneficiary) external;
    function beneficiaryDeceasedPerStirpes (
        address deadBeneficiary, 
        address[] memory beneficiaryDescendants
        ) external ;
    function undoBeneficiaryDeceasedPerStirpes (address deadBeneficiary) external;
    function redistributeDeadWithNoDescendantPerStirpes() external;
    function resetTrustBeneficiaries() external;
    function NGenerationLivingLineage(address[] memory generation) external view returns (uint256 N);
    function getBeneficiariesLength() external view returns (uint256);
    function findIsABeneficiary(address _beneficiary) external view returns (bool isABeneficiary);
}