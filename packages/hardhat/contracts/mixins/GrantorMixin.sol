pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "../interfaces/IGrantorMixin.sol";

import "../mixins/CheckInMixin.sol";
import "../mixins/ERC1155Mixin.sol";
import "../mixins/AccessControlMixin.sol";
import "../storage/InitializableStorage.sol";


/// @title CheckIn
/// @author sters.eth
/// @notice Contract controls time related function of Trust
abstract contract GrantorMixin is CheckInMixin, ERC1155Mixin, IGrantorMixin {

    function _setDistribution(string memory _distribution) internal onlyInitialTrustee {
        if (keccak256(bytes(_distribution)) == keccak256("proRata")) {
            //  distributionType = DistributionTypes.proRata;
             _initializableStore().DistType[0].distributionTypes = SimpleTEnums.DistributionTypes.proRata;
        } else if (keccak256(bytes(_distribution)) == keccak256("perStirpes")) {
            // distributionType = DistributionTypes.perStirpes;
             _initializableStore().DistType[0].distributionTypes = SimpleTEnums.DistributionTypes.perStirpes;

        } else {
            revert();
        }
        // TODO: emit event
    }

    /**
     * @dev Initial Trustee  may remove an address from grantor array.
     * @param _grantorAddresses address of trustee.
     */
    function _addGrantors(address[] memory _grantorAddresses) internal onlyInitialTrustee {
        for (uint256 i = 0; i < _grantorAddresses.length; i++) {
            address _grantorAddress = _grantorAddresses[i];
            require(_grantorAddress != address(0), "Grantor: address can not be zero address");
            require(!_findIsAGrantor(_grantorAddress), "Grantor: address already grantor");
            uint256 _tokenId = _initializableStore().nextTokenId;
            _initializableStore().grantors.push(_grantorAddress);
            // isGrantor[_grantorAddress]=true;
            _initializableStore()._tokenIds[_grantorAddress] = _tokenId;
            _mint(_grantorAddress, _tokenId, _initializableStore().TOKENS_PER_GRANTOR, "");
            _initializableStore().nextTokenId+=1;
            _grantRole(_initializableStore().GRANTOR_ROLE, _grantorAddress);
            emit AddedGrantor(msg.sender, _grantorAddress);
        }
    }

    /**
     * @dev Owner may remove an address from grantor array. 
     * Removing a Grantor will burn its tokens, revoke the GRANTOR_ROLE, insure assests assigned are false.
     * If there are no more grantors then the state mut go to Inactive 
     * @param _grantorAddress address of trustee.
     */
    function _removeGrantor(address _grantorAddress) internal {
        for (
            uint256 idx = 0;
            idx < _initializableStore().grantors.length;
            idx++
        ) {
            if(_grantorAddress == _initializableStore().grantors[idx]){
                _initializableStore().grantors[idx] = _initializableStore().grantors[_initializableStore().grantors.length - 1];
                _initializableStore().grantors.pop(); 
                
                if (msg.sender == _grantorAddress) {
                    _renounceRole(_initializableStore().GRANTOR_ROLE, _grantorAddress);  
                } else {
                    _revokeRole(_initializableStore().GRANTOR_ROLE, _grantorAddress); 
                }

                if (_initializableStore().assignedAssets[_grantorAddress]) {
                    _burn(
                        address(this), 
                        _initializableStore()._tokenIds[_grantorAddress], 
                        _initializableStore().TOKENS_PER_GRANTOR
                    );
                } else {
                    _burn(
                        _grantorAddress, 
                        _initializableStore()._tokenIds[_grantorAddress], 
                        _initializableStore().TOKENS_PER_GRANTOR
                    );
                }
                                
                _initializableStore().assignedAssets[_grantorAddress] = false;
                _checkTrustState();

                emit RemovedGrantor(msg.sender, _grantorAddress);
            }
        }
    }
    

    /**
     * @dev Owner may remove an address from grantor array. 
     * Removing a Grantor will burn its tokens, revoke the GRANTOR_ROLE, ensure assests assigned are false.
     * If there are no more grantors then the state mut go to Inactive 
     */
    function _checkTrustState() internal {
        _setTrustState(SimpleTEnums.TrustStates.Inactive);
        for (
            uint256 i = 0;
            i < _initializableStore().grantors.length;
            i++
        ) {
            if( _initializableStore().assignedAssets[_initializableStore().grantors[i]] == true ){
                _setTrustState(SimpleTEnums.TrustStates.Active);
                break;
            }
        }
    }

    function _setTrustDistribution(
        SimpleTEnums.DistributionTypes distribution
    ) internal {
        _initializableStore().DistType[0].distributionTypes = distribution;
    }
        
    /// @dev iterates over grantors array to find passed address
    function _findIsAGrantor(address grantor) internal view returns (bool isAGrantor) {
        isAGrantor = false;
        for (uint i=0; i < _initializableStore().grantors.length; i++) {
            if (grantor == _initializableStore().grantors[i]) {
                isAGrantor = true;
                break;
            }
        }        
        return isAGrantor;
    }        

    function _getGrantorTokenId(address _grantorAddress) internal view returns (uint256) {
        return _initializableStore()._tokenIds[_grantorAddress];
    }

    function _getTokensPerGrantor() internal view virtual returns (uint256) {
        return  _initializableStore().TOKENS_PER_GRANTOR;
    }

    // function _setCheckInPeriod(uint256 checkInPeriod) {
    //     _initializableStore().
    // }
}
