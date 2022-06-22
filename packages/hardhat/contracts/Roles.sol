pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT


import "@openzeppelin/contracts/access/AccessControl.sol";


/// @title Simple T
/// @author sters.eth
/// @notice Contract will allow for simple asset transfers
/// PascalCase for Struct and event names 
/// camelCase for function, modifier and variable name
// Part 1: Define custom data, like enums and structs
// Part 2: Define fixed-size (scalar) data, like uint, 
// Part 3: Define dynamic-size (non-scalar) data, like mappings and arrays
// Part 4: Define events
// Part 5: Define public & external functions. External consumers can quickly find out your smart contract "API" here.
// Part 6: Define internal & private functions
// Part 7: Define modifiers
abstract contract Roles is AccessControl {   
    /// @dev GRANTOR_ROLE Controls trust while checkin is live
    bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");

    /// @dev TRUSTEE_ROLE may execute the trust
    bytes32 public constant TRUSTEE_ROLE = keccak256("TRUSTEE_ROLE");

    /// @dev BENEFICIARY_ROLE may recieve assets from trust
    bytes32 public constant BENEFICIARY_ROLE = keccak256("BENEFICIARY_ROLE");

}
