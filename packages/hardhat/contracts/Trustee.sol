pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT

import "./Roles.sol";
// import "@openzeppelin/contracts/access/AccessControl.sol";


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
abstract contract Trustee is Roles {   
    // /// @dev GRANTOR_ROLE Controls trust while checkin is live
    // bytes32 public constant GRANTOR_ROLE = keccak256("GRANTOR_ROLE");

    // /// @dev TRUSTEE_ROLE may execute the trust
    // bytes32 public constant TRUSTEE_ROLE = keccak256("TRUSTEE_ROLE");

    /// @dev Array of trustees
    address[] public trustees;

    event AddedTrustee(address owner, address trusteeAddress);
    event RemovedTrustee(address owner, address trusteeAddress);
    event ResetTrustees(address owner);

    /**
    * @dev Owner may add addresses as Trustees.
    * @param trusteeAddress address of trustee.
    */  
    function addTrustee(address trusteeAddress) external onlyRole(GRANTOR_ROLE) {
        require(trusteeAddress != address(0), 'address can not be zero address');
        trustees.push(trusteeAddress);
        emit AddedTrustee(msg.sender, trusteeAddress);
    }    

   
    /**
    * @dev Owner may remove an address from Trustees.
    * @param trusteeAddress address of trustee.
    */  
    function removeTrustee(address trusteeAddress) external onlyRole(GRANTOR_ROLE) {
        // REMOVES TRUSTEE ROLE 
        for (
            uint256 idx = 0;
            idx < trustees.length;
            idx++
        ) {
            if(trusteeAddress == trustees[idx]){
                if(trustees.length == 1){
                    resetTrustees();
                }                    
                else {
                    trustees[idx] = trustees[trustees.length - 1];
                    trustees.pop(); // Remove the last element
                    emit RemovedTrustee(msg.sender, trusteeAddress);
                }
            }
        }
    }


    /// @dev deletes all address from trustees
    function resetTrustees() public onlyRole(GRANTOR_ROLE) {
        delete trustees;
        emit ResetTrustees(msg.sender);
    }

}
