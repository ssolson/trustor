pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "./Roles.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
// import "@openzeppelin/contracts/utils/structs/EnumerableMap.sol";
// import "./EnumerableMap.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract will allow for simple asset transfers
abstract contract Grantor is Roles {
    event AddedGrantor(address owner, address grantorAddress);
    event RemovedGrantor(address owner, address grantorAddress);
    event ResetGrantor(address owner);

    /// @dev Array of grantor's wallets

    mapping(address => uint256) public _tokenIds;
    address[] public grantors;

    using Counters for Counters.Counter;
    Counters.Counter private nextTokenId;

    uint256 public constant TOKENS_PER_GRANTOR = 1000000000000000000;

    /**
     * @dev Owner may remove an address from grantor array.
     * @param _grantorAddresses address of trustee.
     */
    function addGrantors(address[] memory _grantorAddresses) public onlyRole(INITIAL_TRUSTEE_ROLE) {
        // Adds GRANTOR ROLE
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
        //TODO: Require address is not already a grantor

        uint256 _tokenId = nextTokenId.current();
        grantors.push(_grantorAddress);
        _tokenIds[_grantorAddress] = _tokenId;
        _mint(_grantorAddress, _tokenId, TOKENS_PER_GRANTOR, "");
        nextTokenId.increment();
        grantRole(GRANTOR_ROLE, _grantorAddress);
        emit AddedGrantor(msg.sender, _grantorAddress);
    }


    function assignAssetsToTrust() public onlyRole(GRANTOR_ROLE) {
        //TODO: require sender has not already called

        uint256 _tokenId = _tokenIds[msg.sender];
        uint256 _amount = balanceOf(msg.sender, _tokenId);
        // setApprovalForAll(address(this), true);
        safeTransferFrom(msg.sender, address(this), _tokenId, _amount, "");
    }


    // TODO: REVOKE Assets from Trust
    // REMOVING GRANTOR REQUIRES BURNING ASSOCIATED TOKENS
    // /**
    // * @dev Owner may remove an address from grantor array.
    // * @param _grantorAddress address of trustee.
    // */
    // function removeGrantor(address _grantorAddress) external onlyRole(GRANTOR_ROLE) {
    //     grantor.remove(_grantorAddress);
    //     emit RemovedGrantor(msg.sender, _grantorAddress);
    // }

    // /// @dev deletes all address from grantor array
    // function resetGrantor() public onlyRole(GRANTOR_ROLE) {
    //     delete grantor;
    //     emit ResetGrantor(msg.sender);
    // }

    /// @dev returns array of addresses active grantors
    function getGrantors() external view returns (address[] memory) {
        return grantors;
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

    // /**
    // * @dev Owner may add an addresses with owned assets.
    // * @param _grantorAddress address of grantor.
    // */
    // function addGrantor(address _grantorAddress) public onlyRole(GRANTOR_ROLE) {
    //     require(_grantorAddress != address(0), 'address can not be zero address');
    //     grantor.push(_grantorAddress);
    //     emit AddedGrantor(msg.sender, _grantorAddress);
    // }

    // /**
    // * @dev Owner may remove an address from grantor array.
    // * @param _grantorAddress address of trustee.
    // */
    // function removeGrantor(address _grantorAddress) external onlyRole(GRANTOR_ROLE) {
    //     // REMOVES TRUSTEE ROLE
    //     for (
    //         uint256 idx = 0;
    //         idx < grantor.length;
    //         idx++
    //     ) {
    //         if(_grantorAddress == grantor[idx]){
    //             if(grantor.length == 1){
    //                 resetGrantor();
    //             }
    //             else {
    //                 grantor[idx] = grantor[grantor.length - 1];
    //                 grantor.pop(); // Remove the last element
    //                 emit RemovedGrantor(msg.sender, _grantorAddress);
    //             }
    //         }
    //     }
    // }

    // /// @dev deletes all address from grantor array
    // function resetGrantor() public onlyRole(GRANTOR_ROLE) {
    //     delete grantor;
    //     emit ResetGrantor(msg.sender);
    // }

    // /// @dev returns array of addresses with active stakers
    // function getGrantors() external view returns (address[] memory) {
    //     return grantor;
    // }
}
