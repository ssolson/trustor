const { use, expect } = require("chai");
const hre = require("hardhat");
// const { ethers } = hre;

const { ethers } = require("hardhat");
// const { ethers } = require("@nomiclabs/hardhat-ethers");

const { time } = require("@nomicfoundation/hardhat-network-helpers");

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
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

  describe("Has Role", () => {
    let addressNames2Roles = {
      InitialTrustee: [DEFAULT_ADMIN_ROLE, INITIAL_TRUSTEE_ROLE, GRANTOR_ROLE],
      Grantor2: [GRANTOR_ROLE],
      SuccessorTrustee1: [SUCCESSOR_TRUSTEE_ROLE],
      SuccessorTrustee1: [SUCCESSOR_TRUSTEE_ROLE],
      Beneficiary1: [BENEFICIARY_ROLE],
      Beneficiary2: [BENEFICIARY_ROLE],
    };

    const addressNames = Object.keys(addressNames2Roles);
    addressNames.forEach((addressName) => {
      let roles = addressNames2Roles[addressName];
      roles.forEach((role) => {
        it(`${addressName} is ${role}`, async () => {
          const { wallets, simpleT } = await deployFixture();
          const hasRoleResult = await simpleT.hasRole(
            role,
            wallets[addressName].address
          );
          expect(hasRoleResult).to.equal(true);
        });
      });
    });
  });

  describe("Only DEFAULT_ADMIN_ROLE", () => {
    let randAddress = ethers.Wallet.createRandom().address;
    let AdminFuncs = {
      setInitialTrustee: [randAddress],
    };

    const keys = Object.keys(AdminFuncs);
    keys.forEach(async (func) => {
      let argz = AdminFuncs[func];
      const { wallets, simpleT } = await deployFixture();

      it(`${func} Correct Role`, async () => {
        const { wallets, simpleT } = await deployFixture();
        const InitialTrustee = wallets["InitialTrustee"];
        await expect(simpleT.connect(InitialTrustee)[func](...argz)).to.be.ok;
      });

      it(`${func} Incorrect Role`, async () => {
        const { wallets, simpleT } = await deployFixture();
        const SuccessorTrustee1 = wallets["SuccessorTrustee1"];
        await expect(simpleT.connect(SuccessorTrustee1)[func](...argz)).to.be
          .reverted;
      });
    });
  });

  describe("Only INITIAL_TRUSTEE_ROLE Role", () => {
    let randAddress = ethers.Wallet.createRandom().address;
    let initialTrusteeFuncs = {
      checkInNow: [null],
      setCheckInPeriod: [1],
      addGrantor: [randAddress],
      addGrantors: [[randAddress]],
      addSuccessorTrustee: [randAddress],
      addSuccessorTrustees: [[randAddress]],
      setSuccessorPeriod: [1],
      removeTrustee: [randAddress],
      resetTrustees: [null],
      setBeneficiaries: [[randAddress], [100]],
    };

    const keys = Object.keys(initialTrusteeFuncs);
    keys.forEach((func) => {
      let argz = initialTrusteeFuncs[func];

      it(`${func} Correct Role`, async () => {
        const { wallets, simpleT } = await deployFixture();
        const InitialTrustee = wallets["InitialTrustee"];
        await expect(simpleT.connect(InitialTrustee)[func](...argz)).to.be.ok;
      });

      it(`${func} Incorrect Role`, async () => {
        const { wallets, simpleT } = await deployFixture();
        const Grantor2 = wallets["Grantor2"];
        await expect(simpleT.connect(Grantor2)[func](...argz)).to.be.reverted;
        // The line below does not work due to mixed capitalization between expected and returned
        //.to.be.revertedWith(`AccessControl: account ${Trustee.address} is missing role ${GRANTOR_ROLE}`);
      });
    });
  });

  describe("Only Grantor_ROLE Role", () => {
    let randAddress = ethers.Wallet.createRandom().address;
    let GrantorFuncs = {
      assignAssetsToTrust: [null],
    };

    const keys = Object.keys(GrantorFuncs);
    keys.forEach((func) => {
      let argz = GrantorFuncs[func];

      it(`${func} Correct Role`, async () => {
        const { wallets, simpleT } = await deployFixture();
        const Grantor2 = wallets["Grantor2"];
        await expect(simpleT.connect(Grantor2)[func](...argz)).to.be.ok;
      });

      it(`${func} Incorrect Role`, async () => {
        const { wallets, simpleT } = await deployFixture();
        const SuccessorTrustee1 = wallets["SuccessorTrustee1"];
        await expect(simpleT.connect(SuccessorTrustee1)[func](...argz)).to.be
          .reverted;
      });
    });
  });
});
