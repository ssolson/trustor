pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT

import "./Roles.sol";


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
abstract contract Grantor is Roles {   

    /// @dev Array of grantor's wallets
    address[] public grantor;

    event AddedGrantor(address owner, address grantorAddress);
    event RemovedGrantor(address owner, address grantorAddress);
    event ResetGrantor(address owner);

    
    /**
    * @dev Owner may add an addresses with owned assets.
    * @param _grantorAddress address of grantor.
    */  
    function addGrantor(address _grantorAddress) public onlyRole(GRANTOR_ROLE) {
        require(_grantorAddress != address(0), 'address can not be zero address');
        grantor.push(_grantorAddress);
        emit AddedGrantor(msg.sender, _grantorAddress);
    } 

   
    /**
    * @dev Owner may remove an address from grantor array.
    * @param _grantorAddress address of trustee.
    */  
    function removeGrantor(address _grantorAddress) external onlyRole(GRANTOR_ROLE) {
        // REMOVES TRUSTEE ROLE 
        for (
            uint256 idx = 0;
            idx < grantor.length;
            idx++
        ) {
            if(_grantorAddress == grantor[idx]){
                if(grantor.length == 1){
                    resetGrantor();
                }                    
                else {
                    grantor[idx] = grantor[grantor.length - 1];
                    grantor.pop(); // Remove the last element
                    emit RemovedGrantor(msg.sender, _grantorAddress);
                }
            }
        }
    }


    /// @dev deletes all address from grantor array
    function resetGrantor() public onlyRole(GRANTOR_ROLE) {     
        delete grantor;
        emit ResetGrantor(msg.sender);
    }

    /// @dev returns array of addresses with active stakers
    function getGrantors() external view returns (address[] memory) {
        return grantor;
    }

}
