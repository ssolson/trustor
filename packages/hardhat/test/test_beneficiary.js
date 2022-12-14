// const deployFixture = require("./cases");

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

  describe("Adding Beneficiary", async () => {
    it("setBeneficiary: Correct Length", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);
      const N0 = await simpleT.getBeneficiariesLength();
      initialTrustee = wallets["InitialTrustee"];
      await simpleT
        .connect(initialTrustee)
        .setBeneficiaries([wallets["SuccessorTrustee1"].address], [1]);

      const N1 = await simpleT.getBeneficiariesLength();
      expect(N0.add(1)).to.equal(N1);
    });

    it("setBeneficiary: Correct Address added", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;
      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);
      const isInArray = await simpleT.findIsABeneficiary(newAddress);
      expect(isInArray).to.be.true;
    });

    it("setBeneficiary: Correct Shares added", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      const shares0 = await simpleT.beneficiaryShares(newAddress);
      expect(shares0).to.equal(0);

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      const shares1 = await simpleT.beneficiaryShares(newAddress);
      expect(shares1).to.equal(newShares);
    });

    it("setBeneficiary: Total Shares increaced", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      const shares0 = await simpleT.totalShares();

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      const shares1 = await simpleT.totalShares();
      expect(shares1).to.equal(shares0.add(newShares));
    });

    it("setBeneficiary: Update Beneficary Shares", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const address = wallets["Beneficiary1"].address;
      const newShares = 1;

      const shares0 = await simpleT.beneficiaryShares(address);
      expect(shares0).to.not.equal(0);
      expect(shares0).to.not.equal(newShares);

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([address], [newShares]);

      const shares1 = await simpleT.beneficiaryShares(address);
      expect(shares1).to.equal(newShares);
    });

    it("setBeneficiary: Total Shares on Beneficiary Update", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const address = wallets["Beneficiary1"].address;
      const newShares = 1;

      const shares0 = await simpleT.beneficiaryShares(address);
      expect(shares0).to.not.equal(0);
      expect(shares0).to.not.equal(newShares);

      const totalShares0 = await simpleT.totalShares();

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([address], [newShares]);

      const totalshares1 = await simpleT.totalShares();
      expect(totalshares1).to.equal(totalShares0.sub(shares0).add(newShares));
    });

    it("setBeneficiary: Role added", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      const hasRoleResult0 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        newAddress
      );
      expect(hasRoleResult0).to.be.false;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries([newAddress], [newShares]);

      const hasRoleResult1 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        newAddress
      );
      expect(hasRoleResult1).to.be.true;
    });

    it("setBeneficiary: BeneficiaryAdded Event Emitted ", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress = wallets["SuccessorTrustee1"].address;
      const newShares = 1;

      await expect(
        await simpleT
          .connect(wallets["InitialTrustee"])
          .setBeneficiaries([newAddress], [newShares])
      )
        .to.emit(simpleT, "BeneficiaryAdded")
        .withArgs(wallets["InitialTrustee"].address, newAddress, newShares);
    });

    it("setBeneficiary: BeneficiaryUpdated Event Emitted ", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const address = wallets["Beneficiary1"].address;
      const newShares = 1;

      await expect(
        await simpleT
          .connect(wallets["InitialTrustee"])
          .setBeneficiaries([address], [newShares])
      )
        .to.emit(simpleT, "BeneficiaryUpdated")
        .withArgs(wallets["InitialTrustee"].address, address, newShares);
    });
  });

  describe("Adding Beneficiaries", () => {
    it("setBeneficiary: Correct Length", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);
      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const newAddresses = [newAddress1, newAddress2];
      const newShares1 = 1;
      const newShares2 = 2;
      const newShares = [newShares1, newShares2];

      const N0 = await simpleT.getBeneficiariesLength();
      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries(newAddresses, newShares);
      const N1 = await simpleT.getBeneficiariesLength();
      expect(N0.add(2)).to.equal(N1);
    });

    it("setBeneficiary: Correct Addresses added", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const newAddresses = [newAddress1, newAddress2];
      const newShares1 = 1;
      const newShares2 = 2;
      const newShares = [newShares1, newShares2];

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries(newAddresses, newShares);

      const isInArrayResult1 = await simpleT.findIsABeneficiary(newAddress1);
      expect(isInArrayResult1).to.be.true;
      const isInArrayResult2 = await simpleT.findIsABeneficiary(newAddress2);
      expect(isInArrayResult2).to.be.true;
    });

    it("setBeneficiary: Role added", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const newAddress1 = wallets["SuccessorTrustee1"].address;
      const newAddress2 = wallets["SuccessorTrustee2"].address;
      const newAddresses = [newAddress1, newAddress2];
      const newShares1 = 1;
      const newShares2 = 2;
      const newShares = [newShares1, newShares2];

      const hasRoleResult01 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        newAddress1
      );
      const hasRoleResult02 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        newAddress2
      );
      expect(hasRoleResult01).to.be.false;
      expect(hasRoleResult02).to.be.false;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .setBeneficiaries(newAddresses, newShares);

      const hasRoleResult11 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        newAddress1
      );
      const hasRoleResult12 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        newAddress2
      );
      expect(hasRoleResult11).to.be.true;
      expect(hasRoleResult12).to.be.true;
    });
  });

  describe("Removing Beneficiary", () => {
    it("adminRemoveBeneficiary: Correct Length", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const N0 = await simpleT.getBeneficiariesLength();

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(wallets["Beneficiary1"].address);

      const N1 = await simpleT.getBeneficiariesLength();
      expect(N0.sub(1)).to.equal(N1);
    });

    it("adminRemoveBeneficiary: Correct Addresses removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);
      const removeAddress = wallets["Beneficiary1"].address;

      const isInArrayResult1 = await simpleT.findIsABeneficiary(removeAddress);
      expect(isInArrayResult1).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(removeAddress);

      const isInArrayResult2 = await simpleT.findIsABeneficiary(removeAddress);
      expect(isInArrayResult2).to.be.false;
    });

    it("adminRemoveBeneficiary: Role removed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);
      const removeAddress = wallets["Beneficiary1"].address;

      const hasRoleResult1 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        removeAddress
      );
      expect(hasRoleResult1).to.be.true;

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(removeAddress);

      const hasRoleResult2 = await simpleT.hasRole(
        BENEFICIARY_ROLE,
        removeAddress
      );
      expect(hasRoleResult2).to.be.false;
    });

    it("adminRemoveBeneficiary: Event Emitted", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const initialTrustee = wallets["InitialTrustee"].address;
      const removeAddress = wallets["Beneficiary1"].address;

      const shares = await simpleT.beneficiaryShares(removeAddress);

      await expect(
        simpleT
          .connect(wallets["InitialTrustee"])
          .adminRemoveBeneficiary(removeAddress)
      )
        .to.emit(simpleT, "BeneficiaryRemoved")
        .withArgs(initialTrustee, removeAddress, shares);
    });

    it("adminRemoveBeneficiary: Cannot Remove Last Beneficiary", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      await simpleT
        .connect(wallets["InitialTrustee"])
        .adminRemoveBeneficiary(wallets["Beneficiary1"].address);

      await expect(
        simpleT
          .connect(wallets["InitialTrustee"])
          .adminRemoveBeneficiary(wallets["Beneficiary2"].address)
      ).to.be.revertedWith(
        "Cannot remove last beneficiary. Please add replacement before removal."
      );
    });
  });

  describe("Open Claims", () => {
    it("openClaims: State Changed", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      const expiration = await simpleT.getExpirationTime();

      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await time.increaseTo(expiration);

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      await simpleT.connect(succesorTrustee).openClaims();

      const state2 = await simpleT.returnTrustState();

      expect(state2).to.equal("Executed");
    });
  });

  describe("Claim", () => {
    it("claim: Correct Shares Recieved", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      // Assign assets
      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      // Checkin Period Expires
      const expiration = await simpleT.getExpirationTime();
      await time.increaseTo(expiration);

      // Trustee Signs message to start trust execution
      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      // Active Trustee opens assets for claiming
      await simpleT.connect(succesorTrustee).openClaims();

      const tokenBal_Trust0 = await simpleT.balanceOf(
        simpleT.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );
      expect(tokenBal_Trust0).to.equal(ethers.utils.parseUnits("1.0"));

      // Beneficiary 1 Claims
      const Beneficiary1 = wallets["Beneficiary1"];

      const tokenBal_Beneficiary1_0 = await simpleT.balanceOf(
        Beneficiary1.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );

      expect(tokenBal_Beneficiary1_0).to.equal(0);

      const shares_Beneficiary1 = await simpleT.beneficiaryShares(
        Beneficiary1.address
      );
      const totalShares = await simpleT.totalShares();

      await simpleT.connect(Beneficiary1).claim();

      const tokenBalTrust1 = await simpleT.balanceOf(
        simpleT.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );
      const tokenBal_Beneficiary1_1 = await simpleT.balanceOf(
        Beneficiary1.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );

      expect(tokenBalTrust1).to.equal(
        tokenBal_Trust0.sub(tokenBal_Beneficiary1_1)
      );
      expect(tokenBal_Beneficiary1_1).to.equal(
        ethers.utils.parseUnits("1.0").mul(shares_Beneficiary1).div(totalShares)
      );

      // Beneficiary 2 Claims
      const Beneficiary2 = wallets["Beneficiary2"];

      const tokenBal_Beneficiary2_0 = await simpleT.balanceOf(
        Beneficiary2.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );

      expect(tokenBal_Beneficiary2_0).to.equal(0);

      const shares_Beneficiary2 = await simpleT.beneficiaryShares(
        Beneficiary2.address
      );

      await simpleT.connect(Beneficiary2).claim();

      const tokenBalTrust2 = await simpleT.balanceOf(
        simpleT.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );
      const tokenBal_Beneficiary2_1 = await simpleT.balanceOf(
        Beneficiary2.address,
        simpleT._tokenIds(wallets["Grantor2"].address)
      );

      expect(tokenBalTrust2).to.equal(0);
      expect(tokenBal_Beneficiary2_1).to.equal(
        ethers.utils.parseUnits("1.0").mul(shares_Beneficiary2).div(totalShares)
      );
    });

    it("claim: Can only claim once", async () => {
      const { wallets, simpleT } = await loadFixture(deployFixture);

      // Assign assets
      await simpleT.connect(wallets["Grantor2"]).assignAssetsToTrust();

      // Checkin Period Expires
      const expiration = await simpleT.getExpirationTime();
      await time.increaseTo(expiration);

      // Trustee Signs message to start trust execution
      const succesorTrustee = wallets["SuccessorTrustee1"];
      const isDedHash = await simpleT.DED();
      const signedMessage = succesorTrustee.signMessage(
        ethers.utils.arrayify(isDedHash)
      );

      await simpleT
        .connect(succesorTrustee)
        .initiateTrustExecution(signedMessage);

      // Active Trustee opens assets for claiming
      await simpleT.connect(succesorTrustee).openClaims();

      // Beneficiary 1 Claims
      const Beneficiary1 = wallets["Beneficiary1"];

      await simpleT.connect(Beneficiary1).claim();

      await expect(simpleT.connect(Beneficiary1).claim()).to.be.revertedWith(
        "SimpleT: Beneficary has already claimed"
      );

      // Beneficiary 2 Claims
      const Beneficiary2 = wallets["Beneficiary2"];

      await simpleT.connect(Beneficiary2).claim();

      await expect(simpleT.connect(Beneficiary2).claim()).to.be.revertedWith(
        "SimpleT: Beneficary has already claimed"
      );
    });
  });
});
