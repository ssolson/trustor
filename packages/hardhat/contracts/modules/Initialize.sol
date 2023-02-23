pragma solidity ^0.8.17;
// SPDX-License-Identifier: MIT


import "../interfaces/IInitialize.sol";
import "../mixins/InitializeMixin.sol";
import "../mixins/GrantorMixin.sol";
import "../mixins/TrusteeMixin.sol";
import "../mixins/BeneficiaryMixin.sol";


/// @title Roles
/// @author sters.eth
/// @notice Contract defines roles and ERC1155
contract Initialize is InitializeMixin, GrantorMixin, TrusteeMixin, BeneficiaryMixin,IInitialize {

    function _isInitialized() internal view override returns (bool) {
        return _initializableStore().initialized;
    }

    function isInitializableModuleInitialized() external view override returns (bool) {
        return _isInitialized();
    }

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
    ) external override onlyIfNotInitialized {
        _initializableStore().initialized = true;

        // Access Control
        _initializableStore().DEFAULT_ADMIN_ROLE = 0x00;
        /** 
         * @dev GRANTOR_ROLE can perform grantor functions the grantor can add or 
         * revoke right, title, and intrest.
         */
        _initializableStore().GRANTOR_ROLE = keccak256("GRANTOR_ROLE");
        /**  
         * @dev INITIAL_TRUSTEE_ROLE
         * The person that creates the family trust is called the grantor or 
         * trustor. In a typical arrangement, the grantor is also the initial trustee. 
         * Wallets with this role may adjust the terms of the trust.
         */
        _initializableStore().INITIAL_TRUSTEE_ROLE = keccak256("INITIAL_TRUSTEE_ROLE");
        /** 
         * @dev SUCCESSOR_TRUSTEE_ROLE 
         * The Successor Trustee is the person or institution who takes over the 
         * management of a living trust property when the initial trustee has
         * died or become incapacitated. The exact responsibilities of a successor 
         * trustee will vary depending on the instructions left by the creator of 
         * the trust (called the Grantor).
         */
        _initializableStore().SUCCESSOR_TRUSTEE_ROLE = keccak256("SUCCESSOR_TRUSTEE_ROLE");
        /**  
         * @dev ACTIVE_TRUSTEE_ROLE may execute the trust 
         * The ACTIVE_TRUSTEE_ROLE is selected from the list of SUCCESOR_TRUSTEES. The 
         * ACTIVE_TRUSTEE_ROLE serves as the active trustee and may perform actions on 
         * following the initial Trustees death.
         */
        _initializableStore().ACTIVE_TRUSTEE_ROLE = keccak256("ACTIVE_TRUSTEE_ROLE");
        /**  
         * @dev BENEFICIARY_ROLE represents the individual or group of individuals 
         * for whom a trust is created. Asset allocations are defined in the trust.
         */        
        _initializableStore().BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

        _setupRole(_initializableStore().DEFAULT_ADMIN_ROLE, msg.sender);

        // Set Role Admins
        // _setRoleAdmin(INITIAL_TRUSTEE_ROLE, DEFAULT_ADMIN_ROLE);
        _setRoleAdmin(
            _initializableStore().GRANTOR_ROLE, 
            _initializableStore().INITIAL_TRUSTEE_ROLE
            );
        _setRoleAdmin(
            _initializableStore().SUCCESSOR_TRUSTEE_ROLE, 
            _initializableStore().INITIAL_TRUSTEE_ROLE
            );
        _setRoleAdmin(
            _initializableStore().BENEFICIARY_ROLE, 
            _initializableStore().INITIAL_TRUSTEE_ROLE
            );

        // Initialize roles
        _setupRole(_initializableStore().DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(_initializableStore().INITIAL_TRUSTEE_ROLE, msg.sender);

        // ERC1155
        _setURI("");
        _initializableStore().TOKENS_PER_GRANTOR = 1 * 10**18;

        // Trust State 
        _setTrustState(SimpleTEnums.TrustStates.Inactive);

        // Grantor
        _initializableStore().nextTokenId = 0;
        _addGrantors(_grantors);     
        _setCheckInPeriod(_checkInPeriod);
        _setDistribution(distributionType);
        
        // Trustee        
        _setInitialTrustee(_initialTrustee);
        _addSuccessorTrustees(_successorTrustees, _successorTrusteePositions);
        _setSuccessorPeriod(_successorTrusteePeriod);

        // Beneficiary
        _initializableStore().totalShares=0;
        _initializableStore().totalGenerations=1;

        _setBeneficiaries(_beneficiaries, _beneficiaryPercentages);
        
    }
    
    
    function testEnum() external view override onlyIfInitialized returns (SimpleTEnums.TrustStates _x) {
        _x = _initializableStore().TrustState[0].trustStates;
        return _x;
    }




    //     // @ dev require outside senders to only send to Trust address
//     function safeTransferFrom(
//         address from,
//         address to,
//         uint256 id,
//         uint256 amount,
//         bytes memory data
//     ) public virtual override {
//         require(
//             to == address(this),
//             "ERC1155: Only send tokens to Trust or Burn"
//         );
//         require(
//             amount == TOKENS_PER_GRANTOR,
//             "ERC1155: Must send all tokens"
//         );

//         super.safeTransferFrom(from,to,id,amount,data);
//     }
//     // TODO: super for safeBatchTransfer or other transfer methods
    
}
