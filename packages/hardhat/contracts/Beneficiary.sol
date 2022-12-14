pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "./Trustee.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract will has functions for Beneficiaries
contract Beneficiary is Trustee {
    event BeneficiaryAdded(address sender, address account, uint256 shares);
    event BeneficiaryUpdated(address sender, address account, uint256 shares);
    event BeneficiaryUpdatedProRata(
        address sender, 
        address removed,  
        uint256 shares_redistributed        
    );
    event BeneficiaryRemoved(address sender, address beneficiary, uint256 shares);
    event AssetsReleased(address to, uint256 amount);
    event AssetsReceived(address from, uint256 amount);

    uint256 public totalShares;

    mapping(address => uint256) public beneficiaryShares;
    mapping(address => bool) public beneficiaryHasClaimed;
    address[] public beneficiaries;

    /// @dev returns array of addresses with beneficiaries
    function getBeneficiaries() external view returns (address[] memory) {
        return beneficiaries;
    }


    /// @dev returns array of addresses with beneficiaries shares
    function getAddressShares(address _addr) external view returns (uint256) {
        return beneficiaryShares[_addr];
    }


    /**
     * @dev Trustee will finalize beneficiary addresses.
     * @param _beneficiaries ordered array addresses of the beneficiary.
     * @param shares_ ordered array of shares associated with the beneficiary.
     */
    function setBeneficiaries(address[] memory _beneficiaries, uint256[] memory shares_)
        public
        // isState(TrustStates.Active)
        onlyRole(INITIAL_TRUSTEE_ROLE) {
        
        require(
            _beneficiaries.length > 0,
            "Beneficiary: At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == shares_.length,
            "Beneficiary: beneficiaries and shares must have equal length."
        );

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
        require(shares_ > 0, "Beneficiary: shares must be greater than 0");

        uint256 currentbeneficiaryShares = beneficiaryShares[account];
        beneficiaryShares[account] = shares_;
        if (currentbeneficiaryShares == 0 ) {
            beneficiaries.push(account);
            grantRole(BENEFICIARY_ROLE, account);
            totalShares = totalShares + shares_;
            emit BeneficiaryAdded(_msgSender(),account, shares_);

        }
        else {
            totalShares = totalShares - currentbeneficiaryShares + shares_;
            emit BeneficiaryUpdated(_msgSender(),account, shares_);
        }

    }


    /**
     * @dev remove a beneficiary.
     * Removing a beneficiary
     * @param beneficiaryAddress address of beneficiary to remove.
     */
    function _removeBeneficiary(address beneficiaryAddress) internal {
        require(beneficiaries.length>1, "Cannot remove last beneficiary. Please add replacement before removal.");

        uint256 previousShares = beneficiaryShares[beneficiaryAddress];
        for (
            uint256 idx = 0;
            idx < beneficiaries.length;
            idx++
        ) {
            if(beneficiaryAddress == beneficiaries[idx]){
                beneficiaries[idx] = beneficiaries[beneficiaries.length - 1];
                beneficiaries.pop(); 
                beneficiaryShares[beneficiaryAddress]=0;                
                _revokeRole(BENEFICIARY_ROLE, beneficiaryAddress);                 
                emit BeneficiaryRemoved(_msgSender(), beneficiaryAddress, previousShares);
            }
        }
    }


    function adminRemoveBeneficiary(address beneficiaryAddress) external onlyInitialTrustee {
        _removeBeneficiary(beneficiaryAddress);
    }

    /** Internal because active trustee may only remove via designated method. E.g. proRata, perStirpes */
    function activeTrusteeRemoveBeneficiary(address beneficiaryAddress) internal onlyActiveTrustee {
        _removeBeneficiary(beneficiaryAddress);
    }


    function beneficiaryDeceasedProRata(address beneficiary) 
        external 
        onlyActiveTrustee 
        isDistribution(DistributionTypes.proRata) {
        require(findIsABeneficiary(beneficiary), "Passed address is not a current beneficiary" );
        
        uint256 sharesToRedistribute = beneficiaryShares[beneficiary];
        uint256 NToRedistribute = beneficiaries.length - 1;
        uint256 sharesPerBeneficiary = sharesToRedistribute/NToRedistribute;

        activeTrusteeRemoveBeneficiary(beneficiary);

        for (uint i=0; i < beneficiaries.length; i++) {
            beneficiaryShares[beneficiaries[i]]+=sharesPerBeneficiary;
        }   

        emit BeneficiaryUpdatedProRata(
            _msgSender(), 
            beneficiary,  
            sharesToRedistribute
        );
    }

    // function beneficiaryDeceasedPerStirpes (address beneficiary, address[] newBeneficiaries) external onlyActiveTrustee {
    //     // require(isBeneficiary(beneficiary), "Passed address is not a current beneficiary" );

    // }
        /// @dev returns the number of grantors
    function getBeneficiariesLength() public view returns (uint256) {
        return beneficiaries.length;
    }

    /// @dev iterates over grantors array to find passed address
    function findIsABeneficiary(address _beneficiary) public view returns (bool isABeneficiary) {
        isABeneficiary = false;
        for (uint i=0; i < beneficiaries.length; i++) {
            if (_beneficiary == beneficiaries[i]) {
                isABeneficiary = true;
                break;
            }
        }        
        return isABeneficiary;
    }
}
