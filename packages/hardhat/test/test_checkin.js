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

  describe("CheckIn Period", () => {
    it("CheckIn Period: Initialized Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const ERC1155 = await ethers.getContractFactory("ERC1155");
      const erc1155 = await ERC1155.attach(routerAddress);
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      const Grantor = await ethers.getContractFactory("Grantor");
      const grantor = await Grantor.attach(routerAddress);
      const Trustee = await ethers.getContractFactory("Trustee");
      const trustee = await Trustee.attach(routerAddress);

      // Get the set period 
      const N0InSeconds = await checkIn.getCheckInPeriod();

      // Should be equal to SuccessorTrusteePeriod set in fixture
      const secondsInADay = 3600 * 24;
      const N0InDays = N0InSeconds / secondsInADay;
      expect(N0InDays).to.equal(2);
    });

    it("setCheckInPeriod: Correct Length", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);
      
      // Set new period 
      const period = 365;
      await checkIn.connect(wallets["InitialTrustee"]).setCheckInPeriod(period);

      // Get the current Checkin Period 
      const N0InSeconds = await checkIn.getCheckInPeriod();

      // Returned period should be equal to set period
      const secondsInADay = 3600 * 24;
      const N0InDays = N0InSeconds / secondsInADay;
      expect(N0InDays).to.equal(period);
    });

    it("setCheckInPeriod: Event Emitted", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      // Check set new period event
      const period = 365;
      await expect(
        checkIn.connect(wallets["InitialTrustee"]).setCheckInPeriod(period)
      )
        .to.emit(checkIn, "PeriodSet")
        .withArgs(wallets["InitialTrustee"].address, period);
    });
  });

  describe("Check In", () => {
    it("checkInNow: Update ", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      // Checkin then request the last checkin time
      await checkIn.checkInNow();
      const lastCheckInTime = await checkIn.getLastCheckInTime();

      // Last checkin time should be equal to now/latest
      const t1 = await time.latest();
      expect(t1).to.equal(lastCheckInTime);
    });
  });

  describe("Expiration", () => {
    it("Expiration: Correct time", async () => {
      // Deploy Contract & Initialize
      const { wallets, routerAddress } = await loadFixture(deployFixture);

      // Attach ABI
      const CheckIn = await ethers.getContractFactory("CheckIn");
      const checkIn = await CheckIn.attach(routerAddress);

      // Get Period
      const N0InSeconds = await checkIn.getCheckInPeriod();

      //  Time 0
      const lastCheckInTime = await checkIn.getLastCheckInTime();

      // Time Final
      const expirationTime = await checkIn.getExpirationTime();

      // Time Final = Time0 + Period
      expect(expirationTime).to.equal(lastCheckInTime.add(N0InSeconds));
    });
  });
});
