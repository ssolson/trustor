pragma solidity 0.8.17;
// SPDX-License-Identifier: AGPL-3.0

import "./Grantor.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract contains Trustee functions
contract Trustee is Grantor {
    event SetInitialTrustee(address owner, address initialTrusteeAddress);
    event AddedSccessorTrustee(address owner, address successorTrustees, uint256 position);
    event RemovedSuccessorTrustee(address owner, address successorTrustees, uint256 newPeriod);
    event successorTrusteePeriodSet(address owner, uint256 newPeriod);
    

    address[] public initialTrustees;
    address[] public successorTrustees;

    mapping(address => uint256) public successorTrusteePosition;

    uint256 public successorTrusteePeriod; // The number of periods in weeks after each checkin
    address public activeTrustee;

    /**
     * @dev ADMIN may set initial Trustee.
     * @param initialTrusteeAddress address of trustee.
     */
    function setInitialTrustee(address initialTrusteeAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(initialTrusteeAddress != address(0), "address can not be zero address");
        // TODO: If not null revoke role
        initialTrustees.push(initialTrusteeAddress);
        grantRole(INITIAL_TRUSTEE_ROLE, initialTrusteeAddress);
        emit SetInitialTrustee(msg.sender, initialTrusteeAddress);
    }


    function addSuccessorTrustees(
        address[] memory trusteeAddresses, 
        uint256[] memory _successorTrusteePositions
      ) public onlyInitialTrustee {
        require(
            trusteeAddresses.length == _successorTrusteePositions.length, 
            "Addresses & positions must have equal length"
        );
        for (uint256 idx = 0; idx < trusteeAddresses.length; idx++) {
            // addSuccessorTrustee(trusteeAddresses[idx], _successorTrusteePositions[idx]);
            address _trusteeAddress = trusteeAddresses[idx];
            uint256 position = _successorTrusteePositions[idx];
            require(_trusteeAddress != address(0), "Trustee: address can not be zero address");
            require(!(hasRole(SUCCESSOR_TRUSTEE_ROLE, _trusteeAddress)), "Trustee: address already successor trustee");
            require(position>0, "successor_position cannot be the default value" );

            successorTrustees.push(_trusteeAddress);
            successorTrusteePosition[_trusteeAddress] = position;
            _grantRole(SUCCESSOR_TRUSTEE_ROLE, _trusteeAddress);
            emit AddedSccessorTrustee(msg.sender, _trusteeAddress, position);
        }
    }


    /// @dev iterates over grantors array to find passed address
    function findIsATrustee(address _trustee) public view returns (bool isATrustee) {
        isATrustee = false;
        for (uint i=0; i < successorTrustees.length; i++) {
            if (_trustee == successorTrustees[i]) {
                isATrustee = true;
                break;
            }
        }        
        return isATrustee;
    }


    /**
     * @notice Set Period in weeks between succsor trustees
     */
    function setSuccessorPeriod(uint256 newPeriod) public onlyInitialTrustee {
        require(newPeriod >= 1, "New period must be an integer greater than 0");
        require(newPeriod <= 8, "New period must be an integer less than 36");
        successorTrusteePeriod = newPeriod * 1 weeks;
        emit successorTrusteePeriodSet(msg.sender, newPeriod);
    }

    function initialTrusteeRemoveSuccessorTrustee(address _grantorAddress) external onlyInitialTrustee {
        _removeSuccessorTrustee(_grantorAddress);
    }


    /**
    * @dev Initial Trustee may remove a successor Trustee.
    * Removing a Grantor will burn its tokens, revoke the GRANTOR_ROLE, insure assests assigned are false.
    * If there are no more grantors then the state mut go to Inactive 
    * @param _successorTrusteeAddress address of trustee to remove.
    */
    function _removeSuccessorTrustee(address _successorTrusteeAddress) internal {
        require(successorTrustees.length>1, "Cannot remove last successor trustee. Please add replacement before removal.");

        for (
            uint256 idx = 0;
            idx < successorTrustees.length;
            idx++
        ) {
            if(_successorTrusteeAddress == successorTrustees[idx]){
                successorTrustees[idx] = successorTrustees[successorTrustees.length - 1];
                successorTrustees.pop(); 
                
                if (_msgSender() == _successorTrusteeAddress) {
                    renounceRole(SUCCESSOR_TRUSTEE_ROLE, _successorTrusteeAddress);  
                } else {
                    revokeRole(SUCCESSOR_TRUSTEE_ROLE, _successorTrusteeAddress); 
                }

                emit RemovedSuccessorTrustee(
                    _msgSender(), 
                    _successorTrusteeAddress, 
                    successorTrusteePosition[_successorTrusteeAddress]
                );

            }
        }
    }


    function removeActiveTrustee() external onlyRole(SUCCESSOR_TRUSTEE_ROLE) {
        require(
            block.timestamp > getActiveTrusteeExpirationTime(), 
            "Active trustee has not been inactive long enough."
        );
        _revokeRole(ACTIVE_TRUSTEE_ROLE, activeTrustee);
        activeTrustee = address(0);
        trustState = TrustStates.Active;
    }


    function getActiveTrusteeExpirationTime() public view returns(uint256) {
        return activeTrusteeLastCheckInTime + successorTrusteePeriod;
    }

    /**
     * [3.5] If a beneficiary predeceases the Grantor, the beneficiary’s
     *  share shall be distributed [pro rata to the other beneficiaries
     *  designated in this trust; or per stirpes/per capita to the
     *  descendants of the beneficiary.
     */

    /**
     * @notice transfers fungibles to the beneficiaries
     */
    function releaseAssets() 
      public 
      onlyRole(ACTIVE_TRUSTEE_ROLE) 
      isState(TrustStates.Executing) {
        trustState = TrustStates.Executed;
    }

    /// @dev returns the number of trustees
    function getSuccessorTrusteeLength() public view returns (uint256) {
        return successorTrustees.length;
    }
}
