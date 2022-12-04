const { use, expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
  time,
} = require("@nomicfoundation/hardhat-network-helpers");
const {
  Contract,
} = require("hardhat/internal/hardhat-network/stack-traces/model");

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const GRANTOR_ROLE = ethers.utils.id("GRANTOR_ROLE");
const INITIAL_TRUSTEE_ROLE = ethers.utils.id("INITIAL_TRUSTEE_ROLE");
const SUCCESSOR_TRUSTEE_ROLE = ethers.utils.id("SUCCESSOR_TRUSTEE_ROLE");
const BENEFICIARY_ROLE = ethers.utils.id("BENEFICIARY_ROLE");
const ACTIVE_TRUSTEE_ROLE = ethers.utils.id("ACTIVE_TRUSTEE_ROLE");

describe("🚩 🏵 Simple Trust 🤖", function () {
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

  // describe("Adding Trustee", async () => {
  //   it("addSuccessorTrustee: Correct Length", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);
  //     const N0 = await simpleT.getSuccessorTrusteeLength();
  //     initialTrustee = wallets["InitialTrustee"];
  //     await simpleT
  //       .connect(initialTrustee)
  //       .addSuccessorTrustee(wallets["Beneficiary1"].address, 1);

  //     const N1 = await simpleT.getSuccessorTrusteeLength();
  //     expect(N0.add(1)).to.equal(N1);
  //   });

  //   it("addSuccessorTrustee: Correct Address added", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     const newAddress = wallets["Beneficiary1"].address;
  //     const newPosition = 3;
  //     await simpleT
  //       .connect(wallets["InitialTrustee"])
  //       .addSuccessorTrustee(newAddress, newPosition);
  //     const isSuccessorTrusteeResult = await simpleT.findIsATrustee(newAddress);
  //     expect(isSuccessorTrusteeResult).to.be.true;
  //   });

  //   it("addSuccessorTrustee: Correct Position added", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);
  //     const newAddress = wallets["Beneficiary1"].address;
  //     const newPosition = 3;
  //     await simpleT
  //       .connect(wallets["InitialTrustee"])
  //       .addSuccessorTrustee(newAddress, newPosition);
  //     const successorTrusteePosition = await simpleT.successorTrusteePosition(
  //       newAddress
  //     );
  //     expect(successorTrusteePosition).to.equal(newPosition);
  //   });

  //   it("addSuccessorTrustee: Role added", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);
  //     const newAddress = wallets["Beneficiary1"].address;
  //     const newPosition = 3;
  //     await simpleT
  //       .connect(wallets["InitialTrustee"])
  //       .addSuccessorTrustee(newAddress, newPosition);
  //     const hasRoleResult1 = await simpleT.hasRole(
  //       SUCCESSOR_TRUSTEE_ROLE,
  //       newAddress
  //     );
  //     expect(hasRoleResult1).to.be.true;
  //   });

  //   it("addSuccessorTrustee: Event Emitted", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);

  //     const newAddress = wallets["Beneficiary1"].address;
  //     const newPosition = 3;

  //     await expect(
  //       simpleT
  //         .connect(wallets["InitialTrustee"])
  //         .addSuccessorTrustee(newAddress, newPosition)
  //     )
  //       .to.emit(simpleT, "AddedSccessorTrustee")
  //       .withArgs(wallets["InitialTrustee"].address, newAddress, newPosition);
  //   });
  // });

  // describe("Adding Trustees", () => {
  //   it("addSuccessorTrustees: Correct Length", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);
  //     const newAddress1 = wallets["Beneficiary1"].address;
  //     const newAddress2 = wallets["Beneficiary2"].address;
  //     const newPosition1 = 4;
  //     const newPosition2 = 5;

  //     const N0 = await simpleT.getSuccessorTrusteeLength();
  //     await simpleT
  //       .connect(wallets["InitialTrustee"])
  //       .addSuccessorTrustees(
  //         [newAddress1, newAddress2],
  //         [newPosition1, newPosition2]
  //       );
  //     const N1 = await simpleT.getSuccessorTrusteeLength();
  //     expect(N0.add(2)).to.equal(N1);
  //   });

  //   it("addSuccessorTrustees: Correct Addresses added", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);
  //     const newAddress1 = wallets["Beneficiary1"].address;
  //     const newAddress2 = wallets["Beneficiary2"].address;
  //     const newPosition1 = 4;
  //     const newPosition2 = 5;

  //     await simpleT
  //       .connect(wallets["InitialTrustee"])
  //       .addSuccessorTrustees(
  //         [newAddress1, newAddress2],
  //         [newPosition1, newPosition2]
  //       );

  //     const isTrusteeResult1 = await simpleT.findIsATrustee(newAddress1);
  //     expect(isTrusteeResult1).to.be.true;
  //     const isTrusteeResult2 = await simpleT.findIsATrustee(newAddress2);
  //     expect(isTrusteeResult2).to.be.true;
  //   });

  //   it("addSuccessorTrustees: Role added", async () => {
  //     const { wallets, simpleT } = await loadFixture(deployFixture);
  //     const newAddress1 = wallets["Beneficiary1"].address;
  //     const newAddress2 = wallets["Beneficiary2"].address;
  //     const newPosition1 = 4;
  //     const newPosition2 = 5;
  //     const hasRoleResult01 = await simpleT.hasRole(
  //       SUCCESSOR_TRUSTEE_ROLE,
  //       newAddress1
  //     );
  //     const hasRoleResult02 = await simpleT.hasRole(
  //       SUCCESSOR_TRUSTEE_ROLE,
  //       newAddress2
  //     );
  //     expect(hasRoleResult01).to.be.false;
  //     expect(hasRoleResult02).to.be.false;

  //     await simpleT
  //       .connect(wallets["InitialTrustee"])
  //       .addSuccessorTrustees(
  //         [newAddress1, newAddress2],
  //         [newPosition1, newPosition2]
  //       );

  //     const hasRoleResult11 = await simpleT.hasRole(
  //       SUCCESSOR_TRUSTEE_ROLE,
  //       newAddress1
  //     );
  //     const hasRoleResult12 = await simpleT.hasRole(
  //       SUCCESSOR_TRUSTEE_ROLE,
  //       newAddress2
  //     );
  //     expect(hasRoleResult11).to.be.true;
  //     expect(hasRoleResult12).to.be.true;
  //   });
  // });

  describe("Removing Trustee", () => {
    it("adminRemoveTrustee: Correct Length", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const N0 = await simpleT.getSuccessorTrusteeLength();

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveSuccessorTrustee(wallets["SuccessorTrustee1"].address);

      const N1 = await simpleT.getSuccessorTrusteeLength();
      expect(N0.sub(1)).to.equal(N1);
    });

    it("adminRemoveTrustee: Correct Addresses removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);
      const removeAddress = wallets["SuccessorTrustee2"].address;

      const isSuccessorTrusteeResult1 = await simpleT.findIsATrustee(
        removeAddress
      );
      expect(isSuccessorTrusteeResult1).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveSuccessorTrustee(removeAddress);

      const isSuccessorTrusteeResult2 = await simpleT.findIsATrustee(
        removeAddress
      );
      expect(isSuccessorTrusteeResult2).to.be.false;
    });

    it("adminRemoveTrustee: Role removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);
      const removeAddress = wallets["SuccessorTrustee2"].address;

      const hasRoleResult1 = await simpleT.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        removeAddress
      );
      expect(hasRoleResult1).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveSuccessorTrustee(removeAddress);

      const hasRoleResult2 = await simpleT.hasRole(
        SUCCESSOR_TRUSTEE_ROLE,
        removeAddress
      );
      expect(hasRoleResult2).to.be.false;
    });

    it("adminRemoveTrustee: Event Emitted", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const initialTrustee = wallets["InitialTrustee"].address;
      const removeAddress = wallets["SuccessorTrustee2"].address;

      const position = await simpleT.successorTrusteePosition(removeAddress);

      await expect(
        simpleT
          .connect(wallets["InitialTrustee"])
          .adminRemoveSuccessorTrustee(removeAddress)
      )
        .to.emit(simpleT, "RemovedSuccessorTrustee")
        .withArgs(initialTrustee, removeAddress, position);
    });

    // TODO cannont remove last trustee
    it("adminRemoveTrustee: Cannot Remove Last Trustee", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const N0 = await simpleT.getSuccessorTrusteeLength();

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveSuccessorTrustee(wallets["SuccessorTrustee1"].address);

      await expect(
        simpleT
          .connect(wallets["InitialTrustee"])
          .adminRemoveSuccessorTrustee(wallets["SuccessorTrustee2"].address)
      ).to.be.revertedWith(
        "Cannot remove last successor trustee. Please add replacement before removal."
      );
    });
  });

  describe("Initiate Truste Execution", () => {
    /** This test will test reversion of the first Succesor Trustee
     * prior to expiration. Expects Succesor Trustee 1 to be in
     * first window.
     * */
    it("initiateTrustExecution: CheckIn Time Correct Period 1", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const lastCheckin = await simpleT.lastCheckInTime();
      const checkinPeriod = await simpleT.lastCheckInTime();
      const expiration = await simpleT.getExpirationTime();
      const t0 = await time.latest();

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await expect(
        simpleT.connect(succesorTrustee).initiateTrustExecution(signedMessage)
      ).to.be.revertedWith(
        "This Succesor Trustee is not availble to act on this trust yet."
      );

      await time.increaseTo(expiration);

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);
      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Executing");
    });

    /** This test will test reversion of the 2nd Succesor Trustee
     * prior to expiration. Expects Succesor Trustee 2 to be in
     * not the first window.
     * */
    it("initiateTrustExecution: CheckIn Time Correct Period 2", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const checkinPeriod = await simpleT.successorTrusteePeriod();
      const expiration = await simpleT.getExpirationTime();

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee2"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await expect(
        simpleT.connect(succesorTrustee).initiateTrustExecution(signedMessage)
      ).to.be.revertedWith(
        "This Succesor Trustee is not availble to act on this trust yet."
      );

      await time.increaseTo(expiration);

      await expect(
        simpleT.connect(succesorTrustee).initiateTrustExecution(signedMessage)
      ).to.be.revertedWith(
        "This Succesor Trustee is not availble to act on this trust yet."
      );

      const periods = await simpleT.successorTrusteePosition(
        succesorTrustee.address
      );

      expect(periods).greaterThan(1);

      await time.increaseTo(expiration.add(periods.mul(checkinPeriod)));

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Executing");
    });

    it("initiateTrustExecution: Trust State Changed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();

      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await simpleT.getExpirationTime();
      await time.increaseTo(expiration);

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);
      const state2 = await simpleT.returnTrustState();

      expect(state2).to.equal("Executing");
    });

    it("initiateTrustExecution: Grantor's Role Removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();

      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await simpleT.getExpirationTime();
      await time.increaseTo(expiration);

      const grantor1 = wallets["InitialTrustee"].address;
      const grantor2 = wallets["Grantor2"].address;
      const hasRoleResult1 = await simpleT.hasRole(GRANTOR_ROLE, grantor1);
      const hasRoleResult2 = await simpleT.hasRole(GRANTOR_ROLE, grantor2);
      expect(hasRoleResult1).to.be.true;
      expect(hasRoleResult2).to.be.true;

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult3 = await simpleT.hasRole(GRANTOR_ROLE, grantor1);
      const hasRoleResult4 = await simpleT.hasRole(GRANTOR_ROLE, grantor2);
      expect(hasRoleResult3).to.be.false;
      expect(hasRoleResult4).to.be.false;
    });

    it("initiateTrustExecution: Initial Trustee's Role Removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const state0 = await simpleT.returnTrustState();
      expect(state0).to.equal("Inactive");

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();
      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Active");

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();

      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await simpleT.getExpirationTime();
      await time.increaseTo(expiration);

      const initialTrustee = wallets["InitialTrustee"].address;
      const hasRoleResult1 = await simpleT.hasRole(
        INITIAL_TRUSTEE_ROLE,
        initialTrustee
      );
      expect(hasRoleResult1).to.be.true;

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult3 = await simpleT.hasRole(
        INITIAL_TRUSTEE_ROLE,
        initialTrustee
      );
      expect(hasRoleResult3).to.be.false;
    });

    it("initiateTrustExecution: Sender Granted Active Trustee Role", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const expiration = await simpleT.getExpirationTime();
      await time.increaseTo(expiration);

      const hasRoleResult1 = await simpleT.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee.address
      );
      expect(hasRoleResult1).to.be.false;

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult3 = await simpleT.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee.address
      );
      expect(hasRoleResult3).to.be.true;
    });

    it("initiateTrustExecution: Only 1 Active Trustee", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const checkinPeriod = await simpleT.successorTrusteePeriod();
      const expiration = await simpleT.getExpirationTime();

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const isDedHash1 = await simpleT.DED();
      const signedMessage1 = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash1)
      );

      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash2 = await simpleT.DED();
      const signedMessage2 = succesorTrustee2.signMessage(
        ethers.utils.arrayify(isDedHash2)
      );

      const periods = await simpleT.successorTrusteePosition(
        succesorTrustee2.address
      );

      await time.increaseTo(expiration.add(periods.mul(checkinPeriod)));

      await simpleT
        .connect(succesorTrustee2)
        .initiateTrustExecution(signedMessage2);

      await expect(
        simpleT.connect(succesorTrustee1).initiateTrustExecution(signedMessage1)
      ).to.be.revertedWith("Trust is not in the expected TrustState");
    });
  });

  describe("Remove Active Trustee", () => {
    /** Test the removal of the active Trustee
     * */
    it("removeActiveTrustee: Cannot Remove prior to inaction", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await simpleT.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await simpleT
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      await expect(
        simpleT.connect(succesorTrustee2).removeActiveTrustee()
      ).to.be.revertedWith("Active trustee has not been inactive long enough.");
    });

    it("removeActiveTrustee: ACTIVE_TRUSTEE_ROLE removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await simpleT.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await simpleT
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      const hasRoleResult1 = await simpleT.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee1.address
      );
      expect(hasRoleResult1).to.be.true;

      const trusteeExpiration = await simpleT.getActiveTrusteeExpirationTime();
      await time.increaseTo(trusteeExpiration);

      await simpleT.connect(succesorTrustee2).removeActiveTrustee();

      const hasRoleResult2 = await simpleT.hasRole(
        ACTIVE_TRUSTEE_ROLE,
        succesorTrustee1.address
      );
      expect(hasRoleResult2).to.be.false;
    });

    it("removeActiveTrustee: activeTrustee is adress(0) ", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await simpleT.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await simpleT
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      const activeTrustee1 = await simpleT.activeTrustee();
      expect(activeTrustee1).to.equal(succesorTrustee1.address);

      const trusteeExpiration = await simpleT.getActiveTrusteeExpirationTime();
      await time.increaseTo(trusteeExpiration);

      await simpleT.connect(succesorTrustee2).removeActiveTrustee();

      const activeTrustee2 = await simpleT.activeTrustee();
      expect(activeTrustee2).to.equal(ethers.constants.AddressZero);
    });

    it("removeActiveTrustee: Trust State Returns to Active", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee1 = wallets["SuccessorTrustee1"];
      const succesorTrustee2 = wallets["SuccessorTrustee2"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee1.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      const grantorExpiration = await simpleT.getExpirationTime();
      await time.increaseTo(grantorExpiration);

      await simpleT
        .connect(succesorTrustee1)
        .initiateTrustExecution(signedMessage);

      const state1 = await simpleT.returnTrustState();
      expect(state1).to.equal("Executing");

      const trusteeExpiration = await simpleT.getActiveTrusteeExpirationTime();
      await time.increaseTo(trusteeExpiration);

      await simpleT.connect(succesorTrustee2).removeActiveTrustee();

      const state2 = await simpleT.returnTrustState();
      expect(state2).to.equal("Active");
    });
  });
});
