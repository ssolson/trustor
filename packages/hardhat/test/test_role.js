//
// this script executes when you run 'yarn test'
//
// you can also test remote submissions like:
// yarn test --network rinkeby
//
// you can even run mint commands if the tests pass like:
// yarn test && echo "PASSED" || echo "FAILED"
//

const hre = require("hardhat");
const { ethers } = hre;
const { use, expect} = require("chai");
const { solidity } = require("ethereum-waffle");
// const { Contract, utils, BigNumber } = require("ethers");


use(solidity);

describe("🚩 🏵 Simple Trust Roles 🤖", async () => {
  let Grantor;
  let Trustor;
  let Beneficiary1;
  let Beneficiary2;
  let Beneficiary3;

  let usdcToken;
  let simpleT;

  let GRANTOR_ROLE = ethers.utils.id("GRANTOR_ROLE");
  let TRUSTEE_ROLE = ethers.utils.id("TRUSTEE_ROLE");

  [Grantor, Trustee, Beneficiary1, Beneficiary2, Beneficiary3] = await ethers.getSigners();


  USDC_TOKEN_ADDRESS=false;
  if(USDC_TOKEN_ADDRESS){
    // live contracts, token already deployed
  }else{
    const USDCToken = await ethers.getContractFactory("USDC");
    usdcToken = await USDCToken.deploy();
  }


  TRUST_ADDRESS=false;
  if(TRUST_ADDRESS){
    // const VENDOR_ADDRESS="0x990a5f26adce840e63B51A72d83EF08b02005dAC" 
      vendor = await ethers.getContractAt("CrownVendor",VENDOR_ADDRESS);
      // console.log(`\t`,"🛰 Connected to:",vendor.address)

      // console.log(`\t`,"📡 Loading the yourToken address from the Vendor...")
      // console.log(`\t`,"⚠️ Make sure *yourToken* is public in the Vendor.sol!")
      // let tokenAddress = await vendor.yourToken();
      // console.log('\t',"🏷 Token Address:",tokenAddress)

      // yourToken = await ethers.getContractAt("YourToken",tokenAddress);
      // console.log(`\t`,"🛰 Connected to YourToken at:",yourToken.address)

  } else {
      // Input arguments
      [Grantor, Trustee, Beneficiary1, Beneficiary2, Beneficiary3] = await ethers.getSigners();
      const Beneficiary = [Beneficiary1.address, Beneficiary2.address];
      const Percentages = [75,25];

      // console.log('\t', 'Address', Grantor.address);

      // Deploy the Contract
      const SimpleT = await ethers.getContractFactory("SimpleT");
      simpleT = await SimpleT.deploy(
        Grantor.address, 
        Trustee.address, 
        Beneficiary, 
        Percentages);     

      // console.log('\t', "Transferring $100 USDC tokens to the grantor...")
      const transferTokensResult2 = await usdcToken.transfer(
        Grantor.address,
        ethers.utils.parseUnits("100", 6)
      );
      const ttxResult2 =  await transferTokensResult2.wait()
      expect(ttxResult2.status).to.equal(1);
  }         


describe('Has Role', () => {
  it('Grantor Role', async () => {
    const hasRoleResult = await simpleT.hasRole(GRANTOR_ROLE, Grantor.address);
    expect(hasRoleResult).to.equal(true);
  });  

  it('Trustee Role', async () => {
    const hasRoleResult = await simpleT.hasRole(TRUSTEE_ROLE, Trustee.address);
    expect(hasRoleResult).to.equal(true);
  });
});


describe('Only Grantor Role', () => {
  let randAddress=ethers.Wallet.createRandom().address;
  let grantorFuncs = {
    'checkIn': [null], 
    'setPeriods': [1],
    'addGrantor': [ethers.Wallet.createRandom().address],
    'resetGrantor': [null],
    'addERC20ToTrust': [ethers.Wallet.createRandom().address],
    'addTrustee': [randAddress],
    'removeTrustee': [randAddress],
    'resetTrustees': [null],
    'setBeneficiaries': [[randAddress], [100]],

  };

  const keys = Object.keys(grantorFuncs);
  keys.forEach((func) => {
    let argz = grantorFuncs[func];

    it(`${func} Correct Role`, async () => {
      await expect(
        simpleT.connect(Grantor)[ func ](...argz))
        .to.be.ok;
    });  

    it(`${func} Incorrect Role`, async () => {
      await expect(
        simpleT.connect(Trustee)[ func ](...argz))
        .to.be.reverted;
        // The line below does not work due to mixed capitalization between expected and returned
        //.to.be.revertedWith(`AccessControl: account ${Trustee.address} is missing role ${GRANTOR_ROLE}`);
    });
  });
})

  describe('Only Trustee Role', (Percentages) => {      
    let trusteeFuncs = {
      'executeTrust': [null], 
    };

    const keys = Object.keys(trusteeFuncs);
    keys.forEach((func) => {
      let argz = trusteeFuncs[func];

      it(`${func} Correct Role`, async () => {
        await expect(
          simpleT.connect(Trustee)[ func ](...argz))
          .to.be.ok;
      });  

      it(`${func} Incorrect Role`, async () => {
        await expect(
          simpleT.connect(Grantor)[ func ](...argz))
          .to.be.reverted;
      });
    });
  });

});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
