pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";


/// @title Roles
/// @author sters.eth
/// @notice Contract defines roles and ERC1155
abstract contract Roles is ERC1155Holder, ERC1155, AccessControl {
    uint256 public constant TOKENS_PER_GRANTOR = 1 * 10**18;

    /** 
    @dev GRANTOR_ADMIN_ROLE serves as a backup to the INITIAL_TRUSTEE_ROLE
    */
    // bytes32 public constant GRANTOR_ADMIN_ROLE = keccak256("GRANTOR_ADMIN_ROLE");

    /**  
    @dev GRANTOR_ROLE can perform grantor functions the grantor can add or 
      revoke right, title, and intrest.
    */
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");

    /**  
    @dev INITIAL_TRUSTEE_ROLE
      The person that creates the family trust is called the grantor or 
      trustor. In a typical arrangement, the grantor is also the initial trustee. 
      Wallets with this role may adjust the terms of the trust.
    */
    bytes32 public constant INITIAL_TRUSTEE_ROLE = keccak256("INITIAL_TRUSTEE_ROLE");

    /** 
     @dev SUCCESSOR_TRUSTEE_ROLE 
      The Successor Trustee is the person or institution who takes over the 
      management of a living trust property when the initial trustee has
      died or become incapacitated. The exact responsibilities of a successor 
      trustee will vary depending on the instructions left by the creator of 
      the trust (called the Grantor).
    */
    bytes32 public constant SUCCESSOR_TRUSTEE_ROLE = keccak256("SUCCESSOR_TRUSTEE_ROLE");

    /**  
    @dev TRUSTEE_ROLE may execute the trust 
    The TRUSTEE_ROLE is selected from the list of SUCCESOR_TRUSTEES. The 
    TRUSTEE_ROLE serves as the active trustee and may perform actions on 
    following the initial Trustees death.
    */
    bytes32 public constant TRUSTEE_ROLE = keccak256("TRUSTEE_ROLE");

    /**  
    @dev BENEFICIARY_ROLE represents the individual or group of individuals 
    for whom a trust is created. Asset allocations are defined in the trust.
    */
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

    // @ dev require outside senders to only send to Trust address
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        require(
            to == address(this),
            "ERC1155: Only send tokens to Trust or Burn"
        );
        require(
            amount == TOKENS_PER_GRANTOR,
            "ERC1155: Must send all tokens"
        );

        super.safeTransferFrom(from,to,id,amount,data);
    }
    // TODO: super for safeBatchTransfer or other transfer methods
}
