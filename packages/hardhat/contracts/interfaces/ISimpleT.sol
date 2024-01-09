//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IAccessControl.sol";
import "../interfaces/ICheckIn.sol";
import "../interfaces/IERC1155.sol";
import "../interfaces/IGrantor.sol";
import "../interfaces/IInitialize.sol";

interface ISimpleT is IAccessControl, ICheckIn, IERC1155, IGrantor, IInitialize  {
    
}
