pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "./Roles.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/// @title Grantor
/// @author sters.eth
/// @notice Contains functions related to Grantor managmenet 
abstract contract Grantor is Roles {
    event AddedGrantor(address owner, address grantorAddress);
    event RemovedGrantor(address owner, address grantorAddress);
    event ResetGrantors(address owner);
    event AssetsAssigned(address owner);

    /// @dev Array of grantor's wallets
    mapping(address => uint256) public _tokenIds;
    mapping(address => bool) public assignedAssets;
    address[] public grantors;

    using Counters for Counters.Counter;
    Counters.Counter private nextTokenId;


    /**
     * @dev Owner may remove an address from grantor array.
     * @param _grantorAddresses address of trustee.
     */
    function addGrantors(address[] memory _grantorAddresses) public onlyRole(INITIAL_TRUSTEE_ROLE) {
        for (uint256 idx = 0; idx < _grantorAddresses.length; idx++) {
            addGrantor(_grantorAddresses[idx]);
        }
    }

    /**
     * @dev Owner may add an addresses with owned assets.
     * @param _grantorAddress address of grantor.
     */
    function addGrantor(address _grantorAddress) public onlyRole(INITIAL_TRUSTEE_ROLE) {
        require(_grantorAddress != address(0), "Grantor: address can not be zero address");
        require(!findIsAGrantor(_grantorAddress), "Grantor: address already grantor");
        uint256 _tokenId = nextTokenId.current();
        grantors.push(_grantorAddress);
        _tokenIds[_grantorAddress] = _tokenId;
        _mint(_grantorAddress, _tokenId, TOKENS_PER_GRANTOR, "");
        nextTokenId.increment();
        grantRole(GRANTOR_ROLE, _grantorAddress);
        emit AddedGrantor(_msgSender(), _grantorAddress);
    }

    /**
     * @notice  Release right title and interest of assets to the trust
     * @dev Owner may add an addresses with owned assets.
     */
    function assignAssetsToTrust() public onlyRole(GRANTOR_ROLE) {
        uint256 _tokenId = _tokenIds[_msgSender()];
        require(balanceOf(_msgSender(), _tokenId) > 0, "Grantor: has no tokens");
        require(balanceOf(_msgSender(), _tokenId) == TOKENS_PER_GRANTOR, "Grantor: does not have enough tokens");
        safeTransferFrom(_msgSender(), address(this), _tokenId, TOKENS_PER_GRANTOR, "");
        assignedAssets[_msgSender()] = true;
        if (trustState == TrustStates.Inactive) {
            trustState = TrustStates.Active;
        }
        emit AssetsAssigned(_msgSender());
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
            idx < grantors.length;
            idx++
        ) {
            if(_grantorAddress == grantors[idx]){
                grantors[idx] = grantors[grantors.length - 1];
                grantors.pop(); 
                
                if (_msgSender() == _grantorAddress) {
                    renounceRole(GRANTOR_ROLE, _grantorAddress);  
                } else {
                    revokeRole(GRANTOR_ROLE, _grantorAddress); 
                }

                if (assignedAssets[_grantorAddress]) {
                    _burn(address(this), _tokenIds[_grantorAddress], TOKENS_PER_GRANTOR);
                } else {
                    _burn(_grantorAddress, _tokenIds[_grantorAddress], TOKENS_PER_GRANTOR);
                }

                assignedAssets[_grantorAddress] = false;
                _checkTrustState();

                emit RemovedGrantor(_msgSender(), _grantorAddress);
            }
        }
    }

    function grantorRemoveSelf() external onlyRole(GRANTOR_ROLE) {
        _removeGrantor(msg.sender);
    }

    function adminRemoveGrantor(address _grantorAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _removeGrantor(_grantorAddress);
    }

    /**
    * @dev Owner may remove an address from grantor array. 
    * Removing a Grantor will burn its tokens, revoke the GRANTOR_ROLE, ensure assests assigned are false.
    * If there are no more grantors then the state mut go to Inactive 
    */
    function _checkTrustState() internal {
        trustState = TrustStates.Inactive;
        for (
            uint256 idx = 0;
            idx < grantors.length;
            idx++
        ) {
            if( assignedAssets[grantors[idx]] == true ){
                trustState = TrustStates.Active;
                break;
            }
        }
    }

    // /// @dev deletes all address from grantor array
    // function resetGrantor() public onlyRole(GRANTOR_ROLE) {
    //     delete grantors;
    //     emit ResetGrantors(msg.sender);
    // }

    /// @dev returns array of addresses active grantors
    function getGrantors() external view returns (address[] memory) {
        return grantors;
    }

    /// @dev iterates over grantors array to find passed address
    function findIsAGrantor(address grantor) public view returns (bool isAGrantor) {
        isAGrantor = false;
        for (uint i=0; i < grantors.length; i++) {
            if (grantor == grantors[i]) {
                isAGrantor = true;
                break;
            }
        }        
        return isAGrantor;
    }


    /// @dev returns array of addresses with active stakers
    function getGrantorsLength() public view returns (uint256) {
        return grantors.length;
    }

    /// @dev returns array of addresses with active stakers
    function getGrantorsAt(uint256 idx) public view returns (address) {
        return grantors[idx];
    }

    /// @dev returns array of addresses with active stakers
    function getGrantorsTokenID(address _grantor) external view returns (uint256) {
        return _tokenIds[_grantor];
    }

    // /// @dev returns array of addresses with active stakers
    // function getAllGrantors() external view returns (address[] memory) {
    //     return grantor.values();
    // }

    // /// @dev returns array of addresses with active stakers
    // function getGrantors() external view returns (address[] memory) {
    //     return grantor;
    // }
}
