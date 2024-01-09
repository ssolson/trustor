//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract InitializableStorage {
    // using SimpleTEnums for SimpleTEnums.SettlementStrategy;
    using ECDSA for bytes32;
    bytes32 private constant _SLOT_INITIALIZABLE_STORAGE =
        keccak256(abi.encode("io.synthetix.sample-project.Initializable"));       

    bytes32 private constant _DED = keccak256("The Grantor is Ded");


    struct RoleData {
        mapping(address => bool) members;
        bytes32 adminRole;
    }

    /**  @dev set the possible Trust States */
    // enum TrustStates { Inactive, Active, Executing, Executed}

    struct InitializableStore {
        bool initialized;

        // Trust States TODO (Clean up implementation)
        // SimpleTEnums.TrustStatesStruct[1] TrustS;
        // SimpleTEnums.DistributionType[2] DistType;


        //+++++++++++++++++++++++++++++++ 
        // ROLE Storage
        //+++++++++++++++++++++++++++++++ 
        bytes32 DEFAULT_ADMIN_ROLE;
        bytes32 GRANTOR_ROLE;
        bytes32 INITIAL_TRUSTEE_ROLE;
        bytes32 SUCCESSOR_TRUSTEE_ROLE;
        bytes32 ACTIVE_TRUSTEE_ROLE;
        bytes32 BENEFICIARY_ROLE;
        mapping(bytes32 => RoleData) _roles;
    
        //+++++++++++++++++++++++++++++++ 
        // ERC1155 Storage
        //+++++++++++++++++++++++++++++++ 

        // Mapping from token ID to account balances
        mapping(uint256 => mapping(address => uint256)) _balances;

        // Mapping from account to operator approvals
        mapping(address => mapping(address => bool)) _operatorApprovals;

        // Used as the URI for all token types by relying on ID substitution, e.g. https://token-cdn-domain/{id}.json
        string _uri;

        // Equivalent to decimals, consider changing
        uint256 TOKENS_PER_GRANTOR;

        //+++++++++++++++++++++++++++++++ 
        // Check In 
        //+++++++++++++++++++++++++++++++ 

        /// @dev the time the grantor last checked in
        uint256 lastCheckInTime;

        /// @dev The number of periods after each checkin
        uint256 checkInPeriod;

        /// @dev the time the Active trustee last checked in
        uint256 activeTrusteeLastCheckInTime;

        //+++++++++++++++++++++++++++++++ 
        // Grantor 
        //+++++++++++++++++++++++++++++++ 

        /// @dev Array of grantor's wallets
        mapping(address => uint256) _tokenIds;
        mapping(address => bool) assignedAssets;
        address[] grantors;
        uint256 nextTokenId; 
        
        // SimpleTEnums.DistributionType[2] DistType;

        //+++++++++++++++++++++++++++++++ 
        // Trustee
        //+++++++++++++++++++++++++++++++ 
        address[] initialTrustees;
        address[] successorTrustees;
        address[] unassignedGrantors;


        // The number of periods in weeks after each checkin
        uint256 successorTrusteePeriod; 
        address activeTrustee;
        
        mapping(address => uint256) successorTrusteePosition;
        mapping(uint256 => address[]) generations;

        //+++++++++++++++++++++++++++++++ 
        // Beneficiary
        //+++++++++++++++++++++++++++++++ 
        address[] beneficiaries;
        mapping(address => uint256) beneficiaryGeneration;

        uint256 totalShares;
        uint256 totalGenerations;

        mapping(address => address) descendantsProgenitor;
        mapping(address => uint256) beneficiaryShares;
        mapping(address => uint256) descendantsShares;
        mapping(address => address[]) descendants;

        mapping(address => bool) noDescendants;
        mapping(address => bool) isDeceased;
        mapping(address => bool) hasLivingDescendants;
        mapping(address => bool) beneficiaryHasClaimed;

        SimpleTEnums.TrustStatesStruct[1] TrustState;
        SimpleTEnums.DistributionTypesStruct[1] DistType;
    }

    function _initializableStore() internal pure returns (InitializableStore storage store) {
        bytes32 s = _SLOT_INITIALIZABLE_STORAGE;
        assembly {
            store.slot := s
        }
    }

    function _getDEDHash() internal pure returns (bytes32 store) {
        return _DED;
    }


    function _setTrustState(
        SimpleTEnums.TrustStates state
    ) internal {
        _initializableStore().TrustState[0].trustStates = state;
    }
}

library SimpleTEnums {
    enum TrustStates {Inactive, Active, Executing, Executed}
    struct TrustStatesStruct {
        TrustStates trustStates;
    }

    enum DistributionTypes {proRata, perStirpes}
    struct DistributionTypesStruct {
        DistributionTypes distributionTypes;
    }
}

