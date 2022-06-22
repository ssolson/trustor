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
abstract contract Beneficiary is Roles {

    /// @dev Array of beneficiaries
    address[] public beneficiaries;

    /// @dev bene addresses are mapped to the % of assets they are to recieve
    mapping(address => uint256) public BeneficiaryPercentages;

    event UpdatedBeneficiaries(address owner, address[] beneficiaries, uint256[] _percentages);

    
    /**
    * @dev Owner may set beneficiary addresses as Trustees. This
    * function will overwrite previous beneficiaries bc changing only 1 
    * beneficiary will require a change in more than 1 beneficiary percentage.
    * @param _beneficiaries ordered array addresses of the beneficiary.
    * @param _percentages ordered array of percentages associated with the beneficiary.
    */  
    function setBeneficiaries(
        address[] memory  _beneficiaries, 
        uint256[] memory _percentages) 
        public onlyRole(GRANTOR_ROLE)
    {
        // require(
        //     block.timestamp-initializedFarmsTime >= secondsIn48hours,
        //     "Time Locked: Must wait 48 hours after last Farm initialization"
        // );    
        
        require(
            _beneficiaries.length >= 1,
            "At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == _percentages.length,
            "Must specify the same number of beneficiaries and percentages."
        );
                
        uint256 totalPercent=0;
        totalPercent=calculateTotalPercent(_percentages);
        require(totalPercent==100, "Total Percent must be 100");

        beneficiaries = _beneficiaries;

        for (
            uint256 idx = 0;
            idx < beneficiaries.length;
            idx++
        ) {
            address addr = beneficiaries[idx];
            require(addr != address(0), 'address can not be zero address');
            BeneficiaryPercentages[addr]=_percentages[idx];
        }

        emit UpdatedBeneficiaries(msg.sender, beneficiaries, _percentages);    
    }

    /// @dev Owner may calculate the the total percent from all initialized farms
    function calculateTotalPercent(
        uint256[] memory  _percentages)
        internal 
        onlyRole(GRANTOR_ROLE)
        view 
        returns (uint256)
    {
        uint256 totalPercent = 0;
        for (
            uint256 idx = 0;
            idx < _percentages.length;
            idx++
        ) {
            totalPercent+=_percentages[idx];
        }
        return totalPercent;
    }


}
