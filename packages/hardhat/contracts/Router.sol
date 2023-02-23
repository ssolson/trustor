//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------
// GENERATED CODE - do not edit manually!!
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------

contract Router {
    error UnknownSelector(bytes4 sel);

    address private constant _ACCESS_CONTROL = 0x132F7D9033b28B08cbc520e1cfD83c6dA3abfA36;
    address private constant _BENEFICIARY = 0xB719422a0A484025c1A22a8dEEaFC67E81F43CfD;
    address private constant _CHECK_IN = 0xA199e7ab96BF9DF52C52eb7BAb5572789a726d33;
    address private constant _ERC1155 = 0xF978b011bcf604b201996FEb3E53eD3D52F0A90F;
    address private constant _GRANTOR = 0x8233369E29653b70E50E93d1276a50B8f2122a01;
    address private constant _INITIALIZE = 0x6B99600daD0a1998337357696827381D122825F3;
    address private constant _TRUSTEE = 0xBA6BfBa894B5cAF04c3462A5C8556fFBa4de6782;

    fallback() external payable {
        _forward();
    }

    receive() external payable {
        _forward();
    }

    function _forward() internal {
        // Lookup table: Function selector => implementation contract
        bytes4 sig4 = msg.sig;
        address implementation;

        assembly {
            let sig32 := shr(224, sig4)

            function findImplementation(sig) -> result {
                if lt(sig,0x7a881006) {
                    if lt(sig,0x36568abe) {
                        if lt(sig,0x17314d99) {
                            switch sig
                            case 0x00fdd58e { result := _ERC1155 } // ERC1155.balanceOf()
                            case 0x01ffc9a7 { result := _ERC1155 } // ERC1155.supportsInterface()
                            case 0x0509e1a5 { result := _BENEFICIARY } // Beneficiary.getBeneficiaryShares()
                            case 0x065dc4c1 { result := _BENEFICIARY } // Beneficiary.setBeneficiaries()
                            case 0x09494bce { result := _TRUSTEE } // Trustee.setInitialTrustee()
                            case 0x0de86e25 { result := _GRANTOR } // Grantor.getGrantorsTokenID()
                            case 0x0e89341c { result := _ERC1155 } // ERC1155.uri()
                            case 0x0fb91e2a { result := _BENEFICIARY } // Beneficiary.redistributeDeadWithNoDescendantPerStirpes()
                            leave
                        }
                        switch sig
                        case 0x17314d99 { result := _GRANTOR } // Grantor.findIsAGrantor()
                        case 0x2160027a { result := _BENEFICIARY } // Beneficiary.findIsABeneficiary()
                        case 0x248a9ca3 { result := _ACCESS_CONTROL } // AccessControl.getRoleAdmin()
                        case 0x29f3e8a6 { result := _GRANTOR } // Grantor.grantorRemoveSelf()
                        case 0x2eb2c2d6 { result := _ERC1155 } // ERC1155.safeBatchTransferFrom()
                        case 0x2f2d87d2 { result := _GRANTOR } // Grantor.addGrantors()
                        case 0x2f2ff15d { result := _ACCESS_CONTROL } // AccessControl.grantRole()
                        case 0x34d640ef { result := _TRUSTEE } // Trustee.getSuccessorTrusteePosition()
                        leave
                    }
                    if lt(sig,0x50894f25) {
                        switch sig
                        case 0x36568abe { result := _ACCESS_CONTROL } // AccessControl.renounceRole()
                        case 0x37f26e68 { result := _TRUSTEE } // Trustee.getSuccessorTrusteePeriod()
                        case 0x3d8f89a7 { result := _GRANTOR } // Grantor.setDistribution()
                        case 0x3dbc18e8 { result := _TRUSTEE } // Trustee.getActiveTrustee()
                        case 0x43ae41d8 { result := _INITIALIZE } // Initialize.testEnum()
                        case 0x4a590b34 { result := _CHECK_IN } // CheckIn.activeTrusteeCheckInNow()
                        case 0x4e1273f4 { result := _ERC1155 } // ERC1155.balanceOfBatch()
                        case 0x4e71d92d { result := _BENEFICIARY } // Beneficiary.claim()
                        leave
                    }
                    switch sig
                    case 0x50894f25 { result := _CHECK_IN } // CheckIn.returnTrustState()
                    case 0x53f90910 { result := _TRUSTEE } // Trustee.initialTrusteeRemoveSuccessorTrustee()
                    case 0x5e26184a { result := _BENEFICIARY } // Beneficiary.getBeneficiariesLength()
                    case 0x609d356d { result := _GRANTOR } // Grantor.assignAssetsToTrust()
                    case 0x62c1f194 { result := _TRUSTEE } // Trustee.initiateTrustExecution()
                    case 0x64412658 { result := _GRANTOR } // Grantor.getGrantorsLength()
                    case 0x6f3c19b8 { result := _TRUSTEE } // Trustee.addSuccessorTrustees()
                    case 0x7a6ae541 { result := _TRUSTEE } // Trustee.openClaims()
                    leave
                }
                if lt(sig,0xbc197c81) {
                    if lt(sig,0x91d14854) {
                        switch sig
                        case 0x7a881006 { result := _TRUSTEE } // Trustee.findIsATrustee()
                        case 0x801b0fb7 { result := _CHECK_IN } // CheckIn.getLastCheckInTime()
                        case 0x8165acf5 { result := _INITIALIZE } // Initialize.initializeInitializableModule()
                        case 0x844aba12 { result := _GRANTOR } // Grantor.adminRemoveGrantor()
                        case 0x86a20491 { result := _GRANTOR } // Grantor.returnDistributionType()
                        case 0x8ae4f752 { result := _CHECK_IN } // CheckIn.getCheckInPeriod()
                        case 0x9126a790 { result := _BENEFICIARY } // Beneficiary.adminRemoveBeneficiary()
                        case 0x913b722c { result := _BENEFICIARY } // Beneficiary.getBeneficiaries()
                        leave
                    }
                    switch sig
                    case 0x91d14854 { result := _ACCESS_CONTROL } // AccessControl.hasRole()
                    case 0x9630c750 { result := _CHECK_IN } // CheckIn.checkInNow()
                    case 0xa1b5203a { result := _BENEFICIARY } // Beneficiary.undoBeneficiaryDeceasedPerStirpes()
                    case 0xa22cb465 { result := _ERC1155 } // ERC1155.setApprovalForAll()
                    case 0xa42a43de { result := _TRUSTEE } // Trustee.setSuccessorPeriod()
                    case 0xadfd473d { result := _TRUSTEE } // Trustee.removeActiveTrustee()
                    case 0xaf136dea { result := _CHECK_IN } // CheckIn.setCheckInPeriod()
                    case 0xb0795721 { result := _BENEFICIARY } // Beneficiary.NGenerationLivingLineage()
                    leave
                }
                if lt(sig,0xe3d08e18) {
                    switch sig
                    case 0xbc197c81 { result := _ERC1155 } // ERC1155.onERC1155BatchReceived()
                    case 0xc9129e89 { result := _BENEFICIARY } // Beneficiary.resetTrustBeneficiaries()
                    case 0xcad66a5e { result := _GRANTOR } // Grantor.getTokensPerGrantor()
                    case 0xd09dae64 { result := _BENEFICIARY } // Beneficiary.beneficiaryDeceasedProRata()
                    case 0xd5002f2e { result := _BENEFICIARY } // Beneficiary.getTotalShares()
                    case 0xd547741f { result := _ACCESS_CONTROL } // AccessControl.revokeRole()
                    case 0xdad72af9 { result := _TRUSTEE } // Trustee.getActiveTrusteeExpirationTime()
                    case 0xe23a845a { result := _CHECK_IN } // CheckIn.getExpirationTime()
                    leave
                }
                switch sig
                case 0xe3d08e18 { result := _BENEFICIARY } // Beneficiary.beneficiaryDeceasedPerStirpes()
                case 0xe985e9c5 { result := _ERC1155 } // ERC1155.isApprovedForAll()
                case 0xf23a6e61 { result := _ERC1155 } // ERC1155.onERC1155Received()
                case 0xf242432a { result := _ERC1155 } // ERC1155.safeTransferFrom()
                case 0xf94ff84c { result := _TRUSTEE } // Trustee.getSuccessorTrusteeLength()
                case 0xfab73602 { result := _TRUSTEE } // Trustee.getDEDHash()
                case 0xfd393dd9 { result := _INITIALIZE } // Initialize.isInitializableModuleInitialized()
                leave
            }

            implementation := findImplementation(sig32)
        }

        if (implementation == address(0)) {
            revert UnknownSelector(sig4);
        }

        // Delegatecall to the implementation contract
        assembly {
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)
            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }
}
