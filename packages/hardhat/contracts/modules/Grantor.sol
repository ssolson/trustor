pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0
import "../interfaces/IGrantor.sol";
import "../mixins/GrantorMixin.sol";

/// @title Grantor
/// @author sters.eth
/// @notice Contains functions related to Grantor managmenet 
contract Grantor is GrantorMixin, IGrantor {
    function setDistribution(string memory _distribution) external onlyInitialTrustee {
        _setDistribution(_distribution);
    }

    function returnDistributionType() external view returns (string memory) {
        SimpleTEnums.DistributionTypes currentDistType = _initializableStore().DistType[0].distributionTypes;

        if (currentDistType == SimpleTEnums.DistributionTypes.proRata) return "proRata";
        if (currentDistType == SimpleTEnums.DistributionTypes.perStirpes) return "perStirpes";
        return "Distribution Not Set";
    }

    /**
     * @dev Initial Trustee  may remove an address from grantor array.
     * @param _grantorAddresses address of trustee.
     */
    function addGrantors(address[] memory _grantorAddresses) external onlyInitialTrustee {
        _addGrantors(_grantorAddresses);
    }


    /**
     * @notice  Release right, title, and interest of assets to the trust
     * @dev Owner may add an addresses with owned assets.
     */
    function assignAssetsToTrust() public onlyRole(_initializableStore().GRANTOR_ROLE) {
        uint256 _tokenId = _initializableStore()._tokenIds[msg.sender];
        require(
            _balanceOf(msg.sender, _tokenId) > 0, 
            "Grantor: has no tokens"
        );
        require(
            _balanceOf(msg.sender, _tokenId) == _initializableStore().TOKENS_PER_GRANTOR, 
            "Grantor: does not have enough tokens"
        );
        _safeTransferFrom(msg.sender, address(this), _tokenId, _initializableStore().TOKENS_PER_GRANTOR, "");
        _initializableStore().assignedAssets[msg.sender] = true;
        
        if ( 
            _initializableStore().TrustState[0].trustStates == 
            SimpleTEnums.TrustStates.Inactive 
            ) {
            _setTrustState(SimpleTEnums.TrustStates.Active );
        }
        emit AssetsAssigned(msg.sender);
    }



    function grantorRemoveSelf() external onlyRole(_initializableStore().GRANTOR_ROLE) {
        _removeGrantor(msg.sender);
    }

    function adminRemoveGrantor(address _grantorAddress) external onlyInitialTrustee {
        _removeGrantor(_grantorAddress);
    }


    /// @dev iterates over grantors array to find passed address
    function findIsAGrantor(address grantor) public view returns (bool isAGrantor) {
        isAGrantor = false;
        for (uint i=0; i < _initializableStore().grantors.length; i++) {
            if (grantor == _initializableStore().grantors[i]) {
                isAGrantor = true;
                break;
            }
        }        
        return isAGrantor;
    }


    /// @dev returns the number of grantors
    function getGrantorsLength() public view returns (uint256) {
        return _initializableStore().grantors.length;
    }


    /// @dev returns array of addresses with active stakers
    function getGrantorsTokenID(address _grantor) external view returns (uint256) {
        return _initializableStore()._tokenIds[_grantor];
    }

    
    function getTokensPerGrantor() public view virtual override returns (uint256) {
        return _getTokensPerGrantor();
    }

}
