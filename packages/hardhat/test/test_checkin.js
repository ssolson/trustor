const { use, expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

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
    const SuccessorTrustees = [
      SuccessorTrustee1.address,
      SuccessorTrustee2.address,
    ];
    const SuccessorTrusteePositions = [0, 1];
    const SuccessorTrusteePeriod = 2;
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
      Shares,
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
    };

    return { wallets, simpleT };
  }

  describe("CheckIn Period", () => {
    it("CheckIn Period: Initialized Correct Length", async () => {
      const { wallets, simpleT } = await deployFixture();
      const N0InSeconds = await simpleT.checkInPeriod();
      const secondsInADay = 3600 * 24;
      const N0InDays = N0InSeconds / secondsInADay;

      expect(N0InDays).to.equal(2);
    });

    it("setCheckInPeriod: Correct Length", async () => {
      const { wallets, simpleT } = await deployFixture();

      const period = 365;
      const secondsInADay = 3600 * 24;

      await simpleT.connect(wallets["InitialTrustee"]).setCheckInPeriod(period);
      const N0InSeconds = await simpleT.checkInPeriod();

      const N0InDays = N0InSeconds / secondsInADay;

      expect(N0InDays).to.equal(period);
    });

    it("setCheckInPeriod: Event Emitted", async () => {
      const { wallets, simpleT } = await deployFixture();

      const period = 365;
      const secondsInADay = 3600 * 24;
      const initialTrustee = wallets["InitialTrustee"].address;

      await simpleT.setCheckInPeriod(period);

      await expect(
        simpleT.connect(wallets["InitialTrustee"]).setCheckInPeriod(period)
      )
        .to.emit(simpleT, "PeriodSet")
        .withArgs(initialTrustee, period);
    });
  });

  describe("Check In", () => {
    it("checkInNow: Update ", async () => {
      const { wallets, simpleT } = await deployFixture();

      const t0 = await time.latest();
      console.log("t0", t0);

      await simpleT.checkInNow();

      const lastCheckInTime = await simpleT.lastCheckInTime();

      const t1 = await time.latest();
      console.log("t1", t1);
      console.log("lastCheckInTime", lastCheckInTime);
      expect(t1).to.equal(lastCheckInTime);
    });
  });

  describe("Expiration", () => {
    it("Expiration: Correct time", async () => {
      const { wallets, simpleT } = await deployFixture();
      const N0InSeconds = await simpleT.checkInPeriod();

      const lastCheckInTime = await simpleT.lastCheckInTime();
      const expirationTime = await simpleT.getExpirationTime();

      expect(expirationTime).to.equal(lastCheckInTime.add(N0InSeconds));
    });
  });
});
