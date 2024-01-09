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
const ACTIVE_TRUSTEE_ROLE = ethers.utils.id("ACTIVE_TRUSTEE_ROLE");
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

  describe("Adding Trustee", async () => {
    it("addSuccessorTrustee: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Get the starting number of succesor trustees
      const N0 = await trustee.getSuccessorTrusteeLength();

      // Add a trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees([wallets["Beneficiary1"].address], [1]);

      // The number of trustees should go up
      const N1 = await trustee.getSuccessorTrusteeLength();
      expect(N0.add(1)).to.equal(N1);
    });

    it("addSuccessorTrustee: Correct Address added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Set new succesor and position
      const newAddress = wallets["Beneficiary1"].address;
      const newPosition = 3;

      // Should not be a trustee
      const isSuccessorTrusteeResult_0 = await trustee.findIsATrustee(
        newAddress
      );
      expect(isSuccessorTrusteeResult_0).to.be.false;

      // Add the succsor trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees([newAddress], [newPosition]);

      // Should now be a trustee
      const isSuccessorTrusteeResult_1 = await trustee.findIsATrustee(
        newAddress
      );
      expect(isSuccessorTrusteeResult_1).to.be.true;
    });

    it("addSuccessorTrustee: Correct Position added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Set new succesor and position
      const newAddress = wallets["Beneficiary1"].address;
      const newPosition = 3;

      // Should not be a trustee
      const isSuccessorTrusteeResult_0 = await trustee.findIsATrustee(
        newAddress
      );
      expect(isSuccessorTrusteeResult_0).to.be.false;

      // Add the succesor trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees([newAddress], [newPosition]);

      // The returned position should be equal to the set postion
      const successorTrusteePosition =
        await trustee.getSuccessorTrusteePosition(newAddress);
      expect(successorTrusteePosition).to.equal(newPosition);
    });

    it("addSuccessorTrustee: Role added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // Set new succesor and position
      const newAddress = wallets["Beneficiary1"].address;
      const newPosition = 3;

      // Add the succesor trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees([newAddress], [newPosition]);

      // Role should be granted
      const hasRoleResult1 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        newAddress
      );
      expect(hasRoleResult1).to.be.true;
    });

    it("addSuccessorTrustee: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Set new succesor and position
      const newAddress = wallets["Beneficiary1"].address;
      const newPosition = 3;

      // Check the emitted event
      await expect(
        trustee
          .connect(wallets["InitialTrustee"])
          .addSuccessorTrustees([newAddress], [newPosition])
      )
        .to.emit(trustee, "AddedSccessorTrustee")
        .withArgs(wallets["InitialTrustee"].address, newAddress, newPosition);
    });
  });

  describe("Adding Trustees", () => {
    it("addSuccessorTrustees: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Succesor trustees to add
      const newAddress1 = wallets["Beneficiary1"].address;
      const newAddress2 = wallets["Beneficiary2"].address;
      const newPosition1 = 4;
      const newPosition2 = 5;

      // Get the initial length
      const N0 = await trustee.getSuccessorTrusteeLength();

      //  Add the trustees
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees(
          [newAddress1, newAddress2],
          [newPosition1, newPosition2]
        );

      // Length should have increaced by 2
      const N1 = await trustee.getSuccessorTrusteeLength();
      expect(N0.add(2)).to.equal(N1);
    });

    it("addSuccessorTrustees: Correct Addresses added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Succesor trustees to add
      const newAddress1 = wallets["Beneficiary1"].address;
      const newAddress2 = wallets["Beneficiary2"].address;
      const newPosition1 = 4;
      const newPosition2 = 5;

      // Should not be Trustees
      const isTrusteeResult1_0 = await trustee.findIsATrustee(newAddress1);
      expect(isTrusteeResult1_0).to.be.false;
      const isTrusteeResult2_0 = await trustee.findIsATrustee(newAddress2);
      expect(isTrusteeResult2_0).to.be.false;

      //  Add the trustees
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees(
          [newAddress1, newAddress2],
          [newPosition1, newPosition2]
        );

      const isTrusteeResult1_1 = await trustee.findIsATrustee(newAddress1);
      expect(isTrusteeResult1_1).to.be.true;
      const isTrusteeResult2_1 = await trustee.findIsATrustee(newAddress2);
      expect(isTrusteeResult2_1).to.be.true;
    });

    it("addSuccessorTrustees: Role added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // Succesor trustees to add
      const newAddress1 = wallets["Beneficiary1"].address;
      const newAddress2 = wallets["Beneficiary2"].address;
      const newPosition1 = 4;
      const newPosition2 = 5;

      // Should not have role
      const hasRoleResult1_0 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        newAddress1
      );
      const hasRoleResult2_0 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        newAddress2
      );
      expect(hasRoleResult1_0).to.be.false;
      expect(hasRoleResult2_0).to.be.false;

      // Add the Trustees
      await trustee
        .connect(wallets["InitialTrustee"])
        .addSuccessorTrustees(
          [newAddress1, newAddress2],
          [newPosition1, newPosition2]
        );

      // Should have trustee role now
      const hasRoleResult1_1 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        newAddress1
      );
      const hasRoleResult2_1 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        newAddress2
      );
      expect(hasRoleResult1_1).to.be.true;
      expect(hasRoleResult2_1).to.be.true;
    });
  });

  describe("Removing Trustee", () => {
    it("adminRemoveTrustee: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Get the current number of Trustees
      const N0 = await trustee.getSuccessorTrusteeLength();

      // Remove the trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .initialTrusteeRemoveSuccessorTrustee(
          wallets["SuccessorTrustee1"].address
        );

      // Number should decrease by 1
      const N1 = await trustee.getSuccessorTrusteeLength();
      expect(N0.sub(1)).to.equal(N1);
    });

    it("adminRemoveTrustee: Correct Addresses removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Wallet to Remove
      const removeAddress = wallets["SuccessorTrustee2"].address;

      //  Should be a trustee
      const isSuccessorTrusteeResult1 = await trustee.findIsATrustee(
        removeAddress
      );
      expect(isSuccessorTrusteeResult1).to.be.true;

      // Remove the trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .initialTrusteeRemoveSuccessorTrustee(removeAddress);

      //  Should no longer be a trustee
      const isSuccessorTrusteeResult2 = await trustee.findIsATrustee(
        removeAddress
      );
      expect(isSuccessorTrusteeResult2).to.be.false;
    });

    it("adminRemoveTrustee: Role removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // Wallet to Remove
      const removeAddress = wallets["SuccessorTrustee2"].address;

      const hasRoleResult1 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        removeAddress
      );
      expect(hasRoleResult1).to.be.true;

      await trustee
        .connect(wallets["InitialTrustee"])
        .initialTrusteeRemoveSuccessorTrustee(removeAddress);

      const hasRoleResult2 = await access.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        removeAddress
      );
      expect(hasRoleResult2).to.be.false;
    });

    it("adminRemoveTrustee: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Wallet sending request
      const initialTrustee = wallets["InitialTrustee"].address;

      // Wallet to Remove, and the Trustee's position
      const removeAddress = wallets["SuccessorTrustee2"].address;
      const position = await trustee.getSuccessorTrusteePosition(removeAddress);

      await expect(
        trustee
          .connect(wallets["InitialTrustee"])
          .initialTrusteeRemoveSuccessorTrustee(removeAddress)
      )
        .to.emit(trustee, "RemovedSuccessorTrustee")
        .withArgs(initialTrustee, removeAddress, position);
    });

    it("adminRemoveTrustee: Cannot Remove Last Trustee", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Remove Trustee
      await trustee
        .connect(wallets["InitialTrustee"])
        .initialTrusteeRemoveSuccessorTrustee(
          wallets["SuccessorTrustee1"].address
        );

      await expect(
        trustee
          .connect(wallets["InitialTrustee"])
          .initialTrusteeRemoveSuccessorTrustee(
            wallets["SuccessorTrustee2"].address
          )
      ).to.be.revertedWith(
        "Cannot remove last successor trustee. Please add replacement before removal."
      );
    });
  });

  // // TODO: Check if inactive grantors removed at execution
  describe("Initiate Truste Execution", () => {
    /** This test will test reversion of the first Succesor Trustee
     * prior to expiration. Expects Succesor Trustee 1 to be in
     * first window.
     * */
    it("initiateTrustExecution: CheckIn Time Correct Period 1", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Get contract checkin time variables
      const lastCheckin = await checkIn.getLastCheckInTime();
      const checkinPeriod = await checkIn.getCheckInPeriod();
      const expiration = await checkIn.getExpirationTime();
      const t0 = await time.latest();

      // Assign assets to the trust
      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      // Successor Trustee requests and signs message offline
      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await expect(
        trustee.connect(succesorTrustee).initiateTrustExecution(signedMessage)
      ).to.be.revertedWith(
        "This Succesor Trustee is not availble to act on this trust yet."
      );

      await time.increaseTo(expiration);

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      // Check state
      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Executing");
    });

    /** This test will test reversion of the 2nd Succesor Trustee
     * prior to expiration. Expects Succesor Trustee 2 to be in
     * not the first window.
     * */
    it("initiateTrustExecution: CheckIn Time Correct Period 2", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      const checkinPeriod = await trustee.getSuccessorTrusteePeriod();
      const expiration = await checkIn.getExpirationTime();

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee2"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await expect(
        trustee.connect(succesorTrustee).initiateTrustExecution(signedMessage)
      ).to.be.revertedWith(
        "This Succesor Trustee is not availble to act on this trust yet."
      );

      await time.increaseTo(expiration);

      await expect(
        trustee.connect(succesorTrustee).initiateTrustExecution(signedMessage)
      ).to.be.revertedWith(
        "This Succesor Trustee is not availble to act on this trust yet."
      );

      const periods = await trustee.getSuccessorTrusteePosition(
        succesorTrustee.address
      );

      expect(periods).greaterThan(1);

      await time.increaseTo(expiration.add(periods.mul(checkinPeriod)));

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      // Check state
      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Executing");
    });

    it("initiateTrustExecution: Trust State Changed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();

      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await checkIn.getExpirationTime();
      await time.increaseTo(expiration);

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);
      const state2 = await checkIn.returnTrustState();

      expect(state2).to.equal("Executing");
    });

    it("initiateTrustExecution: Grantor's Role Removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();

      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await checkIn.getExpirationTime();
      await time.increaseTo(expiration);

      const grantor1 = wallets["InitialTrustee"].address;
      const grantor2 = wallets["Grantor2"].address;
      const hasRoleResult1 = await access.hasRole(GRANTOR_ROLE, grantor1);
      const hasRoleResult2 = await access.hasRole(GRANTOR_ROLE, grantor2);
      expect(hasRoleResult1).to.be.true;
      expect(hasRoleResult2).to.be.true;

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult3 = await access.hasRole(GRANTOR_ROLE, grantor1);
      const hasRoleResult4 = await access.hasRole(GRANTOR_ROLE, grantor2);
      expect(hasRoleResult3).to.be.false;
      expect(hasRoleResult4).to.be.false;
    });

    it("initiateTrustExecution: Initial Trustee's Role Removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      const state0 = await checkIn.returnTrustState();
      expect(state0).to.equal("Inactive");

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Active");

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();

      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await checkIn.getExpirationTime();
      await time.increaseTo(expiration);

      const initialTrustee = wallets["InitialTrustee"].address;
      const hasRoleResult1 = await access.hasRole(
        INITIAL_TRUSTEE_ROLE,
        initialTrustee
      );
      expect(hasRoleResult1).to.be.true;

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult3 = await access.hasRole(
        INITIAL_TRUSTEE_ROLE,
        initialTrustee
      );
      expect(hasRoleResult3).to.be.false;
    });

    it("initiateTrustExecution: Sender Granted Active Trustee Role", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await checkIn.getExpirationTime();
      await time.increaseTo(expiration);

      const hasRoleResult1 = await access.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee.address
      );
      expect(hasRoleResult1).to.be.false;

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult3 = await access.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee.address
      );
      expect(hasRoleResult3).to.be.true;
    });

    it("initiateTrustExecution: Only 1 Active Trustee", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      //
      const checkinPeriod = await trustee.getSuccessorTrusteePeriod();
      const expiration = await checkIn.getExpirationTime();

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage1 = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const signedMessage2 = succesorTrustee2.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const periods = await trustee.getSuccessorTrusteePosition(
        succesorTrustee2.address
      );

      await time.increaseTo(expiration.add(periods.mul(checkinPeriod)));

      await trustee
        .connect(succesorTrustee2)
        .initiateTrustExecution(signedMessage2);

      await expect(
        trustee.connect(succesorTrustee1).initiateTrustExecution(signedMessage1)
      ).to.be.revertedWith("Trust is not in the expected TrustState");
    });
  });

  describe("Remove Active Trustee", () => {
    /** Test the removal of the active Trustee
     * */
    it("removeActiveTrustee: Cannot Remove prior to inaction", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await checkIn.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await trustee
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      await expect(
        trustee.connect(succesorTrustee2).removeActiveTrustee()
      ).to.be.revertedWith("Active trustee has not been inactive long enough.");
    });

    it("removeActiveTrustee: ACTIVE_TRUSTEE_ROLE removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await checkIn.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await trustee
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult1 = await access.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee1.address
      );
      expect(hasRoleResult1).to.be.true;

      const trusteeExpiration = await trustee.getActiveTrusteeExpirationTime();
      await time.increaseTo(trusteeExpiration);

      await trustee.connect(succesorTrustee2).removeActiveTrustee();

      const hasRoleResult2 = await access.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee1.address
      );
      expect(hasRoleResult2).to.be.false;
    });

    it("removeActiveTrustee: activeTrustee is adress(0) ", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await checkIn.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await trustee
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      const activeTrustee1 = await trustee.getActiveTrustee();
      expect(activeTrustee1).to.equal(succesorTrustee1.address);

      const trusteeExpiration = await trustee.getActiveTrusteeExpirationTime();
      await time.increaseTo(trusteeExpiration);

      await trustee.connect(succesorTrustee2).removeActiveTrustee();

      const activeTrustee2 = await trustee.getActiveTrustee();
      expect(activeTrustee2).to.equal(ethers.constants.AddressZero);
    });

    it("removeActiveTrustee: Trust State Returns to Active", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await checkIn.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await trustee
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      const state1 = await checkIn.returnTrustState();
      expect(state1).to.equal("Executing");

      const trusteeExpiration = await trustee.getActiveTrusteeExpirationTime();
      await time.increaseTo(trusteeExpiration);

      await trustee.connect(succesorTrustee2).removeActiveTrustee();

      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Active");
    });
  });

  // describe("Distribute Pro Rata", () => {
  //   it("beneficiaryDeceasedProRata: Correct Shares Allocated", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     // Assign assets
  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

  //     // Checkin Period Expires
  //     const expiration = await simpleT.getExpirationTime();
  //     await time.increaseTo(expiration);

  //     // Trustee Signs message to start trust execution
  //     const succesorTrustee = wallets["SuccessorTrustee1"];
  //     const isDedHash = await simpleT.DED();
  //     const signedMessage = succesorTrustee.signMessage(
  //       ethers.utils.arrayify(isDedHash)
  //     );

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .initiateTrustExecution(signedMessage);

  //     const Beneficiary1 = wallets["Beneficiary1"].address;
  //     const Beneficiary2 = wallets["Beneficiary2"].address;

  //     const shares_Beneficiary1_0 = await simpleT.beneficiaryShares(
  //       Beneficiary1
  //     );
  //     const shares_Beneficiary2_0 = await simpleT.beneficiaryShares(
  //       Beneficiary2
  //     );
  //     const totalShares_0 = await simpleT.totalShares();

  //     expect(totalShares_0).is.equal(
  //       shares_Beneficiary1_0.add(shares_Beneficiary2_0)
  //     );

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .beneficiaryDeceasedProRata(Beneficiary2);

  //     const shares_Beneficiary1_1 = await simpleT.beneficiaryShares(
  //       Beneficiary1
  //     );
  //     const shares_Beneficiary2_1 = await simpleT.beneficiaryShares(
  //       Beneficiary2
  //     );
  //     const totalShares_1 = await simpleT.totalShares();

  //     expect(totalShares_0).is.equal(totalShares_1);
  //     expect(shares_Beneficiary1_1).is.equal(totalShares_0);
  //     expect(shares_Beneficiary1_1).is.equal(
  //       shares_Beneficiary1_0.add(shares_Beneficiary2_0)
  //     );
  //     expect(shares_Beneficiary2_1).is.equal(0);
  //   });

  //   it("beneficiaryDeceasedProRata: Correct Beneficiary Removed", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     // Assign assets
  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

  //     // Checkin Period Expires
  //     const expiration = await simpleT.getExpirationTime();
  //     await time.increaseTo(expiration);

  //     // Trustee Signs message to start trust execution
  //     const succesorTrustee = wallets["SuccessorTrustee1"];
  //     const isDedHash = await simpleT.DED();
  //     const signedMessage = succesorTrustee.signMessage(
  //       ethers.utils.arrayify(isDedHash)
  //     );

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .initiateTrustExecution(signedMessage);

  //     const Beneficiary1 = wallets["Beneficiary1"].address;
  //     const Beneficiary2 = wallets["Beneficiary2"].address;

  //     const isInArrayResult1_0 = await simpleT.findIsABeneficiary(Beneficiary1);
  //     const isInArrayResult2_0 = await simpleT.findIsABeneficiary(Beneficiary2);
  //     expect(isInArrayResult1_0).to.be.true;
  //     expect(isInArrayResult2_0).to.be.true;

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .beneficiaryDeceasedProRata(Beneficiary2);

  //     const isInArrayResult1_1 = await simpleT.findIsABeneficiary(Beneficiary1);
  //     const isInArrayResult2_1 = await simpleT.findIsABeneficiary(Beneficiary2);
  //     expect(isInArrayResult1_1).to.be.true;
  //     expect(isInArrayResult2_1).to.be.false;
  //   });

  //   it("beneficiaryDeceasedProRata: Role removed", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     // Assign assets
  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

  //     // Checkin Period Expires
  //     const expiration = await simpleT.getExpirationTime();
  //     await time.increaseTo(expiration);

  //     // Trustee Signs message to start trust execution
  //     const succesorTrustee = wallets["SuccessorTrustee1"];
  //     const isDedHash = await simpleT.DED();
  //     const signedMessage = succesorTrustee.signMessage(
  //       ethers.utils.arrayify(isDedHash)
  //     );

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .initiateTrustExecution(signedMessage);

  //     const Beneficiary1 = wallets["Beneficiary1"].address;
  //     const Beneficiary2 = wallets["Beneficiary2"].address;

  //     const hasRoleResult1_0 = await simpleT.hasRole(
  //       BENEFICIARY_ROLE,
  //       Beneficiary1
  //     );
  //     const hasRoleResult2_0 = await simpleT.hasRole(
  //       BENEFICIARY_ROLE,
  //       Beneficiary2
  //     );
  //     expect(hasRoleResult1_0).to.be.true;
  //     expect(hasRoleResult2_0).to.be.true;

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .beneficiaryDeceasedProRata(Beneficiary2);

  //     const hasRoleResult1_1 = await simpleT.hasRole(
  //       BENEFICIARY_ROLE,
  //       Beneficiary1
  //     );
  //     const hasRoleResult2_1 = await simpleT.hasRole(
  //       BENEFICIARY_ROLE,
  //       Beneficiary2
  //     );
  //     expect(hasRoleResult1_1).to.be.true;
  //     expect(hasRoleResult2_1).to.be.false;
  //   });

  //   it("beneficiaryDeceasedProRata: Event Emitted", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     // Assign assets
  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

  //     // Checkin Period Expires
  //     const expiration = await simpleT.getExpirationTime();
  //     await time.increaseTo(expiration);

  //     // Trustee Signs message to start trust execution
  //     const succesorTrustee = wallets["SuccessorTrustee1"];
  //     const isDedHash = await simpleT.DED();
  //     const signedMessage = succesorTrustee.signMessage(
  //       ethers.utils.arrayify(isDedHash)
  //     );

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .initiateTrustExecution(signedMessage);

  //     // Get Beneficiary 2 details
  //     const Beneficiary2 = wallets["Beneficiary2"].address;
  //     const shares_Beneficiary2_0 = await simpleT.beneficiaryShares(
  //       Beneficiary2
  //     );

  //     // Specify that a beneficiary deceased pro-rata
  //     await expect(
  //       await simpleT
  //         .connect(succesorTrustee)
  //         .beneficiaryDeceasedProRata(Beneficiary2)
  //     )
  //       .to.emit(simpleT, "BeneficiaryRemoved")
  //       .withArgs(succesorTrustee.address, Beneficiary2, shares_Beneficiary2_0);
  //   });

  //   it("beneficiaryDeceasedProRata: Event Emitted 2", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     // Assign assets
  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

  //     // Checkin Period Expires
  //     const expiration = await simpleT.getExpirationTime();
  //     await time.increaseTo(expiration);

  //     // Trustee Signs message to start trust execution
  //     const succesorTrustee = wallets["SuccessorTrustee1"];
  //     const isDedHash = await simpleT.DED();
  //     const signedMessage = succesorTrustee.signMessage(
  //       ethers.utils.arrayify(isDedHash)
  //     );

  //     await simpleT
  //       .connect(succesorTrustee)
  //       .initiateTrustExecution(signedMessage);

  //     const Beneficiary2 = wallets["Beneficiary2"].address;
  //     const shares_Beneficiary2_0 = await simpleT.beneficiaryShares(
  //       Beneficiary2
  //     );

  //     await expect(
  //       await simpleT
  //         .connect(succesorTrustee)
  //         .beneficiaryDeceasedProRata(Beneficiary2)
  //     )
  //       .to.emit(simpleT, "BeneficiaryUpdatedProRata")
  //       .withArgs(succesorTrustee.address, Beneficiary2, shares_Beneficiary2_0);
  //   });
  // });
});
