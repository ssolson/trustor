pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/// @title Roles
/// @author sters.eth
/// @notice Contract defines roles and ERC1155
abstract contract Roles is ERC1155Holder, ERC1155, AccessControl {
    /// @dev GRANTOR_ADMIN Controls trust while checkin is live
    bytes32 public constant GRANTOR_ADMIN_ROLE =
        keccak256("GRANTOR_ADMIN_ROLE");

    /**  
    @dev GRANTOR_ROLE can perform grantor functions the grantor can add or 
      revoke right, title, and intrest
     */
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");

    /// @dev INITIAL_TRUSTEE_ROLE modify the trust on the Grantor's behalf
    bytes32 public constant INITIAL_TRUSTEE_ROLE =
        keccak256("INITIAL_TRUSTEE_ROLE");

    /** 
     @dev SUCCESSOR_TRUSTEE_ROLE 
      The Successor Trustee is the person or institution who takes over the 
      management of a living trust property when the original trustee has
      died or become incapacitated. The exact responsibilities of a successor 
      trustee will vary depending on the instructions left by the creator of 
      the trust (called the Grantor).
     */
    bytes32 public constant SUCCESSOR_TRUSTEE_ROLE =
        keccak256("SUCCESSOR_TRUSTEE_ROLE");

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
