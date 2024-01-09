const { use, expect } = require("chai");
const { ethers } = require("hardhat");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const GRANTOR_ROLE = ethers.utils.id("GRANTOR_ROLE");
const INITIAL_TRUSTEE_ROLE = ethers.utils.id("INITIAL_TRUSTEE_ROLE");
const SUCCESSOR_TRUSTEE_ROLE = ethers.utils.id("SUCCESSOR_TRUSTEE_ROLE");
const BENEFICIARY_ROLE = ethers.utils.id("BENEFICIARY_ROLE");

describe("🚩 🏵 Simple Trust 🤖", async function () {
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
    const CheckInPeriod = 2;
    const Grantors = [InitialTrustee.address, Grantor2.address];
    const Distribution = "perStirpes";
    const SuccessorTrustees = [
      SuccessorTrustee1.address,
      SuccessorTrustee2.address,
    ];
    const SuccessorTrusteePositions = [1, 2];
    const SuccessorTrusteePeriod = 2;
    const Beneficiary = [Beneficiary1.address, Beneficiary2.address];
    const Shares = [75, 25];

    let argz = [
      Name,
      InitialTrusteeAddress,
      CheckInPeriod,
      Grantors,
      Distribution,
      SuccessorTrustees,
      SuccessorTrusteePositions,
      SuccessorTrusteePeriod,
      Beneficiary,
      Shares,
    ];

    const LoadedStaticRouter = await ethers.getContractFactory("Router");
    const router = await LoadedStaticRouter.connect(InitialTrustee).deploy();
    await router.deployed();

    const routerAddress = router.address;

    const Initialize = await ethers.getContractFactory("Initialize");
    const initialize = await Initialize.attach(routerAddress);
    await initialize.initializeInitializableModule(...argz);

    const wallets = {
      InitialTrustee: InitialTrustee,
      Grantor2: Grantor2,
      SuccessorTrustee1: SuccessorTrustee1,
      SuccessorTrustee2: SuccessorTrustee2,
      Beneficiary1: Beneficiary1,
      Beneficiary2: Beneficiary2,
    };

    return { wallets, routerAddress };
  }

  describe("Adding Grantors", () => {
    it("addGrantors: Correct Length", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;

      const N0 = await grantor.getGrantorsLength();
      await grantor.addGrantors([newAddress1, newAddress2]);
      const N1 = await grantor.getGrantorsLength();
      expect(N0.add(2)).to.equal(N1);
    });

    it("addGrantors: Correct Addresses added", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      await grantor.addGrantors([newAddress1, newAddress2]);
      const isGrantorResult1 = await grantor.findIsAGrantor(newAddress1);
      expect(isGrantorResult1).to.be.true;
      const isGrantorResult2 = await grantor.findIsAGrantor(newAddress2);
      expect(isGrantorResult2).to.be.true;
    });

    it("addGrantors: Role added", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const hasRoleResult01 = await access.hasRole(GRANTOR_ROLE, newAddress1);
      const hasRoleResult02 = await access.hasRole(GRANTOR_ROLE, newAddress2);
      expect(hasRoleResult01).to.be.false;
      expect(hasRoleResult02).to.be.false;

      await grantor.addGrantors([newAddress1, newAddress2]);

      const hasRoleResult11 = await access.hasRole(GRANTOR_ROLE, newAddress1);
      const hasRoleResult12 = await access.hasRole(GRANTOR_ROLE, newAddress2);
      expect(hasRoleResult11).to.be.true;
      expect(hasRoleResult12).to.be.true;
    });

    it("addGrantors: Mint Tokens", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Get Tokens per grantor constant
      const tokensPerGrantor = await grantor.getTokensPerGrantor();

      // New Grantors to Add
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;

      // Add Grantors
      await grantor.addGrantors([newAddress1, newAddress2]);

      // Get Grantor Tokens
      const newgrantor1Id = await grantor.getGrantorsTokenID(newAddress1);
      const newgrantor2Id = await grantor.getGrantorsTokenID(newAddress2);

      // Get Token Balances
      const bal1 = await erc1155.balanceOf(newAddress1, newgrantor1Id);
      const bal2 = await erc1155.balanceOf(newAddress2, newgrantor2Id);

      // Should be equal to tokens per grantor
      expect(bal1).to.equal(tokensPerGrantor);
      expect(bal2).to.equal(tokensPerGrantor);
    });

    it("addGrantor: Event Emitted", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      const initialTrustee = wallets["InitialTrustee"].address;
      const newAddress = wallets["SuccessorTrustee1"].address;

      await expect(grantor.addGrantors([newAddress]))
        .to.emit(grantor, "AddedGrantor")
        .withArgs(initialTrustee, newAddress);
    });
  });

  describe("Removing Grantor", () => {
    it("grantorRemoveSelf: Correct Length", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      const N0 = await grantor.getGrantorsLength();
      await grantor.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const N1 = await grantor.getGrantorsLength();
      expect(N0.sub(1)).to.equal(N1);

      await grantor.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const N2 = await grantor.getGrantorsLength();
      expect(N1.sub(1)).to.equal(N2);
    });

    it("grantorRemoveSelf: Correct Addresses removed", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      const removeAddress = wallets["Grantor2"].address;

      const isGrantorResult1 = await grantor.findIsAGrantor(removeAddress);
      expect(isGrantorResult1).to.be.true;

      await grantor.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const isGrantorResult2 = await grantor.findIsAGrantor(removeAddress);
      expect(isGrantorResult2).to.be.false;

      const removeAddress2 = wallets["InitialTrustee"].address;
      const isGrantorResult3 = await grantor.findIsAGrantor(removeAddress2);
      expect(isGrantorResult3).to.be.true;
      await grantor.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const isGrantorResult4 = await grantor.findIsAGrantor(removeAddress2);
      expect(isGrantorResult4).to.be.false;
    });

    it("grantorRemoveSelf: Role removed", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      const removeAddress = wallets["Grantor2"].address;
      const hasRoleResult1 = await access.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult1).to.be.true;

      await grantor.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const hasRoleResult2 = await access.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult2).to.be.false;

      const removeAddress2 = wallets["InitialTrustee"].address;
      const hasRoleResult3 = await access.hasRole(GRANTOR_ROLE, removeAddress2);
      expect(hasRoleResult3).to.be.true;

      await grantor.grantorRemoveSelf();
      const hasRoleResult4 = await access.hasRole(GRANTOR_ROLE, removeAddress2);
      expect(hasRoleResult4).to.be.false;
    });

    it("grantorRemoveSelf: Tokens Burned", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Tokens per Grantor constant
      const tokensPerGrantor = await grantor.getTokensPerGrantor();

      // Grantor address to remove
      const removeAddress = wallets["Grantor2"].address;

      // Get Grantor's token ID and balance
      const tokenID = await grantor.getGrantorsTokenID(removeAddress);
      const tokenBal_1 = await erc1155.balanceOf(removeAddress, tokenID);
      expect(tokenBal_1).to.equal(tokensPerGrantor);

      // Remove the Grantor
      await grantor.connect(wallets["Grantor2"]).grantorRemoveSelf();

      // Tokens should be burned
      const tokenBal_2 = await erc1155.balanceOf(removeAddress, tokenID);
      expect(tokenBal_2).to.equal(0);
    });

    it("grantorRemoveSelf: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      // Wallet to be removed
      const removeAddress = wallets["Grantor2"].address;

      // Remove and check event
      await expect(grantor.connect(wallets["Grantor2"]).grantorRemoveSelf())
        .to.emit(grantor, "RemovedGrantor")
        .withArgs(removeAddress, removeAddress);
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor.
     * */
    it("grantorRemoveSelf: State changed 1", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      // Check number of Grantors
      const N0 = await grantor.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      await grantor.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Inactive");

      await grantor.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const state3 = await checkIn.returnTrustState();
      expect(state3).to.equal("Inactive");
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor. Uses a different order of removal than above.
     * */
    it("grantorRemoveSelf: State changed 2", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      const N0 = await grantor.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      await grantor.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const N1 = await grantor.getGrantorsLength();
      expect(N0.sub(1)).to.equal(N1);
      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Active");

      await grantor.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const N2 = await grantor.getGrantorsLength();
      expect(N2).to.equal(0);
      const state3 = await checkIn.returnTrustState();
      expect(state3).to.equal("Inactive");
    });

    it("adminRemoveGrantor: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      // Get current grantor length
      const N0 = await grantor.getGrantorsLength();

      // Remove the Grantor
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["Grantor2"].address);

      // Length of Grantors should be 1 less
      const N1 = await grantor.getGrantorsLength();
      expect(N0.sub(1)).to.equal(N1);

      // Remove another Grantor
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["InitialTrustee"].address);
      // Length of Grantors should be 1 less
      const N2 = await grantor.getGrantorsLength();
      expect(N1.sub(1)).to.equal(N2);
    });

    it("adminRemoveGrantor: Correct Addresses removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      //  Grantor to remove
      const removeAddress = wallets["Grantor2"].address;

      // Grantor be a grantor
      const isGrantorResult1 = await grantor.findIsAGrantor(removeAddress);
      expect(isGrantorResult1).to.be.true;

      // Removed grantor should no longer be a grantor
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress);
      const isGrantorResult2 = await grantor.findIsAGrantor(removeAddress);
      expect(isGrantorResult2).to.be.false;

      // Repeat for a second Grantor
      const removeAddress2 = wallets["InitialTrustee"].address;
      const isGrantorResult3 = await grantor.findIsAGrantor(removeAddress2);
      expect(isGrantorResult3).to.be.true;
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress2);
      const isGrantorResult4 = await grantor.findIsAGrantor(removeAddress2);
      expect(isGrantorResult4).to.be.false;
    });

    it("adminRemoveGrantor: Role removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // Grantor should be a Grantor
      const removeAddress = wallets["Grantor2"].address;
      const hasRoleResult1 = await access.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult1).to.be.true;

      // Grantor should no longer be a grantor
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress);
      const hasRoleResult2 = await access.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult2).to.be.false;

      // Second grantor should be a grantor
      const removeAddress2 = wallets["InitialTrustee"].address;
      const hasRoleResult3 = await access.hasRole(GRANTOR_ROLE, removeAddress2);
      expect(hasRoleResult3).to.be.true;

      //  Second grantor should no longer be a grantor
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress2);
      const hasRoleResult4 = await access.hasRole(GRANTOR_ROLE, removeAddress2);
      expect(hasRoleResult4).to.be.false;
    });

    it("adminRemoveGrantor: Tokens Burned", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Tokens per Grantor constant
      const tokensPerGrantor = await grantor.getTokensPerGrantor();

      // Grantor address to remove
      const removeAddress = wallets["Grantor2"].address;

      // Get Grantor's token ID and balance
      const tokenID = await grantor.getGrantorsTokenID(removeAddress);
      const tokenBal_1 = await erc1155.balanceOf(removeAddress, tokenID);
      expect(tokenBal_1).to.equal(tokensPerGrantor);

      // Remove the grantor
      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress);

      // Tokens should be burned
      const tokenBal2 = await erc1155.balanceOf(removeAddress, tokenID);
      expect(tokenBal2).to.equal(0);
    });

    it("adminRemoveGrantor: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      // Addresses involved in the event
      const initialTrustee = wallets["InitialTrustee"].address;
      const removeAddress = wallets["Grantor2"].address;

      // Check the event
      await expect(
        grantor
          .connect(wallets["InitialTrustee"])
          .adminRemoveGrantor(removeAddress)
      )
        .to.emit(grantor, "RemovedGrantor")
        .withArgs(initialTrustee, removeAddress);
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor.
     * */
    it("adminRemoveGrantor: State changed 1", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      const N0 = await grantor.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["Grantor2"].address);
      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Inactive");

      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["InitialTrustee"].address);
      const state3 = await checkIn.returnTrustState();
      expect(state3).to.equal("Inactive");
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor. Uses a different order of removal than above.
     * */
    it("adminRemoveGrantor: State changed 2", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      const N0 = await grantor.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["InitialTrustee"].address);
      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Active");

      await grantor
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["Grantor2"].address);
      const state3 = await checkIn.returnTrustState();
      expect(state3).to.equal("Inactive");
    });
  });

  describe("Assign Assets", () => {
    it("assignAssetsToTrust: tokens transfered", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Tokens per Grantor constant
      const tokensPerGrantor = await grantor.getTokensPerGrantor();

      // Grantor address to remove
      const grantorAddress = wallets["Grantor2"].address;

      // Get Grantor's token ID and balance
      const tokenID = await grantor.getGrantorsTokenID(grantorAddress);
      const grantoBal_0 = await erc1155.balanceOf(grantorAddress, tokenID);
      expect(grantoBal_0).to.equal(tokensPerGrantor);

      // Trust's balance should be 0
      const trustBal_0 = await erc1155.balanceOf(routerAddress, tokenID);
      expect(trustBal_0).to.equal(0);

      // Assign the Assets to the Trust
      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      // Grantor's tokens should be 0
      const grantoBal_1 = await erc1155.balanceOf(grantorAddress, tokenID);
      expect(grantoBal_1).to.equal(0);

      // Trust's balance should be tokens per grantor
      const trustBal_1 = await erc1155.balanceOf(routerAddress, tokenID);
      expect(trustBal_1).to.equal(tokensPerGrantor);
    });

    it("assignAssetsToTrust: state changed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");
      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");
    });

    it("assignAssetsToTrust: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      // Wallet in the event
      const initialTrustee = wallets["InitialTrustee"].address;

      // Check emitted event
      await expect(
        grantor.connect(wallets["InitialTrustee"]).assignAssetsToTrust()
      )
        .to.emit(grantor, "AssetsAssigned")
        .withArgs(initialTrustee);
    });
  });
  describe("Set Distribution", () => {
    it("Should Set Distribution", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);

      expect(await grantor.returnDistributionType()).to.equal("perStirpes");

      const newDist = "proRata";
      await grantor.connect(wallets["InitialTrustee"]).setDistribution(newDist);
      expect(await grantor.returnDistributionType()).to.equal(newDist);

      const newDist2 = "perStirpes";
      await grantor
        .connect(wallets["InitialTrustee"])
        .setDistribution(newDist2);
      expect(await grantor.returnDistributionType()).to.equal(newDist2);
    });
  });
});
