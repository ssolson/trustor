pragma solidity 0.8.17;
// SPDX-License-Identifier: MIT

import "./Roles.sol";

/// @title Simple T
/// @author sters.eth
/// @notice Contract conntains Trustee functions
abstract contract Trustee is Roles {
    /**  @dev Inital trustee */
    address public trustee;

    /**  @dev Array of trustees */
    address[] public trustees;

    /**  @dev The number of periods after each checkin */
    uint128 public successorTrusteePeriod;

    event SetInitialTrustee(address owner, address trusteeAddress);
    event AddedSccessorTrustee(address owner, address trusteeAddress);
    event RemovedTrustee(address owner, address trusteeAddress);
    event ResetTrustees(address owner);
    event successorTrusteePeriodSet(address owner, uint128 newPeriod);


    /**
     * @dev ADMIN may set initial Trustee.
     * @param initialTrusteeAddress address of trustee.
     */
    function setInitialTrustee(address initialTrusteeAddress) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(initialTrusteeAddress != address(0), "address can not be zero address");
        // TODO: If not null revoke role         
        trustee = initialTrusteeAddress;
        grantRole(INITIAL_TRUSTEE_ROLE, initialTrusteeAddress);
        emit SetInitialTrustee(msg.sender, initialTrusteeAddress);
    }


    function addSuccessorTrustees(address[] memory trusteeAddresses) public onlyRole(INITIAL_TRUSTEE_ROLE) {
        for (uint256 idx = 0; idx < trusteeAddresses.length; idx++) {
            addSuccessorTrustee(trusteeAddresses[idx]);
        }
    }

    /**
     * @dev Owner may add addresses as Trustees.
     * @param trusteeAddress address of trustee.
     */
    function addSuccessorTrustee(address trusteeAddress) public onlyRole(INITIAL_TRUSTEE_ROLE) {
        require(trusteeAddress != address(0), "address can not be zero address");
        trustees.push(trusteeAddress);
        grantRole(SUCCESSOR_TRUSTEE_ROLE, trusteeAddress);
        emit AddedSccessorTrustee(msg.sender, trusteeAddress);
    }


    /**
     * @notice Set Period in weeks between succsor trustees
     */
    function setSuccessorPeriod(uint128 newPeriod) public onlyRole(INITIAL_TRUSTEE_ROLE) {
        require(newPeriod >= 1, "New period must be an integer greater than 0");
        require(newPeriod <= 36, "New period must be an integer less than 36");
        successorTrusteePeriod = newPeriod;
        emit successorTrusteePeriodSet(msg.sender, newPeriod);
    }


    /**
     * @dev Owner may remove an address from Trustees.
     * [2.1.5] A Successor Trustee that has been removed must be replaced within 30 days of removal
     * by an Independent Trustee who qualifies as such under Section 672(c) of the Internal
     * Revenue Code of the United States.
     * [2.1.6] Notice of Successor Trustee removal and subsequent replacement by an Independent Trustee
     * must be in writing, published along with this trust in the form of an amendment, and must
     * state the date of removal.
     * @param trusteeAddress address of trustee.
     */
    function removeTrustee(address trusteeAddress) external onlyRole(INITIAL_TRUSTEE_ROLE) {
        // TODO: REMOVE TRUSTEE ROLE
        for (uint256 idx = 0; idx < trustees.length; idx++) {
            if (trusteeAddress == trustees[idx]) {
                if (trustees.length == 1) {
                    resetTrustees();
                } else {
                    trustees[idx] = trustees[trustees.length - 1];
                    trustees.pop(); // Remove the last element
                    emit RemovedTrustee(msg.sender, trusteeAddress);
                }
            }
        }
    }

    /// @dev deletes all address from trustees
    function resetTrustees() public onlyRole(INITIAL_TRUSTEE_ROLE) {
        delete trustees;
        emit ResetTrustees(msg.sender);
    }

    /// @dev returns array of addresses with active stakers
    function getTrustee() external view returns (address[] memory) {
        return trustees;
    }

    /**
     * [3.5] If a beneficiary predeceases the Grantor, the beneficiary’s
     *  share shall be distributed [pro rata to the other beneficiaries
     *  designated in this trust; or per stirpes/per capita to the
     *  descendants of the beneficiary.
     */
}
