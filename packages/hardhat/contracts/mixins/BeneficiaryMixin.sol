pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "../interfaces/IBeneficiaryMixin.sol";

import "../mixins/CheckInMixin.sol";
import "../mixins/ERC1155Mixin.sol";


/// @title Beneficiary Mixin
/// @author sters.eth
/// @notice Contract controls time related function of Trust
abstract contract BeneficiaryMixin is CheckInMixin, ERC1155Mixin, IBeneficiaryMixin {
  
    /**
     * @dev Trustee will finalize beneficiary addresses.
     * @param _beneficiaries ordered array addresses of the beneficiary.
     * @param shares_ ordered array of shares associated with the beneficiary.
     */
    function _setBeneficiaries(address[] memory _beneficiaries, uint256[] memory shares_)
        internal
        // isState(TrustStates.Active)
        onlyRole(_initializableStore().INITIAL_TRUSTEE_ROLE) {
        
        require(
            _beneficiaries.length > 0,
            "Beneficiary: At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == shares_.length,
            "Beneficiary: beneficiaries and shares must have equal length."
        );

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            _addBeneficiary(_beneficiaries[i], shares_[i]);
        }
    }

    /**
     * @dev Add a new payee to the contract.
     * @param account The address of the payee to add.
     * @param shares_ The number of shares owned by the payee.
     */
    function _addBeneficiary(address account, uint256 shares_) internal {
        require(account != address(0), "Beneficiary: account is the zero address");
        require(shares_ > 0, "Beneficiary: shares must be greater than 0");

        uint256 currentbeneficiaryShares = _initializableStore().beneficiaryShares[account];
        _initializableStore().beneficiaryShares[account] = shares_;
        if (currentbeneficiaryShares == 0 ) {
            _initializableStore().beneficiaries.push(account);
            _grantRole(_initializableStore().BENEFICIARY_ROLE, account);
            _initializableStore().totalShares = _initializableStore().totalShares + shares_;
            emit BeneficiaryAdded(msg.sender,account, shares_);

        }
        else {
            _initializableStore().totalShares = _initializableStore().totalShares - currentbeneficiaryShares + shares_;
            emit BeneficiaryUpdated(msg.sender,account, shares_);
        }

    }


    /**
     * @dev remove a beneficiary.
     * Removing a beneficiary
     * @param beneficiaryAddress address of beneficiary to remove.
     */
    function _removeBeneficiary(address beneficiaryAddress) internal {
        require(_initializableStore().beneficiaries.length>1, "Cannot remove last beneficiary. Please add replacement before removal.");

        uint256 previousShares = _initializableStore().beneficiaryShares[beneficiaryAddress];
        for (
            uint256 idx = 0;
            idx < _initializableStore().beneficiaries.length;
            idx++
        ) {
            if(beneficiaryAddress == _initializableStore().beneficiaries[idx]){
                _initializableStore().beneficiaries[idx] = _initializableStore().beneficiaries[_initializableStore().beneficiaries.length - 1];
                _initializableStore().beneficiaries.pop(); 
                _initializableStore().beneficiaryShares[beneficiaryAddress]=0;                
                _revokeRole(_initializableStore().BENEFICIARY_ROLE, beneficiaryAddress);                 
                emit BeneficiaryRemoved(msg.sender, beneficiaryAddress, previousShares);
            }
        }
    }
  
    /** Internal because active trustee may only remove via designated method. E.g. proRata, perStirpes */
    function _activeTrusteeRemoveBeneficiary(address beneficiaryAddress) internal onlyActiveTrustee {
        _removeBeneficiary(beneficiaryAddress);
    }

  }
