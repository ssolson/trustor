//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../storage/InitializableStorage.sol";


interface IInitialize {
    function isInitializableModuleInitialized() external view returns (bool);

    function initializeInitializableModule(        
        string memory _name,
        address _initialTrustee,
        uint128 _checkInPeriod,
        address[] memory _grantors,
        string memory distributionType,
        address[] memory _successorTrustees,
        uint256[] memory _successorTrusteePositions,
        uint256 _successorTrusteePeriod,
        address[] memory _beneficiaries,
        uint256[] memory _beneficiaryPercentages
    ) external;
    
    function testEnum() external view returns (SimpleTEnums.TrustStates _x );

}
