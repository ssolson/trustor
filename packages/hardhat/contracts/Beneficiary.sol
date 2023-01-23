pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

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
    uint256 public totalGenerations=1;

    mapping(address => address) public descendantsProgenitor;
    mapping(address => uint256) public beneficiaryShares;
    mapping(address => uint256) public descendantsShares;
    mapping(address => address[])  public descendants;

    mapping(uint256 => address[]) public generations;
    mapping(address => uint256) public beneficiaryGeneration;

    mapping(address => bool) public noDescendants;
    mapping(address => bool) public isDeceased;
    mapping(address => bool) public hasLivingDescendants;
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
        isState(TrustStates.Active)
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

    /**  
     * If you are using this the Trust is specified as Pro Rata and 
     * at least 1 but not all specified Beneficiaries
     * are dead.
     * 
     * This Function allows removal of a beneficiary pro rata by the
     * activeTrustee if the contract is initialized as proRata. 
     * Shares are kept integer by always multiplying shares by the 
     * least common denominator (Nb-1).
     * LCD multiplication could be an issue for edge cases 
     * (very large share numbers & large number of beneficiaries)
     * 
     * Note:
     *   sharesToRedistribute = (NToRedistributeTo * beneficiaryShares[beneficiary]) / NToRedistributeTo;
     *   Therefore:  
     *   sharesToRedistribute = beneficiaryShares[beneficiary];
    */
    function beneficiaryDeceasedProRata(address beneficiary) 
        external 
        onlyActiveTrustee 
        isDistribution(DistributionTypes.proRata) {
        require(findIsABeneficiary(beneficiary), "Passed address is not a current beneficiary" );
        
        // Determine LCD
        uint256 NToRedistributeTo = beneficiaries.length - 1;
        // Multiply all shares by LCD
        totalShares *= NToRedistributeTo;
        // Add to all other Beneficiary shares
        uint256 sharesToRedistribute = beneficiaryShares[beneficiary];
        // Add beneficiary to list of deceased beneficiaries
        // deceasedBeneficiaries.push(beneficiary);
        // Remove beneficary so that no longer included in bene list
        activeTrusteeRemoveBeneficiary(beneficiary);
        // Iterate over remaining beneficiaries and increase their shares
        for (uint i=0; i < beneficiaries.length; i++) {
            address currentBeneficiary = beneficiaries[i];
            uint256 currentShares = beneficiaryShares[currentBeneficiary];
            beneficiaryShares[currentBeneficiary] = (
                NToRedistributeTo * currentShares
                ) + sharesToRedistribute;
        }   
        emit BeneficiaryUpdatedProRata(
            _msgSender(), 
            beneficiary,  
            sharesToRedistribute
        );
    }
    
    /**  
     * If you are the Active Trustee and the Trust is specified as 
     * Pro Rata and all specified Beneficiaries are dead you may 
     * want to convert the Trust to Per Stirpies and send assets to
     * the descendants of the beneficiaries.
     */
    // function proRataToPerStirpes ( ) {};

    /**  
     * If you are the Active Trustee and the Trust is specified as 
     * Per Stirpies and Beneficiaries has passed dead you may 
     * specify the descendants of the beneficiaries. If a beneficiary 
     * is deceased but no descendants are specified then that beneficiaries 
     * shares are distributed equally between the living beneficiaries/descendants
     * at the time that claims are opened. This cannot happen before then because 
     * it must be ensured that all current beneficiaries are set before
     * redistribution.
     */
    function beneficiaryDeceasedPerStirpes (
        address deadBeneficiary, 
        address[] memory beneficiaryDescendants
        ) 
        external 
        onlyActiveTrustee 
        {
        require(
            findIsABeneficiary(deadBeneficiary), 
            "Passed deadBeneficiary is not a current beneficiary" 
        );
        
        // Set the Beneficiary to deceased
        isDeceased[deadBeneficiary] = true;

        // Check if descendants were specified
        if (beneficiaryDescendants.length > 0) {
            hasLivingDescendants[deadBeneficiary] = true;
            uint256 previousGeneration = beneficiaryGeneration[deadBeneficiary];
            uint256 descendantGeneration = previousGeneration+1;
            if (descendantGeneration>totalGenerations) {
                totalGenerations = descendantGeneration;
            }

            // If descendants are specified iterate over and add to descendants list
            for (uint i=0; i < beneficiaryDescendants.length; i++) {
                address newBeneficiary = beneficiaryDescendants[i];
                // Specify Descendant's generation
                beneficiaryGeneration[newBeneficiary]=descendantGeneration;
                // Add descendant to generational list of descendants
                generations[descendantGeneration].push(newBeneficiary);
                // Descendants specific to a progenator
                descendants[deadBeneficiary].push(newBeneficiary);                        

                // Specify the progenitor of the descendant
                descendantsProgenitor[newBeneficiary] = deadBeneficiary;
            }
        } else {
            // Default is false so the following line should be removed in the future
            hasLivingDescendants[deadBeneficiary] = false;
        }
    }

    /**
     * If a beneficiary's descendants are misspecified then this fuction 
     * allows the user to reset the passed descendant
     */
    function undoBeneficiaryDeceasedPerStirpes (
        address deadBeneficiary
        ) 
        public 
        onlyActiveTrustee 
        {
        require( 
            isDeceased[deadBeneficiary],
            "Beneficiary not specified as dead. Cannot undo."
        );

        // Set the Beneficiary to deceased
        isDeceased[deadBeneficiary] = false;

        // Check if descendants were specified
        if (hasLivingDescendants[deadBeneficiary]) {
            uint256 previousGeneration = beneficiaryGeneration[deadBeneficiary];
            uint256 descendantGeneration = previousGeneration+1;

            // Remove descendants
            for ( uint256 i=0;  i < descendants[deadBeneficiary].length; i++ ) {
                address descendantToRemove = descendants[deadBeneficiary][i];
                require(
                    !isDeceased[descendantToRemove],
                    "A descendant has been marked deceased. Must undo 2nd gen descendands before previous gen."
                );
                // Reset progenitor & generation
                descendantsProgenitor[descendantToRemove] = address(0);
                beneficiaryGeneration[descendantToRemove]=0;

                for (
                    uint256 j = 0;
                    j < generations[descendantGeneration].length;
                    j++
                    ) {
                        if (descendantToRemove == generations[descendantGeneration][j]){
                            generations[descendantGeneration][j] = generations[descendantGeneration][generations[descendantGeneration].length - 1];
                            generations[descendantGeneration].pop();             
                    }
                }
            }
            // Beneficiary no longer has decendants
            hasLivingDescendants[deadBeneficiary] = false;
            // Delete the dead beneficiary's descendants
            delete descendants[deadBeneficiary];

            
        } else {
            // Default is false so the following line should be removed in the future
            hasLivingDescendants[deadBeneficiary] = false;
        }
        

    }

    /**
     * After all dead beneficiaries and their descendants have specified
     * this function must be called to redistribute shares of any deceased
     * beneficiary with no descendants. This function can only be called 
     * once all deceased beneficiaries have been specified. Technically, 
     * if there are no Beneficiaries in state 3 described below then 
     * there is no need to call this function as shares are transfered 
     * down linage at time of specification.
     * 
     * A Beneficiary may have 1 of 3 states:
     *   1. Alive
     *   2. Dead with descendants
     *   3. Dead with no descendants
     *   
     *   Per Stirpes redistribution works as follows:
     *   If State 1: Do Nothing
     *   If State 2: Redistribute evenly to descendants
     *   If State 3: Redistribute evenly to Beneficiaries with State 1 and 2
     */
    function redistributeDeadWithNoDescendantPerStirpes() public {
        for (uint i=1; i < totalGenerations+1; i++) {
            address[] memory genBeneficiaries = generations[i];
            // Create an array of state 1 & 2 for state 3 redistribution
            uint256 N = NGenerationLivingLineage(genBeneficiaries);
            address[] memory livingLineage = new address[](N);
            for (uint j=0; j < N; j++) {
                address currentBeneficiary = genBeneficiaries[j];
                if (
                 !isDeceased[currentBeneficiary] 
                 ||
                 hasLivingDescendants[currentBeneficiary]
                ) {
                //   livingLineage.push(currentBeneficiary);
                  livingLineage[i]=currentBeneficiary;
                }
            }
            // Distribute deceased shares to living or deceased with descendants at same generation level 
            for (uint j=0; j < genBeneficiaries.length; j++) {
                // Get the Current Beneficiary
                address currentBeneficiary = genBeneficiaries[j];

                // If the current beneficiary is deceased redistribute
                if (isDeceased[currentBeneficiary]) {
                    // Remove the current Beneficiary from the generation 
                    uint256 sharesToRedistribute = beneficiaryShares[currentBeneficiary];

                    // If they have living descendants redistribute shares to descendants (living & dead)
                    // Shares to dead desceandants will be redistributed at next generation
                    if (hasLivingDescendants[currentBeneficiary]) {
                        address[] memory currentDescendants = descendants[currentBeneficiary];
                        uint256 NToRedistributeTo = currentDescendants.length;
                        // Set the beneficiary shares to zero
                        beneficiaryShares[currentBeneficiary]=0;
                        // Iterate and redistribute
                        for (uint k=0; k < currentDescendants.length; k++) {
                            address currentDecendant = currentDescendants[k];
                            beneficiaryShares[currentDecendant] += sharesToRedistribute/NToRedistributeTo;
                        }
                    }
                    // Otherwise redistribute to other beneficiaries at the same level (livingLineage)
                    else {
                        uint256 NToRedistributeTo = livingLineage.length;
                        if (NToRedistributeTo==0) {
                            // Trust enters remote contigient mode
                            bytes memory message = "Ur Fucked";
                        } else {
                            // Iterate and redistribute
                            for (uint k=0; k < livingLineage.length; k++) {
                                address currentDecendant = livingLineage[k];
                                beneficiaryShares[currentDecendant] += sharesToRedistribute/NToRedistributeTo;
                            }
                        }                        
                    }
                }
            }
        } 
    }

    /**
     * This function is a special case of undoBeneficiaryDeceasedPerStirpes
     * used to reset the beneficiaries to the state at the time the trust
     * entered execution mode. This function will iterate over the the 
     * generations backwards (highest to lowest) calling
     * undoBeneficiaryDeceasedPerStirpes. 
     */
    function resetTrustBeneficiaries() public {
        // Undo beneficiaries from max generation toward progenitor
        for (uint256 i = totalGenerations; i > 1; i-- ) {
            address[] memory generationBenecificiaries = generations[i];
            // Iterate over the generation beneficiaries
            for (uint256 j = 0; j < generationBenecificiaries.length; j++) {
                address beneficiary = generationBenecificiaries[j];
                // If the beneficiary was specified deceased, undo
                if (isDeceased[beneficiary]) {
                    undoBeneficiaryDeceasedPerStirpes(beneficiary);
                }
            }
            // Now remove the generation
            delete generations[i];
        }
        // Reset the first generatrion to the original beneficiaries
        generations[1]=beneficiaries;
    }
    /**
     * This function will return the number of beneficiaries
     * in a generation who are alive or dead with decendants.
     */
    function NGenerationLivingLineage(address[] memory generation) public view returns (uint256 N) {
        N=0;
        // Create an array of state 1 & 2 for state 3 redistribution
        for (uint i=0; i < generation.length; i++) {
            address currentBeneficiary = generation[i];
            if (
                !isDeceased[currentBeneficiary] 
                ||
                hasLivingDescendants[currentBeneficiary]
            ) {
                N+=1;
            }
        }
        return N;
    }

    /// @dev returns the number of grantors
    function getBeneficiariesLength() public view returns (uint256) {
        return beneficiaries.length;
    }

  

    /// @dev iterates over beneficiary array to find passed address
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

    // /// @dev iterates over grantors array to find passed address
    // function findIsADecendant(address decendant) public view returns (bool isADecendant) {
    //     isADecendant = false;
    //     for (uint i=0; i < beneficiaries.length; i++) {
    //         if (decendant == descendants[i]) {
    //             isADecendant = true;
    //             break;
    //         }
    //     }        
    //     return isADecendant;
    // }

}
