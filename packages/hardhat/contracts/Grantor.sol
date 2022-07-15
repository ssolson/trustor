pragma solidity 0.8.14;
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
    
    mapping(address => uint256) public _token_ids;
    address[] public grantors;

    using Counters for Counters.Counter;
    Counters.Counter private next_token_id;

    uint256 public constant tokensPerGrantor = 1000000000000000000;


    /**
    * @dev Owner may add an addresses with owned assets.
    * @param _grantorAddress address of grantor.
    */  
    function addGrantor(address _grantorAddress)
        public
        onlyRole(GRANTOR_ADMIN_ROLE)
    {
        require(_grantorAddress != address(0), 'Grantor: address can not be zero address');
        
        uint256 _token_id = next_token_id.current();
        grantors.push(_grantorAddress);        
        _token_ids[_grantorAddress] = _token_id;        
        _mint(_grantorAddress, _token_id, tokensPerGrantor, "");
        next_token_id.increment();
        grantRole(GRANTOR_ROLE, _grantorAddress);
        emit AddedGrantor(msg.sender, _grantorAddress);
    }

    
    function assignAssetsToTrust() public onlyRole(GRANTOR_ROLE) {
        uint256 _token_id = _token_ids[msg.sender];
        uint256 _amount = balanceOf(msg.sender, _token_id);        
        // setApprovalForAll(address(this), true);
        safeTransferFrom(msg.sender, address(this), _token_id, _amount, "");
    }

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
        return _token_ids[_grantor];
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
