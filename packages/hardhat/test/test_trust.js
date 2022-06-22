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

async function getCurrentTime() {
  const blockNum = await ethers.provider.getBlockNumber();
  const currentBlock = await ethers.provider.getBlock(blockNum);
  var currentTime = BigNumber.from(currentBlock.timestamp);
  return currentTime;
};

describe("🚩 🏵 Simple Trust 🤖", () => {
  let Grantor;
  let Trustor;
  let Beneficiary1;
  let Beneficiary2;
  let Beneficiary3;

  let usdcToken;
  let simpleT;

  let GRANTOR_ROLE = ethers.utils.id("GRANTOR_ROLE");
  let TRUSTEE_ROLE = ethers.utils.id("TRUSTEE_ROLE");

  const tolerance = ethers.utils.parseEther("0.0001");


  beforeEach(async () => {
    [Grantor, Trustee, Beneficiary1, Beneficiary2, Beneficiary3] = await ethers.getSigners();

    USDC_TOKEN_ADDRESS=false;
    if(USDC_TOKEN_ADDRESS){
      // live contracts, token already deployed
    }else{
      const USDCToken = await ethers.getContractFactory("USDC");
      usdcToken = await USDCToken.deploy();

      // describe("totalSupply()", function () {
      //   it("Should have a total supply of at least 1000", async function () {
      //     const totalSupply = await usdcToken.totalSupply();
      //     const totalSupplyInt = parseInt(ethers.utils.formatUnits(totalSupply, 6))
      //     // console.log('\t'," 🧾 Total Supply:",totalSupplyInt)
      //     expect(totalSupplyInt).to.greaterThan(999);
      //   });
      // });
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
        // console.log('\t'," 🏷  Transfer USDC Result: ", transferTokensResult2.hash)
  
        // console.log('\t'," ⏳ Waiting for confirmation...")
        const ttxResult2 =  await transferTokensResult2.wait()
        expect(ttxResult2.status).to.equal(1);
  
        // await simpleT.addGrantor(randAddress);;
        const grantors = await simpleT.getGrantors();
        // console.log('\t',"Grantors: ", grantors)
    }         

    // // Set the Farm Address
    // await vaultContract.initializeFarm(farmContract.address, 50);
    // await vaultContract.initializeFarm(mockLPFarmContract.address, 50);
    // const secondsIn48Hours = 172800;
    // await ethers.provider.send("evm_increaseTime", [secondsIn48Hours]);
    // await ethers.provider.send("evm_mine");
    // await vaultContract.setFarms();

    // // Intitialize starting balances
    // vaultTokensSupply = await tokenContract.balanceOf(vaultContract.address);
    // farmTokensSupply = await tokenContract.balanceOf(farmContract.address);
    // ownerTokenSupply = await tokenContract.balanceOf(owner.address);
  });


    describe('Adjust Grantors', () => {
       
      it(`Should add a Grantor`, async () => {
        // Get Current grantors
        const grantors0 = await simpleT.getGrantors();
        const length0 = grantors0.length;

        // Create New Grantor to add
        let randAddress=ethers.Wallet.createRandom().address;

        // Add the new grantor
        await simpleT.addGrantor(randAddress);;
        const grantors = await simpleT.getGrantors();

        // Check Length
        expect(grantors.length).to.equal(length0+1);

        // Check Address
        expect(grantors[grantors.length-1]).to.equal(randAddress);
      });


      it(`Should remove a Grantor`, async () => {
        // Get Current grantors
        const grantors0 = await simpleT.getGrantors();
        const length0 = grantors0.length;

        // Create New Grantor to add
        let randAddress=ethers.Wallet.createRandom().address;

        // Add the new grantor
        await simpleT.addGrantor(randAddress);;
        const grantors = await simpleT.getGrantors();

        // Check Length
        expect(grantors.length).to.equal(length0+1);

        // Check Address
        expect(grantors[grantors.length-1]).to.equal(randAddress);
      });

    });

    // describe('Execute Trust', () => {
       
    //   it(`Approve USDC`, async () => {
    //     console.log('\t'," 🙄 Approving...")
    //     const approveTokensResult = await usdcToken.approve(simpleT.address, ethers.utils.parseEther("100"));
    //     console.log('\t'," 🏷  approveTokens Result: ",approveTokensResult.hash)

    //     console.log('\t'," ⏳ Waiting for confirmation...")
    //     const atxResult =  await approveTokensResult.wait()
    //     expect(atxResult.status).to.equal(1);
    //   });  

    //   it(`Distribute ERC20s`, async () => {
    //     console.log('\t'," 🙄 Executing...")
    //     const executeTrustResult = await simpleT.connect(Trustee).executeTrust();
    //     console.log('\t'," 🏷  Executing Trust Result: ", executeTrustResult.hash)

    //     console.log('\t'," ⏳ Waiting for confirmation...")
    //     const exTxResult =  await executeTrustResult.wait()
    //     expect(exTxResult.status).to.equal(1);
    //   });  

    //   it(`Check Shit`, async () => {
    //     let randAddress=ethers.Wallet.createRandom().address;
    //     await simpleT.addGrantor(randAddress);;
    //     const grantors = await simpleT.getGrantors();
    //     console.log('\t',"Grantors: ", grantors)
    //   }); 

    // });

    // setPeriods
    // addGrantor
    // resetGrantor
    // addERC20ToTrust
    // addTrustee
    // removeTrustee
    // resetTrustees
    // setBeneficiaries
    // calculateTotalPercent
    // erc20Balance
    // erc20TransferFrom
    // TrusteeSetBeneficiaries
    // executeTrust


  //   it('setWhitelist', async () => {
  //     await expect(
  //       crownVendor.connect(addr1).setWhitelist(true))
  //       .to.be.revertedWith('Ownable: caller is not the owner');
  //   });  

  //   it('addToWhitelist', async () => {
  //     await expect(
  //       crownVendor.connect(addr1).addToWhitelist(addr1.address))
  //       .to.be.revertedWith('Ownable: caller is not the owner');
  //   });  

  //   it('removeAddressFromWl', async () => {
  //     await expect(
  //       crownVendor.connect(addr1).removeAddressFromWl(addr1.address))
  //       .to.be.revertedWith('Ownable: caller is not the owner');
  //   }); 

  //   it('resetWhitelist', async () => {
  //     await expect(
  //       crownVendor.connect(addr1).resetWhitelist())
  //       .to.be.revertedWith('Ownable: caller is not the owner');
  //   }); 


  //   it('withdrawUSDC', async () => {
  //     await expect(
  //       crownVendor.connect(addr1).withdrawUSDC())
  //       .to.be.revertedWith('Ownable: caller is not the owner');
  //   }); 


  //   it('withdrawCrown', async () => {
  //     await expect(
  //       crownVendor.connect(addr1).withdrawCrown())
  //       .to.be.revertedWith('Ownable: caller is not the owner');
  //   }); 


  
  // describe("💵 buyTokens()", function () {
  //   it("Should let us buy tokens and our balance should go up...", async function () {
  //     const startingCrownBalance = await crownToken.balanceOf(owner.address)
  //     console.log('\t'," ⚖️ Starting Crown balance: ",ethers.utils.formatEther(startingCrownBalance))

  //     const startingUSDCBalance = await usdcToken.balanceOf(owner.address)
  //     console.log('\t'," ⚖️ Starting USDC balance: ",ethers.utils.formatUnits(startingUSDCBalance,6))

  //     console.log('\t'," 🙄 Approving...")
  //     const approveTokensResult = await usdcToken.approve(crownVendor.address, ethers.utils.parseEther("100"));
  //     console.log('\t'," 🏷  approveTokens Result: ",approveTokensResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const atxResult =  await approveTokensResult.wait()
  //     expect(atxResult.status).to.equal(1);

  //     console.log('\t'," 💸 Buying...")
  //     const buyTokensResult = await crownVendor.buyCrown(ethers.utils.parseEther("1"));
  //     console.log('\t'," 🏷  buyTokens Result: ",buyTokensResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await buyTokensResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     const newBalance = await crownToken.balanceOf(owner.address)
  //     console.log('\t'," 🔎 New Crown balance: ", ethers.utils.formatEther(newBalance))
  //     expect(newBalance).to.equal(startingCrownBalance.add(ethers.utils.parseEther("1")));

  //     const newUSDCBalance = await usdcToken.balanceOf(owner.address)
  //     console.log('\t'," 🔎 New USDC balance: ", ethers.utils.formatUnits(newUSDCBalance,6))
  //     expect(newUSDCBalance).to.equal(startingUSDCBalance.sub(ethers.utils.parseUnits("0.2",6)));

  //   });
  // })

  // describe("💵 setUSDCPerCrown()", function () {
  //   const newPrice = ethers.utils.parseUnits("0.5",6);

  //   it("Should let us set a new token price", async function () {
    
  //     console.log('\t'," 💸 Setting Price...")
  //     const setUSDCPerCrownResult = await crownVendor.setUSDCPerCrown(newPrice);
  //     console.log('\t'," 🏷  setUSDCPerCrown Result: ",setUSDCPerCrownResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await setUSDCPerCrownResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     console.log('\t'," 💸 Get Price...")
  //     const USDCPerCrownResult = await crownVendor.USDCPerCrown();
  //     console.log('\t'," 🔎 New USDC per Crown Rate: ", ethers.utils.formatUnits(USDCPerCrownResult,6))
  //     expect(USDCPerCrownResult).to.equal(newPrice)
  //   });

  //   it("Should now cost the new price to buy a token", async function () {
    
  //     const vendorCrownBalance = await crownToken.balanceOf(crownVendor.address)
  //     console.log('\t'," ⚖️ Starting Vendor Crown balance: ",ethers.utils.formatEther(vendorCrownBalance))

  //     const vendorUSDCBalance = await usdcToken.balanceOf(crownVendor.address)
  //     console.log('\t'," ⚖️ Starting Vendor USDC balance: ",ethers.utils.formatUnits(vendorUSDCBalance,6))

  //     console.log('\t'," 💸 Buying...")
  //     const crownToBuy = ethers.utils.parseEther("1");
  //     const buyTokensResult = await crownVendor.buyCrown(crownToBuy);
  //     console.log('\t'," 🏷  buyTokens Result: ",buyTokensResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await buyTokensResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     const newVendorCrownBalance = await crownToken.balanceOf(crownVendor.address)
  //     console.log('\t'," ⚖️ New Vendor Crown balance: ",ethers.utils.formatEther(newVendorCrownBalance))
  //     expect(newVendorCrownBalance).to.equal(vendorCrownBalance.sub(crownToBuy))

  //     const newVendorUSDCBalance = await usdcToken.balanceOf(crownVendor.address)
  //     console.log('\t'," ⚖️ New Vendor USDC balance: ",ethers.utils.formatUnits(newVendorUSDCBalance,6))
  //     expect(newVendorUSDCBalance).to.equal(vendorUSDCBalance.add(newPrice))
  //   });

  // })


  // describe("🧾 setWhiteList()", function () {
  //   const newPrice = ethers.utils.parseUnits("0.5",6);

  //   it("Should let us turn on the whitelist", async function () {
    
  //     console.log('\t'," 🧾 Setting Witelist...")
  //     const setWhitelistResult = await crownVendor.setWhitelist(true);
  //     console.log('\t'," 🏷  setWhitelistResult Result: ",setWhitelistResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await setWhitelistResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     console.log('\t'," 💸 Get Whitelist Status...")
  //     const whitelistStatus = await crownVendor.whitelist();
  //     console.log('\t'," 🔎 Whitelist Status: ", whitelistStatus)
  //     expect(whitelistStatus).to.equal(true)
  //   });

  //   it("Should not be able to buy because no users on the whitelist", async function () {    
  //     console.log('\t'," 💸 Buying...")
  //     await expect(
  //         crownVendor.buyCrown(ethers.utils.parseEther("1")))
  //         .to.be.revertedWith('User not found on whitelist');
  //     await sleep(250); // wait seconds for deployment to propagate
  //   });

  //   it("Should be able to add owner to whitelist", async function () {
  //     console.log('\t'," 👨 Add Owner to Whitelist...")
  //     const addToWhitelistResult = await crownVendor.addToWhitelist(owner.address);
  //     console.log('\t'," 🏷  addToWhitelist Result: ", addToWhitelistResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await addToWhitelistResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     console.log('\t'," 💸 Get Whitelist Person...")
  //     const whitelistAddress0 = await crownVendor.wlAddresses(0);
  //     console.log('\t'," 🔎 Whitelist Address 0: ", whitelistAddress0)
  //     expect(whitelistAddress0).to.equal(owner.address)
  //   });

  //   it("Owner should now be able to buy", async function () {    
  //     console.log('\t'," 💸 Buying...")
  //     await expect(
  //         crownVendor.buyCrown(ethers.utils.parseEther("1")))
  //         .to.be.ok;
  //     await sleep(250); // wait seconds for deployment to propagate
  //   });

  //   it("Address1 should not be able to buy because they are not on the whitelist", async function () {
  //     console.log('\t'," 💸 Buying...")
  //     await expect(
  //         crownVendor.connect(addr1).buyCrown(ethers.utils.parseEther("1")))
  //         .to.be.revertedWith('User not found on whitelist');
  //     await sleep(250); // wait seconds for deployment to propagate
  //   });

    
  //   it("Should be able to add address1 to whitelist", async function () {
  //     console.log('\t'," 👨 Add Address1 to Whitelist...")
  //     const addToWhitelistResult = await crownVendor.addToWhitelist(addr1.address);
  //     console.log('\t'," 🏷  addToWhitelist Result: ", addToWhitelistResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await addToWhitelistResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     console.log('\t'," 💸 Get Whitelist Person...")
  //     const whitelistAddress0 = await crownVendor.wlAddresses(1);
  //     console.log('\t'," 🔎 Whitelist Address 0: ", whitelistAddress0)
  //     expect(whitelistAddress0).to.equal(addr1.address)
  //   });

  //   it("Address1 should now be able to buy", async function () {
  //     console.log('\t'," 💸 Buying...")
  //     const buyCrownResult = await expect(
  //         crownVendor.connect(addr1).buyCrown(ethers.utils.parseEther("1")))
  //         .to.be.ok;
  //     await sleep(250); // wait seconds for deployment to propagate
  //   });

  //   it("Should be able to add address2 to whitelist", async function () {
  //     console.log('\t'," 👨 Add Address2 to Whitelist...")
  //     const addToWhitelistResult = await crownVendor.addToWhitelist(addr2.address);
  //     console.log('\t'," 🏷  addToWhitelist Result: ", addToWhitelistResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await addToWhitelistResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     console.log('\t'," 💸 Get Whitelist Person...")
  //     const whitelistAddress2 = await crownVendor.wlAddresses(2);
  //     console.log('\t'," 🔎 Whitelist Address 2: ", whitelistAddress2)
  //     expect(whitelistAddress2).to.equal(addr2.address)
  //   });


  //   it("Should be able to remove owner to whitelist", async function () {
  //     console.log('\t'," 💸 Get Whitelist index 0 ...")
  //     const whitelistAddress0 = await crownVendor.wlAddresses(0);
  //     console.log('\t'," 🔎 Whitelist Address 0: ", whitelistAddress0)

  //     console.log('\t'," 💸 Get Whitelist Ibdex 2 ...")
  //     const whitelistAddress2 = await crownVendor.wlAddresses(2);
  //     console.log('\t'," 🔎 Whitelist Address 2: ", whitelistAddress2)
      
  //     console.log('\t'," 👨 Remove Owner from Whitelist...")
  //     const removeAddressFromWlResult = await crownVendor.removeAddressFromWl(owner.address);
  //     console.log('\t'," 🏷  removeAddressFromWl Result: ", removeAddressFromWlResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await removeAddressFromWlResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     // Last Address should replace current address
  //     console.log('\t'," 💸 Get Whitelist Person...")
  //     const newWhitelistAddress0 = await crownVendor.wlAddresses(0);
  //     console.log('\t'," 🔎 New Whitelist Address 0: ", whitelistAddress0)
  //     expect(newWhitelistAddress0).to.equal(whitelistAddress2)
  //   });

  //   it("Owner should not be able to buy because removed from whitelist", async function () {    
  //     console.log('\t'," 💸 Buying...")
  //     await expect(
  //         crownVendor.buyCrown(ethers.utils.parseEther("1")))
  //         .to.be.revertedWith('User not found on whitelist');
  //     await sleep(250); // wait seconds for deployment to propagate
  //   });

  //   it("Address2 should still be able to buy", async function () {
  //     console.log('\t'," 🙄 Approving...")
  //     const approveTokensResult = await usdcToken.connect(addr2).approve(crownVendor.address, ethers.utils.parseEther("100"));
  //     console.log('\t'," 🏷  approveTokens Result: ",approveTokensResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const atxResult =  await approveTokensResult.wait()
  //     expect(atxResult.status).to.equal(1);
  //     console.log('\t'," 💸 Buying...")
  //     const buyCrownResult = await expect(
  //         crownVendor.connect(addr2).buyCrown(ethers.utils.parseEther("1")))
  //         .to.be.ok;
  //     await sleep(250); // wait seconds for deployment to propagate
  //   });

  //   it("Should be able to delete the whole whitelist", async function () {
  //     await sleep(1000); // wait seconds for deployment to propagate
  //     console.log('\t'," 💸 Get Whitelist index 0 ...")
  //     const whitelistAddress0 = await crownVendor.wlAddresses(0);
  //     console.log('\t'," 🔎 Whitelist Address 0: ", whitelistAddress0)
      
  //     console.log('\t'," 👨 Delete the Whitelist...")
  //     const resetWhitelistResult = await crownVendor.resetWhitelist();
  //     console.log('\t'," 🏷  resetWhitelist Result: ", resetWhitelistResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await resetWhitelistResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     console.log('\t'," 💸 Get Whitelist index 0 ...")
  //     const buyCrownResult = await expect(crownVendor.wlAddresses(0)).to.be.reverted;
  //   });

  // })


  // describe("💵 withdrawTokens()", function () {
  //   it("Should let us withdraw Crown and our balance should go up...", async function () {
      
  //     console.log('\t'," 🧑‍🏫 Tester Address: ", owner.address)

  //     const startingCrownBalance = await crownToken.balanceOf(owner.address)
  //     console.log('\t'," ⚖️ Starting Crown balance: ",ethers.utils.formatEther(startingCrownBalance))

  //     const vendorCrownBalance = await crownToken.balanceOf(crownVendor.address)
  //     console.log('\t'," ⚖️ Starting Vendor Crown balance: ",ethers.utils.formatEther(vendorCrownBalance))

  //     console.log('\t'," 💸 Withdrawing...")
  //     const withdrawCrownResult = await crownVendor.withdrawCrown();
  //     console.log('\t'," 🏷  withdrawCrown Result: ",withdrawCrownResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await withdrawCrownResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     const newBalance = await crownToken.balanceOf(owner.address)
  //     console.log('\t'," 🔎 New Crown balance: ", ethers.utils.formatEther(newBalance))
  //     expect(newBalance).to.equal(startingCrownBalance.add(vendorCrownBalance));
  //   });
  

  //   it("Should let us withdraw USDC and our balance should go up...", async function () {
        
  //     console.log('\t'," 🧑‍🏫 Tester Address: ", owner.address)

  //     const startingUSDCBalance = await usdcToken.balanceOf(owner.address)
  //     console.log('\t'," ⚖️ Starting USDC balance: ",ethers.utils.formatUnits(startingUSDCBalance,6))

  //     const vendorUSDCBalance = await usdcToken.balanceOf(crownVendor.address)
  //     console.log('\t'," ⚖️ Starting Vendor USDC balance: ",ethers.utils.formatUnits(vendorUSDCBalance,6))

  //     console.log('\t'," 💸 Withdrawing...")
  //     const withdrawUSDCResult = await crownVendor.withdrawUSDC();
  //     console.log('\t'," 🏷  withdrawUSDC Result: ",withdrawUSDCResult.hash)

  //     console.log('\t'," ⏳ Waiting for confirmation...")
  //     const txResult =  await withdrawUSDCResult.wait()
  //     expect(txResult.status).to.equal(1);

  //     const newUSDCBalance = await usdcToken.balanceOf(owner.address)
  //     console.log('\t'," 🔎 New USDC balance: ", ethers.utils.formatUnits(newUSDCBalance,6))
  //     expect(newUSDCBalance).to.equal(startingUSDCBalance.add(vendorUSDCBalance));
  //   });
  // }) 

});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
  // ETH Balance and transfer Eth
      // let startingETHBalance = await ethers.provider.getBalance(owner.address)
      // console.log('\t'," ⚖️ Owner Starting ETH balance: ",ethers.utils.formatEther(startingETHBalance))

      // await owner.sendTransaction({
      //   to: addr1.address,
      //   value: ethers.utils.parseEther("1.0"), // Sends exactly 1.0 ether
      // });

      //  startingETHBalance = await ethers.provider.getBalance(addr1.address)
      // console.log('\t'," ⚖️ Addr1 Starting ETH balance: ",ethers.utils.formatEther(startingETHBalance))

      // const startingUSDCBalance = await usdcToken.balanceOf(addr1.address)
      // console.log('\t'," ⚖️ Starting USDC balance: ",ethers.utils.formatUnits(startingUSDCBalance,6))