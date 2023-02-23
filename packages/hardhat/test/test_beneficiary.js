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

describe("🚩 🏵 Beneficiary 🤖", async function () {
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

  async function deployFixture2() {
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

    // Attach ABI
    const Initialize = await ethers.getContractFactory("Initialize");
    const initialize = await Initialize.attach(routerAddress);
    const BeneficiaryC = await ethers.getContractFactory("Beneficiary");
    const beneficiary = await BeneficiaryC.attach(routerAddress);
    const Trustee = await ethers.getContractFactory("Trustee");
    const trustee = await Trustee.attach(routerAddress);
    const Grantor = await ethers.getContractFactory("Grantor");
    const grantor = await Grantor.attach(routerAddress);
    const CheckIn = await ethers.getContractFactory("CheckIn");
    const checkIn = await CheckIn.attach(routerAddress);
    const ERC1155 = await ethers.getContractFactory("ERC1155");
    const erc1155 = await ERC1155.attach(routerAddress);
    const Access = await ethers.getContractFactory("AccessControl");
    const access = await Access.attach(routerAddress);

    await initialize.initializeInitializableModule(...argz);

    const expiration = await checkIn.getExpirationTime();

    await grantor.connect(Grantor2).assignAssetsToTrust();

    // const succesorTrustee = wallets["SuccessorTrustee1"];
    const isDedHash = await trustee.getDEDHash();
    const signedMessage = SuccessorTrustee1.signMessage(
      ethers.utils.arrayify(isDedHash)
    );

    await time.increaseTo(expiration);

    await trustee
      .connect(SuccessorTrustee1)
      .initiateTrustExecution(signedMessage);

    await trustee.connect(SuccessorTrustee1).openClaims();

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
  /** ProRata with 3 Beneficiaries */
  async function deployFixture3() {
    const [
      InitialTrustee,
      Grantor2,
      SuccessorTrustee1,
      SuccessorTrustee2,
      Beneficiary1,
      Beneficiary2,
      Beneficiary3,
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
    const Beneficiary = [
      Beneficiary1.address,
      Beneficiary2.address,
      Beneficiary3.address,
    ];
    const Shares = [50, 25, 25];

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

    // Attach ABI
    const Initialize = await ethers.getContractFactory("Initialize");
    const initialize = await Initialize.attach(routerAddress);
    const BeneficiaryC = await ethers.getContractFactory("Beneficiary");
    const beneficiary = await BeneficiaryC.attach(routerAddress);
    const Trustee = await ethers.getContractFactory("Trustee");
    const trustee = await Trustee.attach(routerAddress);
    const Grantor = await ethers.getContractFactory("Grantor");
    const grantor = await Grantor.attach(routerAddress);
    const CheckIn = await ethers.getContractFactory("CheckIn");
    const checkIn = await CheckIn.attach(routerAddress);
    const ERC1155 = await ethers.getContractFactory("ERC1155");
    const erc1155 = await ERC1155.attach(routerAddress);
    const Access = await ethers.getContractFactory("AccessControl");
    const access = await Access.attach(routerAddress);

    await initialize.initializeInitializableModule(...argz);

    const expiration = await checkIn.getExpirationTime();

    await grantor.connect(Grantor2).assignAssetsToTrust();

    // const succesorTrustee = wallets["SuccessorTrustee1"];
    const isDedHash = await trustee.getDEDHash();
    const signedMessage = SuccessorTrustee1.signMessage(
      ethers.utils.arrayify(isDedHash)
    );

    await time.increaseTo(expiration);

    await trustee
      .connect(SuccessorTrustee1)
      .initiateTrustExecution(signedMessage);

    const wallets = {
      InitialTrustee: InitialTrustee,
      Grantor2: Grantor2,
      SuccessorTrustee1: SuccessorTrustee1,
      SuccessorTrustee2: SuccessorTrustee2,
      Beneficiary1: Beneficiary1,
      Beneficiary2: Beneficiary2,
      Beneficiary3: Beneficiary3,
    };

    return { wallets, routerAddress };
  }

  describe("Adding Beneficiary", async () => {
    it("setBeneficiary: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      const N0 = await beneficiary.getBeneficiariesLength();
      const initialTrustee = wallets["InitialTrustee"];
      await beneficiary
        .connect(initialTrustee)
        .setBeneficiaries([wallets["SuccessorTrustee1"].address], [1]);

      const N1 = await beneficiary.getBeneficiariesLength();
      expect(N0.add(1)).to.equal(N1);
    });

    it("setBeneficiary: Correct Address added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      // Add Beneficiary
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      // Beneficiary should in in beneficary Array
      const isInArray = await beneficiary.findIsABeneficiary(newAddress);
      expect(isInArray).to.be.true;
    });

    it("setBeneficiary: Correct Shares added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      // Shares should start at zero
      const shares0 = await beneficiary.getBeneficiaryShares(newAddress);
      expect(shares0).to.equal(0);

      // Set the beneficiary
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      // Shares should now equal new shares
      const shares1 = await beneficiary.getBeneficiaryShares(newAddress);
      expect(shares1).to.equal(newShares);
    });

    it("setBeneficiary: Total Shares increased", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      // Beneficiary should have non zero shares
      const shares0 = await beneficiary.getTotalShares();
      expect(shares0).to.not.equal(0);

      // Set the new shares
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      // Shares should have increased by new shares
      const shares1 = await beneficiary.getTotalShares();
      expect(shares1).to.equal(shares0.add(newShares));
    });

    it("setBeneficiary: Update Beneficary Shares", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // Old Beneficiary, new shares
      const address = wallets["Beneficiary1"].address;
      const newShares = 1;

      // Check current shares
      const shares0 = await beneficiary.getBeneficiaryShares(address);
      expect(shares0).to.not.equal(0);
      expect(shares0).to.not.equal(newShares);

      // Set shares
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([address], [newShares]);

      // Shares should be reset
      const shares1 = await beneficiary.getBeneficiaryShares(address);
      expect(shares1).to.equal(newShares);
    });

    it("setBeneficiary: Total Shares on Beneficiary Update", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // Old Beneficiary, new shares
      const address = wallets["Beneficiary1"].address;
      const newShares = 1;

      // Check current shares
      const shares0 = await beneficiary.getBeneficiaryShares(address);
      expect(shares0).to.not.equal(0);
      expect(shares0).to.not.equal(newShares);

      const totalShares0 = await beneficiary.getTotalShares();

      // Set shares
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([address], [newShares]);

      // Check that Total shares increased
      const totalshares1 = await beneficiary.getTotalShares();
      expect(totalshares1).to.equal(totalShares0.sub(shares0).add(newShares));
    });

    it("setBeneficiary: Role added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      const hasRoleResult0 = await access.hasRole(BENEFICIARY_ROLE, newAddress);
      expect(hasRoleResult0).to.be.false;

      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      const hasRoleResult1 = await access.hasRole(BENEFICIARY_ROLE, newAddress);
      expect(hasRoleResult1).to.be.true;
    });

    it("setBeneficiary: BeneficiaryAdded Event Emitted ", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      await expect(
        await beneficiary
          .connect(wallets["InitialTrustee"])
          .setBeneficiaries([newAddress], [newShares])
      )
        .to.emit(beneficiary, "BeneficiaryAdded")
        .withArgs(wallets["InitialTrustee"].address, newAddress, newShares);
    });

    it("setBeneficiary: BeneficiaryUpdated Event Emitted ", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const address = wallets["Beneficiary1"].address;
      const newShares = 1;

      await expect(
        await beneficiary
          .connect(wallets["InitialTrustee"])
          .setBeneficiaries([address], [newShares])
      )
        .to.emit(beneficiary, "BeneficiaryUpdated")
        .withArgs(wallets["InitialTrustee"].address, address, newShares);
    });
  });

  describe("Adding Beneficiaries", () => {
    it("setBeneficiary: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const newShares1 = 1;
      const newShares2 = 2;
      const newAddresses = [newAddress1, newAddress2];
      const newShares = [newShares1, newShares2];

      // Number of Beneficiaries should increase by 2
      const N0 = await beneficiary.getBeneficiariesLength();
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries(newAddresses, newShares);
      const N1 = await beneficiary.getBeneficiariesLength();
      expect(N0.add(2)).to.equal(N1);
    });

    it("setBeneficiary: Correct Addresses added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const newShares1 = 1;
      const newShares2 = 2;
      const newAddresses = [newAddress1, newAddress2];
      const newShares = [newShares1, newShares2];

      // Set the wallets as beneficaries
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries(newAddresses, newShares);

      // Both addresses should be in beneficiary array
      const isInArrayResult1 = await beneficiary.findIsABeneficiary(
        newAddress1
      );
      expect(isInArrayResult1).to.be.true;
      const isInArrayResult2 = await beneficiary.findIsABeneficiary(
        newAddress2
      );
      expect(isInArrayResult2).to.be.true;
    });

    it("setBeneficiary: Role added", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // New Beneficiary and shares
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const newShares1 = 1;
      const newShares2 = 2;
      const newAddresses = [newAddress1, newAddress2];
      const newShares = [newShares1, newShares2];

      // New addresses should not be beneficiaries
      const hasRoleResult01 = await access.hasRole(
        BENEFICIARY_ROLE,
        newAddress1
      );
      const hasRoleResult02 = await access.hasRole(
        BENEFICIARY_ROLE,
        newAddress2
      );
      expect(hasRoleResult01).to.be.false;
      expect(hasRoleResult02).to.be.false;

      // Set the wallets as beneficaries
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries(newAddresses, newShares);

      // New addresses should not be beneficiaries
      const hasRoleResult11 = await access.hasRole(
        BENEFICIARY_ROLE,
        newAddress1
      );
      const hasRoleResult12 = await access.hasRole(
        BENEFICIARY_ROLE,
        newAddress2
      );
      expect(hasRoleResult11).to.be.true;
      expect(hasRoleResult12).to.be.true;
    });
  });

  describe("Removing Beneficiary", () => {
    it("adminRemoveBeneficiary: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // Initial number of Beneficiaries
      const N0 = await beneficiary.getBeneficiariesLength();

      // Remove the Beneficiary
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(wallets["Beneficiary1"].address);

      // Number should decrease by 1
      const N1 = await beneficiary.getBeneficiariesLength();
      expect(N0.sub(1)).to.equal(N1);
    });

    it("adminRemoveBeneficiary: Correct Addresses removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // Address to remove
      const removeAddress = wallets["Beneficiary1"].address;

      // Address should be in beneficiary array
      const isInArrayResult1 = await beneficiary.findIsABeneficiary(
        removeAddress
      );
      expect(isInArrayResult1).to.be.true;

      // Remove the address
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(removeAddress);

      // Address should no longer be in beneficiaries array
      const isInArrayResult2 = await beneficiary.findIsABeneficiary(
        removeAddress
      );
      expect(isInArrayResult2).to.be.false;
    });

    it("adminRemoveBeneficiary: Role removed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      // Beneficiary to remove
      const removeAddress = wallets["Beneficiary1"].address;

      // Beneficiary should have Beneficiary Role
      const hasRoleResult1 = await access.hasRole(
        BENEFICIARY_ROLE,
        removeAddress
      );
      expect(hasRoleResult1).to.be.true;

      // Remove beneficiary
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(removeAddress);

      // Beneficiary should not have beneficary role
      const hasRoleResult2 = await access.hasRole(
        BENEFICIARY_ROLE,
        removeAddress
      );
      expect(hasRoleResult2).to.be.false;
    });

    it("adminRemoveBeneficiary: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // Wallets in emitted Event
      const initialTrustee = wallets["InitialTrustee"].address;
      const removeAddress = wallets["Beneficiary1"].address;

      // Get the shares of the beneficiary
      const shares = await beneficiary.getBeneficiaryShares(removeAddress);

      // Event should be emitted
      await expect(
        beneficiary
          .connect(wallets["InitialTrustee"])
          .adminRemoveBeneficiary(removeAddress)
      )
        .to.emit(beneficiary, "BeneficiaryRemoved")
        .withArgs(initialTrustee, removeAddress, shares);
    });

    it("adminRemoveBeneficiary: Cannot Remove Last Beneficiary", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);

      // Remove the first beneficiary
      await beneficiary
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(wallets["Beneficiary1"].address);

      // Revert & refuse to remove the final beneficiary
      await expect(
        beneficiary
          .connect(wallets["InitialTrustee"])
          .adminRemoveBeneficiary(wallets["Beneficiary2"].address)
      ).to.be.revertedWith(
        "Cannot remove last beneficiary. Please add replacement before removal."
      );
    });
  });

  describe("Open Claims", () => {
    it("openClaims: State Changed", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);
      const Access = await ethers.getContractFactory("AccessControl");
      const access = await Access.attach(routerAddress);

      const expiration = await checkIn.getExpirationTime();

      await grantor.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await trustee.getDEDHash();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await time.increaseTo(expiration);

      await trustee
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      await trustee.connect(succesorTrustee).openClaims();

      const state2 = await checkIn.returnTrustState();
      expect(state2).to.equal("Executed");
    });
  });

  describe("Claim", () => {
    it("claim: Correct Shares Recieved", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture2);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Check the Trust's balance of Grantor2's Toekens
      const tokenID = await grantor.getGrantorsTokenID(
        wallets["Grantor2"].address
      );
      const tokenBal_Trust0 = await erc1155.balanceOf(routerAddress, tokenID);
      expect(tokenBal_Trust0).to.equal(ethers.utils.parseUnits("1.0"));

      // Beneficiary 1 balance should be zero before claiming
      const Beneficiary1 = wallets["Beneficiary1"].address;
      const tokenBal_Beneficiary1_0 = await erc1155.balanceOf(
        Beneficiary1,
        tokenID
      );
      expect(tokenBal_Beneficiary1_0).to.equal(0);

      const shares_Beneficiary1 = await beneficiary.getBeneficiaryShares(
        Beneficiary1
      );
      const totalShares = await beneficiary.getTotalShares();

      await beneficiary.connect(wallets["Beneficiary1"]).claim();

      const tokenBal_Trust_1 = await erc1155.balanceOf(routerAddress, tokenID);
      const tokenBal_Beneficiary1_1 = await erc1155.balanceOf(
        Beneficiary1,
        tokenID
      );

      expect(tokenBal_Trust_1).to.equal(
        tokenBal_Trust0.sub(tokenBal_Beneficiary1_1)
      );
      expect(tokenBal_Beneficiary1_1).to.equal(
        ethers.utils.parseUnits("1.0").mul(shares_Beneficiary1).div(totalShares)
      );

      // Beneficiary 2 Claims
      const Beneficiary2 = wallets["Beneficiary2"].address;

      const tokenBal_Beneficiary2_0 = await erc1155.balanceOf(
        Beneficiary2,
        tokenID
      );

      expect(tokenBal_Beneficiary2_0).to.equal(0);

      const shares_Beneficiary2 = await beneficiary.getBeneficiaryShares(
        Beneficiary2
      );

      await beneficiary.connect(wallets["Beneficiary2"]).claim();

      const tokenBal_Trust_2 = await erc1155.balanceOf(routerAddress, tokenID);
      const tokenBal_Beneficiary2_1 = await erc1155.balanceOf(
        Beneficiary2,
        tokenID
      );

      expect(tokenBal_Trust_2).to.equal(0);
      expect(tokenBal_Beneficiary2_1).to.equal(
        ethers.utils.parseUnits("1.0").mul(shares_Beneficiary2).div(totalShares)
      );
    });

    it("claim: Can only claim once", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture2);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Beneficiary 1 Claims
      const Beneficiary1 = wallets["Beneficiary1"];
      await beneficiary.connect(Beneficiary1).claim();

      // Try to claim again
      await expect(
        beneficiary.connect(Beneficiary1).claim()
      ).to.be.revertedWith("SimpleT: Beneficary has already claimed");

      // Beneficiary 2 Claims
      const Beneficiary2 = wallets["Beneficiary2"];
      await beneficiary.connect(Beneficiary2).claim();

      // Try to claim again
      await expect(
        beneficiary.connect(Beneficiary2).claim()
      ).to.be.revertedWith("SimpleT: Beneficary has already claimed");
    });
  });

  describe("Claim Pro Rata", () => {
    it("claim: Correct Shares Recieved", async () => {
      const { wallets, routerAddress } = await loadFixture(deployFixture3);

      // Attach ABI
      const Beneficiary = await ethers.getContractFactory("Beneficiary");
      const beneficiary = await Beneficiary.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);

      // Get Total  Beneficiaries
      const total_beneficiaries_0 = await beneficiary.getBeneficiariesLength();

      // Get Details on first Beneficairy
      // const totalShares = await simpleT.totalShares();
      const Beneficiary1 = wallets["Beneficiary1"].address;
      const shares_Beneficiary1_0 = await beneficiary.getBeneficiaryShares(
        Beneficiary1
      );

      // Specify that Beneficiary1 deceased pro-rata
      await beneficiary
        .connect(wallets["SuccessorTrustee1"])
        .beneficiaryDeceasedProRata(Beneficiary1);

      // Active Trustee opens assets for claiming
      await trustee.connect(wallets["SuccessorTrustee1"]).openClaims();

      // Get Grantor2 TokenID
      const tokenID = grantor.getGrantorsTokenID(wallets["Grantor2"].address);

      // Beneficiary 2 Claims
      const totalShares = await beneficiary.getTotalShares();
      const tokenBal_Trust_0 = await erc1155.balanceOf(routerAddress, tokenID);
      const Beneficiary2 = wallets["Beneficiary2"];

      const tokenBal_Beneficiary2_0 = await erc1155.balanceOf(
        Beneficiary2.address,
        tokenID
      );

      expect(tokenBal_Beneficiary2_0).to.equal(0);

      const shares_Beneficiary2 = await beneficiary.getBeneficiaryShares(
        Beneficiary2.address
      );

      // Beneficiary2 Claims
      await beneficiary.connect(Beneficiary2).claim();

      // Check number of shares recieved
      const tokenBal_Trust_1 = await erc1155.balanceOf(routerAddress, tokenID);
      const tokenBal_Beneficiary2_1 = await erc1155.balanceOf(
        Beneficiary2.address,
        tokenID
      );

      expect(tokenBal_Trust_1).to.equal(
        tokenBal_Trust_0.sub(tokenBal_Beneficiary2_1)
      );
      expect(tokenBal_Beneficiary2_1).to.equal(
        ethers.utils.parseUnits("1.0").mul(shares_Beneficiary2).div(totalShares)
      );

      // Beneficiary 3 Claims
      const Beneficiary3 = wallets["Beneficiary3"];

      const tokenBal_Beneficiary3_0 = await erc1155.balanceOf(
        Beneficiary3.address,
        tokenID
      );

      expect(tokenBal_Beneficiary3_0).to.equal(0);

      const shares_Beneficiary3 = await beneficiary.getBeneficiaryShares(
        Beneficiary3.address
      );

      await beneficiary.connect(Beneficiary3).claim();

      const tokenBal_Trust_2 = await erc1155.balanceOf(routerAddress, tokenID);
      const tokenBal_Beneficiary3_1 = await erc1155.balanceOf(
        Beneficiary3.address,
        tokenID
      );

      expect(tokenBal_Trust_2).to.equal(0);
      expect(tokenBal_Beneficiary3_1).to.equal(
        ethers.utils.parseUnits("1.0").mul(shares_Beneficiary3).div(totalShares)
      );
    });
  });
});
