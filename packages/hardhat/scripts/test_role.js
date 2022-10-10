const { use, expect} = require("chai");
const hre = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");


console.log("YOU ARE HERE");

describe("🚩 🏵 Simple Trust Roles 🤖", async function () {

  let InitialTrustee;
  let Grantor2;
  let SuccessorTrustee1; 
  let SuccessorTrustee2;
  let Beneficiary1; 
  let Beneficiary2;

  let simpleT;

  let GRANTOR_ROLE = ethers.utils.id("GRANTOR_ROLE");
  let SUCCESSOR_TRUSTEE_ROLE = ethers.utils.id("SUCCESSOR_TRUSTEE_ROLE");

  [
    InitialTrustee, 
    Grantor2, 
    SuccessorTrustee1, 
    SuccessorTrustee2, 
    Beneficiary1, 
    Beneficiary2,
  ] = await ethers.getSigners();


  // Input arguments
  [
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

  // console.log('\t', 'Address', Grantor.address);
  // Combine inputs to pass to constructor
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
  const deploySimpleT = await SimpleT.deploy(argz);

);

  // describe('Has Role', () => {
  //   it('Grantor Role', async () => {
  //     const hasRoleResult = await simpleT.hasRole(GRANTOR_ROLE, Grantor2.address);
  //     expect(hasRoleResult).to.equal(true);
  //   });  

  //   it('Trustee Role', async () => {
  //     const hasRoleResult = await simpleT.hasRole(SUCCESSOR_TRUSTEE_ROLE, SuccessorTrustee1.address);
  //     expect(hasRoleResult).to.equal(true);
  //   });
  // });


// describe('Only Grantor Role', () => {
  // let randAddress=ethers.Wallet.createRandom().address;
  // let grantorFuncs = {
  //   // 'checkIn': [null], 
  //   'setPeriods': [1],
  //   'addGrantor': [ethers.Wallet.createRandom().address],
  //   // 'resetGrantor': [null],
  //   // 'addERC20ToTrust': [ethers.Wallet.createRandom().address],
  //   'addTrustee': [randAddress],
  //   'removeTrustee': [randAddress],
  //   'resetTrustees': [null],
  //   'setBeneficiaries': [[randAddress], [100]],
  // };

  // const keys = Object.keys(grantorFuncs);
  // keys.forEach((func) => {
  //   let argz = grantorFuncs[func];

  //   it(`${func} Correct Role`, async () => {
  //     await expect(
  //       simpleT.connect(Grantor)[ func ](...argz))
  //       .to.be.ok;
  //   });  

  //   it(`${func} Incorrect Role`, async () => {
  //     await expect(
  //       simpleT.connect(Trustee)[ func ](...argz))
  //       .to.be.reverted;
  //       // The line below does not work due to mixed capitalization between expected and returned
  //       //.to.be.revertedWith(`AccessControl: account ${Trustee.address} is missing role ${GRANTOR_ROLE}`);
  //   });
  // });
// })

  // describe('Only Trustee Role', (Percentages) => {      
  //   let trusteeFuncs = {
  //     'releaseAssets': [null],
  //     // 'executeTrust': [null], 
  //   };

  //   const keys = Object.keys(trusteeFuncs);
  //   keys.forEach((func) => {
  //     let argz = trusteeFuncs[func];

  //     it(`${func} Correct Role`, async () => {
  //       await expect(
  //         simpleT.connect(Trustee)[ func ](...argz))
  //         .to.be.ok;
  //     });  

  //     it(`${func} Incorrect Role`, async () => {
  //       await expect(
  //         simpleT.connect(Grantor)[ func ](...argz))
  //         .to.be.reverted;
  //     });
  //   });
  // });

