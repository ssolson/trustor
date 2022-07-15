pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT


import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";


/// @title Simple T
/// @author sters.eth
/// @notice Contract defines roles and ERC1155
abstract contract Roles is  ERC1155Holder, ERC1155, AccessControl {   
    
    /// @dev GRANTOR_ADMIN Controls trust while checkin is live
    bytes32 public constant GRANTOR_ADMIN_ROLE = keccak256("GRANTOR_ADMIN_ROLE");

    /// @dev GRANTOR_ROLE can perform grantor functions
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");

    /// @dev TRUSTEE_ROLE may execute the trust
    bytes32 public constant TRUSTEE_ROLE = keccak256("TRUSTEE_ROLE");

    /// @dev BENEFICIARY_ROLE may recieve assets from trust
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");


    constructor() ERC1155("") {}

    function setURI(string memory newuri) public onlyRole(GRANTOR_ROLE) {
        _setURI(newuri);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155Receiver, ERC1155, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    } 
}
