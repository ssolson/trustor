const { use, expect} = require("chai");
const hre = require("hardhat");
// const { ethers } = hre;

const { ethers } = require("hardhat")
// const { ethers } = require("@nomiclabs/hardhat-ethers");

const { time } = require("@nomicfoundation/hardhat-network-helpers");


const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const GRANTOR_ROLE = ethers.utils.id("GRANTOR_ROLE");
const INITIAL_TRUSTEE_ROLE = ethers.utils.id("INITIAL_TRUSTEE_ROLE");
const SUCCESSOR_TRUSTEE_ROLE = ethers.utils.id("SUCCESSOR_TRUSTEE_ROLE");
const BENEFICIARY_ROLE = ethers.utils.id("BENEFICIARY_ROLE");

describe("🚩 🏵 Simple Trust Roles 🤖", async function () {


  async function deployFixture() {

    const [
      InitialTrustee, 
      Grantor2, 
      SuccessorTrustee1, 
      SuccessorTrustee2, 
      Beneficiary1, 
      Beneficiary2,
    ] = await ethers.getSigners();


    const Name = "Trust Steve Living Trust";
    const InitialTrusteeAddress = InitialTrustee.address;
    const CheckInPeriod = 2
    const Grantors = [InitialTrustee.address, Grantor2.address];
    const SuccessorTrustees = [SuccessorTrustee1.address, SuccessorTrustee2.address];
    const SuccessorTrusteePositions = [0,1]
    const SuccessorTrusteePeriod = 2
    const Beneficiary = [Beneficiary1.address, Beneficiary2.address];
    const Shares = [75, 25];

    let argz = [
      Name, 
      InitialTrusteeAddress, 
      CheckInPeriod,
      Grantors, 
      SuccessorTrustees, 
      SuccessorTrusteePositions, 
      SuccessorTrusteePeriod, 
      Beneficiary, 
      Shares
    ];

    const SimpleT = await ethers.getContractFactory("SimpleT");
    const simpleT = await SimpleT.deploy(...argz);

    const wallets = {
      InitialTrustee: InitialTrustee, 
      Grantor2: Grantor2, 
      SuccessorTrustee1: SuccessorTrustee1, 
      SuccessorTrustee2: SuccessorTrustee2, 
      Beneficiary1: Beneficiary1, 
      Beneficiary2: Beneficiary2,
    }

    return { wallets, simpleT }
  };


  describe('Has Role', () => {
    it('Grantor Role', async () => {
      const { wallets, simpleT } = await deployFixture();

      const hasRoleResult = await simpleT.hasRole(GRANTOR_ROLE, wallets['Grantor2'].address);
      expect(hasRoleResult).to.equal(true);
    });  

    // it('Trustee Role', async () => {
    //   const hasRoleResult = await simpleT.hasRole(SUCCESSOR_TRUSTEE_ROLE, SuccessorTrustee1.address);
    //   expect(hasRoleResult).to.equal(true);
    // });
  });

  describe('Check Roles', () => {
    
    let randAddress=ethers.Wallet.createRandom().address;
    let addressNames2Roles = {
      'InitialTrustee': [DEFAULT_ADMIN_ROLE, INITIAL_TRUSTEE_ROLE, GRANTOR_ROLE],
      // 'InitialTrustee': [INITIAL_TRUSTEE_ROLE, GRANTOR_ROLE],
      'Grantor2': [GRANTOR_ROLE],
      'SuccessorTrustee1': [SUCCESSOR_TRUSTEE_ROLE],
      'SuccessorTrustee1': [SUCCESSOR_TRUSTEE_ROLE],
      'Beneficiary1': [BENEFICIARY_ROLE],
      'Beneficiary2': [BENEFICIARY_ROLE],
    };

    const addressNames = Object.keys(addressNames2Roles);
    addressNames.forEach((addressName) => {
      let roles = addressNames2Roles[addressName];
      roles.forEach((role) => {

        it(`${addressName} is ${role}`, async () => {
          const { wallets, simpleT } = await deployFixture();
          const hasRoleResult = await simpleT.hasRole(role,  wallets[addressName].address);
          expect(hasRoleResult).to.equal(true);          
        });  
      });
    });
  })
  
});