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

  describe("Adding Grantors", () => {
    it("addGrantors: Correct Length", async () => {
      const { wallets, simpleT } = await deployFixture();
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;

      const N0 = await simpleT.getGrantorsLength();
      await simpleT.addGrantors([newAddress1, newAddress2]);
      const N1 = await simpleT.getGrantorsLength();
      expect(N0.add(2)).to.equal(N1);
    });

    it("addGrantors: Correct Addresses added", async () => {
      const { wallets, simpleT } = await deployFixture();
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      await simpleT.addGrantors([newAddress1, newAddress2]);
      const isGrantorResult1 = await simpleT.findIsAGrantor(newAddress1);
      expect(isGrantorResult1).to.be.true;
      const isGrantorResult2 = await simpleT.findIsAGrantor(newAddress2);
      expect(isGrantorResult2).to.be.true;
    });

    it("addGrantors: Role added", async () => {
      const { wallets, simpleT } = await deployFixture();
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const hasRoleResult01 = await simpleT.hasRole(GRANTOR_ROLE, newAddress1);
      const hasRoleResult02 = await simpleT.hasRole(GRANTOR_ROLE, newAddress2);
      expect(hasRoleResult01).to.be.false;
      expect(hasRoleResult02).to.be.false;

      await simpleT.addGrantors([newAddress1, newAddress2]);

      const hasRoleResult11 = await simpleT.hasRole(GRANTOR_ROLE, newAddress1);
      const hasRoleResult12 = await simpleT.hasRole(GRANTOR_ROLE, newAddress2);
      expect(hasRoleResult11).to.be.true;
      expect(hasRoleResult12).to.be.true;
    });

    it("addGrantor: Event Emitted", async () => {
      const { wallets, simpleT } = await deployFixture();
      const initialTrustee = wallets["InitialTrustee"].address;
      const newAddress = wallets["SuccessorTrustee1"].address;

      await expect(simpleT.addGrantors([newAddress]))
        .to.emit(simpleT, "AddedGrantor")
        .withArgs(initialTrustee, newAddress);
    });
  });

  describe("Removing Grantor", () => {
    it("grantorRemoveSelf: Correct Length", async () => {
      const { wallets, simpleT } = await deployFixture();

      const N0 = await simpleT.getGrantorsLength();
      await simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const N1 = await simpleT.getGrantorsLength();
      expect(N0.sub(1)).to.equal(N1);

      await simpleT.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const N2 = await simpleT.getGrantorsLength();
      expect(N1.sub(1)).to.equal(N2);
    });

    it("grantorRemoveSelf: Correct Addresses removed", async () => {
      const { wallets, simpleT } = await deployFixture();
      const removeAddress = wallets["Grantor2"].address;

      const isGrantorResult1 = await simpleT.findIsAGrantor(removeAddress);
      expect(isGrantorResult1).to.be.true;

      await simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const isGrantorResult2 = await simpleT.findIsAGrantor(removeAddress);
      expect(isGrantorResult2).to.be.false;

      const removeAddress2 = wallets["InitialTrustee"].address;
      const isGrantorResult3 = await simpleT.findIsAGrantor(removeAddress2);
      expect(isGrantorResult3).to.be.true;
      await simpleT.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const isGrantorResult4 = await simpleT.findIsAGrantor(removeAddress2);
      expect(isGrantorResult4).to.be.false;
    });

    it("grantorRemoveSelf: Role removed", async () => {
      const { wallets, simpleT } = await deployFixture();
      const removeAddress = wallets["Grantor2"].address;
      const hasRoleResult1 = await simpleT.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult1).to.be.true;

      await simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const hasRoleResult2 = await simpleT.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult2).to.be.false;

      const removeAddress2 = wallets["InitialTrustee"].address;
      const hasRoleResult3 = await simpleT.hasRole(
        GRANTOR_ROLE,
        removeAddress2
      );
      expect(hasRoleResult3).to.be.true;

      await simpleT.grantorRemoveSelf();
      const hasRoleResult4 = await simpleT.hasRole(
        GRANTOR_ROLE,
        removeAddress2
      );
      expect(hasRoleResult4).to.be.false;
    });

    it("grantorRemoveSelf: Tokens Burned", async () => {
      const { wallets, simpleT } = await deployFixture();

      const removeAddress = wallets["Grantor2"].address;
      const tokensPerGrantor = await simpleT.TOKENS_PER_GRANTOR();
      const tokenID = await simpleT.getGrantorsTokenID(removeAddress);
      const tokenBal1 = await simpleT.balanceOf(removeAddress, tokenID);
      expect(tokenBal1).to.equal(tokensPerGrantor);

      await simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const tokenBal2 = await simpleT.balanceOf(removeAddress, tokenID);
      expect(tokenBal2).to.equal(0);
    });

    it("grantorRemoveSelf: Event Emitted", async () => {
      const { wallets, simpleT } = await deployFixture();
      const initialTrustee = wallets["InitialTrustee"].address;
      const removeAddress = wallets["Grantor2"].address;

      await expect(simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf())
        .to.emit(simpleT, "RemovedGrantor")
        .withArgs(removeAddress, removeAddress);
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor.
     * */
    it("grantorRemoveSelf: State changed 1", async () => {
      const { wallets, simpleT } = await deployFixture();

      const N0 = await simpleT.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      await simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Inactive");

      await simpleT.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const state3 = await simpleT.returnTrustState();
      expect(state3).to.equal("Inactive");
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor. Uses a different order of removal than above.
     * */
    it("grantorRemoveSelf: State changed 2", async () => {
      const { wallets, simpleT } = await deployFixture();

      const N0 = await simpleT.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      await simpleT.connect(wallets["InitialTrustee"]).grantorRemoveSelf();
      const N1 = await simpleT.getGrantorsLength();
      expect(N0.sub(1)).to.equal(N1);
      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Active");

      await simpleT.connect(wallets["Grantor2"]).grantorRemoveSelf();
      const N2 = await simpleT.getGrantorsLength();
      expect(N2).to.equal(0);
      const state3 = await simpleT.returnTrustState();
      expect(state3).to.equal("Inactive");
    });

    it("adminRemoveGrantor: Correct Length", async () => {
      const { wallets, simpleT } = await deployFixture();

      const N0 = await simpleT.getGrantorsLength();
      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["Grantor2"].address);
      const N1 = await simpleT.getGrantorsLength();
      expect(N0.sub(1)).to.equal(N1);

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["InitialTrustee"].address);
      const N2 = await simpleT.getGrantorsLength();
      expect(N1.sub(1)).to.equal(N2);
    });

    it("adminRemoveGrantor: Correct Addresses removed", async () => {
      const { wallets, simpleT } = await deployFixture();
      const removeAddress = wallets["Grantor2"].address;

      const isGrantorResult1 = await simpleT.findIsAGrantor(removeAddress);
      expect(isGrantorResult1).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress);
      const isGrantorResult2 = await simpleT.findIsAGrantor(removeAddress);
      expect(isGrantorResult2).to.be.false;

      const removeAddress2 = wallets["InitialTrustee"].address;
      const isGrantorResult3 = await simpleT.findIsAGrantor(removeAddress2);
      expect(isGrantorResult3).to.be.true;
      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress2);
      const isGrantorResult4 = await simpleT.findIsAGrantor(removeAddress2);
      expect(isGrantorResult4).to.be.false;
    });

    it("adminRemoveGrantor: Role removed", async () => {
      const { wallets, simpleT } = await deployFixture();
      const removeAddress = wallets["Grantor2"].address;
      const hasRoleResult1 = await simpleT.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult1).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress);
      const hasRoleResult2 = await simpleT.hasRole(GRANTOR_ROLE, removeAddress);
      expect(hasRoleResult2).to.be.false;

      const removeAddress2 = wallets["InitialTrustee"].address;
      const hasRoleResult3 = await simpleT.hasRole(
        GRANTOR_ROLE,
        removeAddress2
      );
      expect(hasRoleResult3).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress2);
      const hasRoleResult4 = await simpleT.hasRole(
        GRANTOR_ROLE,
        removeAddress2
      );
      expect(hasRoleResult4).to.be.false;
    });

    it("adminRemoveGrantor: Tokens Burned", async () => {
      const { wallets, simpleT } = await deployFixture();

      const removeAddress = wallets["Grantor2"].address;
      const tokensPerGrantor = await simpleT.TOKENS_PER_GRANTOR();
      const tokenID = await simpleT.getGrantorsTokenID(removeAddress);
      const tokenBal1 = await simpleT.balanceOf(removeAddress, tokenID);
      expect(tokenBal1).to.equal(tokensPerGrantor);

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(removeAddress);
      const tokenBal2 = await simpleT.balanceOf(removeAddress, tokenID);
      expect(tokenBal2).to.equal(0);
    });

    it("adminRemoveGrantor: Event Emitted", async () => {
      const { wallets, simpleT } = await deployFixture();
      const initialTrustee = wallets["InitialTrustee"].address;
      const removeAddress = wallets["Grantor2"].address;

      await expect(
        simpleT
          .connect(wallets["InitialTrustee"])
          .adminRemoveGrantor(removeAddress)
      )
        .to.emit(simpleT, "RemovedGrantor")
        .withArgs(initialTrustee, removeAddress);
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor.
     * */
    it("adminRemoveGrantor: State changed 1", async () => {
      const { wallets, simpleT } = await deployFixture();

      const N0 = await simpleT.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["Grantor2"].address);
      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Inactive");

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["InitialTrustee"].address);
      const state3 = await simpleT.returnTrustState();
      expect(state3).to.equal("Inactive");
    });

    /** This test will activate the trust by assigning assets
     * to the trust and then inactivate the trust by removing
     * the grantor. Uses a different order of removal than above.
     * */
    it("adminRemoveGrantor: State changed 2", async () => {
      const { wallets, simpleT } = await deployFixture();

      const N0 = await simpleT.getGrantorsLength();
      expect(N0).to.equal(2);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["InitialTrustee"].address);
      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Active");

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveGrantor(wallets["Grantor2"].address);
      const state3 = await simpleT.returnTrustState();
      expect(state3).to.equal("Inactive");
    });
  });

  // describe("Assign Assets", () => {
  //   it("assignAssetsToTrust: tokens transfered", async () => {
  //     const { wallets, simpleT } = await deployFixture();
  //     const Grantor2 = wallets["Grantor2"].address;
  //     const tokensPerGrantor = await simpleT.TOKENS_PER_GRANTOR();

  //     const tokenID = await simpleT.getGrantorsTokenID(Grantor2);
  //     const tokenBal0 = await simpleT.balanceOf(Grantor2, tokenID);
  //     expect(tokenBal0).to.equal(tokensPerGrantor);

  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
  //     const tokenBal1 = await simpleT.balanceOf(Grantor2, tokenID);
  //     expect(tokenBal1).to.equal(0);
  //   });

  //   it("assignAssetsToTrust: state changed", async () => {
  //     const { wallets, simpleT } = await deployFixture();

  //     const state0 = await simpleT.returnTrustState();
  //     expect(state0).to.equal("Inactive");
  //     await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
  //     const state1 = await simpleT.returnTrustState();
  //     expect(state1).to.equal("Active");
  //   });

  //   it("assignAssetsToTrust: Event Emitted", async () => {
  //     const { wallets, simpleT } = await deployFixture();

  //     const state0 = await simpleT.returnTrustState();

  //     const initialTrustee = wallets["InitialTrustee"].address;
  //     await expect(
  //       simpleT.connect(wallets["InitialTrustee"]).assignAssetsToTrust()
  //     )
  //       .to.emit(simpleT, "AssetsAssigned")
  //       .withArgs(initialTrustee);
  //   });
  // });

  // it("Set Distribution", async () => {
  //   const { wallets, simpleT } = await deployFixture();

  //   expect(await simpleT.returnDistributionType()).to.equal("perStirpes");

  //   const newDist = "proRata";
  //   await simpleT.connect(wallets["InitialTrustee"]).setDistribution(newDist);
  //   expect(await simpleT.returnDistributionType()).to.equal(newDist);

  //   const newDist2 = "perStirpes";
  //   await simpleT.connect(wallets["InitialTrustee"]).setDistribution(newDist2);
  //   expect(await simpleT.returnDistributionType()).to.equal(newDist2);
  // });
});
