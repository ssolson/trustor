pragma solidity 0.8.14;
// SPDX-License-Identifier: MIT

import "./Roles.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract will has functions for Beneficiaries
abstract contract Beneficiary is Roles {
    event BeneficiaryAdded(address account, uint256 shares);
    event AssetsReleased(address to, uint256 amount);
    event AssetsReceived(address from, uint256 amount);
        
    uint256 private _totalShares;

    mapping(address => uint256) public _shares;
    mapping(address => uint256) private _released;
    address[] public beneficiaries;

    /// @dev returns array of addresses with beneficiaries
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }

    /// @dev returns array of addresses with beneficiaries shares
    function getShares() external view returns (uint256) {
        return _shares[msg.sender];
    }

    /// @dev returns array of addresses with beneficiaries shares
    function getAddressShares(address _addr) external view returns (uint256) {
        return _shares[_addr];
    }


    /**
    * @dev Trustee will finalize beneficiary addresses.
    * @param _beneficiaries ordered array addresses of the beneficiary.
    * @param shares_ ordered array of shares associated with the beneficiary.
    */  
    function setBeneficiaries(        
        address[] memory  _beneficiaries, 
        uint256[] memory shares_) 
        public onlyRole(GRANTOR_ADMIN_ROLE)
     {
        // require(checkin is open);    
        
        require(
            _beneficiaries.length > 0,
            "Beneficiary: At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == shares_.length,
            "Beneficiary: Must specify the same number of beneficiaries and shares."
        );   
        
        _resetBeneficiaries();

        for (uint256 i = 0; i < _beneficiaries.length; i++) {
            _addBeneficiary(_beneficiaries[i], shares_[i]);
        }
    }


    /**
     * @dev Add a new payee to the contract.
     * @param account The address of the payee to add.
     * @param shares_ The number of shares owned by the payee.
     */
    function _addBeneficiary(address account, uint256 shares_) private {
        require(account != address(0), "Beneficiary: account is the zero address");
        require(shares_ > 0, "Beneficiary: shares are 0");
        require(_shares[account] == 0, "Beneficiary: account already has shares");

        beneficiaries.push(account);
        grantRole(BENEFICIARY_ROLE, account);
        _shares[account] = shares_;
        _totalShares = _totalShares + shares_;
        emit BeneficiaryAdded(account, shares_);
    }

    /**
     * @dev Reset the beneficiaries
     */
    function _resetBeneficiaries() private {
        address account;
        for (uint256 i = 0; i < beneficiaries.length; i++) {
            account = beneficiaries[i];
            revokeRole(BENEFICIARY_ROLE, account);
            _shares[account] = 0;
        }
        delete beneficiaries;
        _totalShares = 0;
    }

}
