//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Router} from "../Router.sol";
import  "../mixins/ERC1155Mixin.sol";

contract ERC1155Exposed is ERC1155Mixin, Router {

    function X_mint(
            address to,
            uint256 id,
            uint256 amount,
            bytes memory data
        ) external {
        _mint(to, id, amount, data);
    }
}