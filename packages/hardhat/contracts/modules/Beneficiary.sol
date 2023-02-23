pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "../interfaces/IBeneficiary.sol";

// import "../mixins/TrusteeMixin.sol";
import "../mixins/CheckInMixin.sol";
import "../mixins/BeneficiaryMixin.sol";


/// @title Simple T
/// @author sters.eth
/// @notice Contract will has functions for Beneficiaries


contract Beneficiary is CheckInMixin, BeneficiaryMixin, IBeneficiary {

    /// @dev returns array of addresses with beneficiaries
    function getBeneficiaries() external view returns (address[] memory) {
        return _initializableStore().beneficiaries;
    }


    /// @dev returns array of addresses with beneficiaries shares
    function getBeneficiaryShares(address _addr) external view returns (uint256) {
        return _initializableStore().beneficiaryShares[_addr];
    }

    /// @dev returns array of addresses with beneficiaries
    function getTotalShares() external view returns (uint256) {
        return _initializableStore().totalShares;
    }

    /**
     * @dev Trustee will finalize beneficiary addresses.
     * @param _beneficiaries ordered array addresses of the beneficiary.
     * @param shares_ ordered array of shares associated with the beneficiary.
     */
    function setBeneficiaries(address[] memory _beneficiaries, uint256[] memory shares_)
        external
        // isState(TrustStates.Active)
        onlyRole(_initializableStore().INITIAL_TRUSTEE_ROLE) {
        
        require(
            _beneficiaries.length > 0,
            "Beneficiary: At least 1 beneficiary must be specified."
        );

        require(
            _beneficiaries.length == shares_.length,
            "Beneficiary: beneficiaries and shares must have equal length."
        );

        _setBeneficiaries(_beneficiaries, shares_);
    }


    function adminRemoveBeneficiary(address beneficiaryAddress) external onlyInitialTrustee {
        _removeBeneficiary(beneficiaryAddress);
    }


    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function claim() 
        external 
        onlyRole(_initializableStore().BENEFICIARY_ROLE) 
        // TODO: MUST REINSTATE
        // isState(TrustStates.Executed) 
        {
            // require(
            //     trustState == TrustStates.Executing, 
            //     "Trust is not in the expected TrustState"
            // );
        require(_initializableStore().beneficiaryShares[msg.sender] > 0, "SimpleT: account has no shares");
        require( !(_initializableStore().beneficiaryHasClaimed[msg.sender]) , "SimpleT: Beneficary has already claimed");
        
        uint256 totalTokens = _initializableStore().grantors.length;
        uint256[] memory tokenIds = new uint256[](totalTokens);
        uint256[] memory amounts = new uint256[](totalTokens);

        uint256 shares = _initializableStore().beneficiaryShares[msg.sender];

        // Iterate over Grantor wallets to get 1155 token IDs
        for (uint256 i = 0; i < totalTokens; i++) {
            
            address grantorAddress = _initializableStore().grantors[i];
            if (_initializableStore().assignedAssets[grantorAddress]) {
                uint256 tokenId = _initializableStore()._tokenIds[grantorAddress];
                tokenIds[i] = tokenId;
                amounts[i] = _initializableStore().TOKENS_PER_GRANTOR * shares / _initializableStore().totalShares;
            }
        }
        _initializableStore().beneficiaryHasClaimed[msg.sender] = true;
        _safeBatchTransferFrom(address(this), msg.sender, tokenIds, amounts, "");
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
        // isDistribution(DistributionTypes.proRata) 
        {
        require(findIsABeneficiary(beneficiary), "Passed address is not a current beneficiary" );
        
        // Determine LCD
        uint256 NToRedistributeTo = _initializableStore().beneficiaries.length - 1;
        // Multiply all shares by LCD
        _initializableStore().totalShares *= NToRedistributeTo;
        // Add to all other Beneficiary shares
        uint256 sharesToRedistribute = _initializableStore().beneficiaryShares[beneficiary];
        // Add beneficiary to list of deceased beneficiaries
        // deceasedBeneficiaries.push(beneficiary);
        // Remove beneficary so that no longer included in bene list
        _activeTrusteeRemoveBeneficiary(beneficiary);
        // Iterate over remaining beneficiaries and increase their shares
        for (uint i=0; i < _initializableStore().beneficiaries.length; i++) {
            address currentBeneficiary = _initializableStore().beneficiaries[i];
            uint256 currentShares = _initializableStore().beneficiaryShares[currentBeneficiary];
            _initializableStore().beneficiaryShares[currentBeneficiary] = (
                NToRedistributeTo * currentShares
                ) + sharesToRedistribute;
        }   
        emit BeneficiaryUpdatedProRata(
            msg.sender, 
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
        _initializableStore().isDeceased[deadBeneficiary] = true;

        // Check if descendants were specified
        if (beneficiaryDescendants.length > 0) {
            _initializableStore().hasLivingDescendants[deadBeneficiary] = true;
            uint256 previousGeneration = _initializableStore().beneficiaryGeneration[deadBeneficiary];
            uint256 descendantGeneration = previousGeneration+1;
            if (descendantGeneration>_initializableStore().totalGenerations) {
                _initializableStore().totalGenerations = descendantGeneration;
            }

            // If descendants are specified iterate over and add to descendants list
            for (uint i=0; i < beneficiaryDescendants.length; i++) {
                address newBeneficiary = beneficiaryDescendants[i];
                // Specify Descendant's generation
                _initializableStore().beneficiaryGeneration[newBeneficiary]=descendantGeneration;
                // Add descendant to generational list of descendants
                _initializableStore().generations[descendantGeneration].push(newBeneficiary);
                // Descendants specific to a progenator
                _initializableStore().descendants[deadBeneficiary].push(newBeneficiary);                        

                // Specify the progenitor of the descendant
                _initializableStore().descendantsProgenitor[newBeneficiary] = deadBeneficiary;
            }
        } else {
            // Default is false so the following line should be removed in the future
            _initializableStore().hasLivingDescendants[deadBeneficiary] = false;
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
            _initializableStore().isDeceased[deadBeneficiary],
            "Beneficiary not specified as dead. Cannot undo."
        );

        // Set the Beneficiary to deceased
        _initializableStore().isDeceased[deadBeneficiary] = false;

        // Check if descendants were specified
        if (_initializableStore().hasLivingDescendants[deadBeneficiary]) {
            uint256 previousGeneration = _initializableStore().beneficiaryGeneration[deadBeneficiary];
            uint256 descendantGeneration = previousGeneration+1;

            // Remove descendants
            for ( uint256 i=0;  i < _initializableStore().descendants[deadBeneficiary].length; i++ ) {
                address descendantToRemove = _initializableStore().descendants[deadBeneficiary][i];
                require(
                    !_initializableStore().isDeceased[descendantToRemove],
                    "A descendant has been marked deceased. Must undo 2nd gen descendands before previous gen."
                );
                // Reset progenitor & generation
                _initializableStore().descendantsProgenitor[descendantToRemove] = address(0);
                _initializableStore().beneficiaryGeneration[descendantToRemove]=0;

                for (
                    uint256 j = 0;
                    j < _initializableStore().generations[descendantGeneration].length;
                    j++
                    ) {
                        if (descendantToRemove == _initializableStore().generations[descendantGeneration][j]){
                            _initializableStore().generations[descendantGeneration][j] = _initializableStore().generations[descendantGeneration][_initializableStore().generations[descendantGeneration].length - 1];
                            _initializableStore().generations[descendantGeneration].pop();             
                    }
                }
            }
            // Beneficiary no longer has decendants
            _initializableStore().hasLivingDescendants[deadBeneficiary] = false;
            // Delete the dead beneficiary's descendants
            delete _initializableStore().descendants[deadBeneficiary];

            
        } else {
            // Default is false so the following line should be removed in the future
            _initializableStore().hasLivingDescendants[deadBeneficiary] = false;
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
        for (uint i=1; i < _initializableStore().totalGenerations+1; i++) {
            address[] memory genBeneficiaries = _initializableStore().generations[i];
            // Create an array of state 1 & 2 for state 3 redistribution
            uint256 N = NGenerationLivingLineage(genBeneficiaries);
            address[] memory livingLineage = new address[](N);
            for (uint j=0; j < N; j++) {
                address currentBeneficiary = genBeneficiaries[j];
                if (
                 !_initializableStore().isDeceased[currentBeneficiary] 
                 ||
                 _initializableStore().hasLivingDescendants[currentBeneficiary]
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
                if (_initializableStore().isDeceased[currentBeneficiary]) {
                    // Remove the current Beneficiary from the generation 
                    uint256 sharesToRedistribute = _initializableStore().beneficiaryShares[currentBeneficiary];

                    // If they have living descendants redistribute shares to descendants (living & dead)
                    // Shares to dead desceandants will be redistributed at next generation
                    if (_initializableStore().hasLivingDescendants[currentBeneficiary]) {
                        address[] memory currentDescendants = _initializableStore().descendants[currentBeneficiary];
                        uint256 NToRedistributeTo = currentDescendants.length;
                        // Set the beneficiary shares to zero
                        _initializableStore().beneficiaryShares[currentBeneficiary]=0;
                        // Iterate and redistribute
                        for (uint k=0; k < currentDescendants.length; k++) {
                            address currentDecendant = currentDescendants[k];
                            _initializableStore().beneficiaryShares[currentDecendant] += sharesToRedistribute/NToRedistributeTo;
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
                                _initializableStore().beneficiaryShares[currentDecendant] += sharesToRedistribute/NToRedistributeTo;
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
        for (uint256 i = _initializableStore().totalGenerations; i > 1; i-- ) {
            address[] memory generationBenecificiaries = _initializableStore().generations[i];
            // Iterate over the generation beneficiaries
            for (uint256 j = 0; j < generationBenecificiaries.length; j++) {
                address beneficiary = generationBenecificiaries[j];
                // If the beneficiary was specified deceased, undo
                if (_initializableStore().isDeceased[beneficiary]) {
                    undoBeneficiaryDeceasedPerStirpes(beneficiary);
                }
            }
            // Now remove the generation
            delete _initializableStore().generations[i];
        }
        // Reset the first generatrion to the original beneficiaries
        _initializableStore().generations[1]=_initializableStore().beneficiaries;
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
                !_initializableStore().isDeceased[currentBeneficiary] 
                ||
                _initializableStore().hasLivingDescendants[currentBeneficiary]
            ) {
                N+=1;
            }
        }
        return N;
    }

    /// @dev returns the number of grantors
    function getBeneficiariesLength() public view returns (uint256) {
        return _initializableStore().beneficiaries.length;
    }

  
    /// @dev iterates over beneficiary array to find passed address
    function findIsABeneficiary(address _beneficiary) public view returns (bool isABeneficiary) {
        isABeneficiary = false;
        for (uint i=0; i < _initializableStore().beneficiaries.length; i++) {
            if (_beneficiary == _initializableStore().beneficiaries[i]) {
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
