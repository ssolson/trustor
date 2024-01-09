const { use, expect } = require("chai");
const { ethers } = require("hardhat");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ROLE = ethers.utils.id("ROLE");
const OTHER_ROLE = ethers.utils.id("OTHER_ROLE");

const ROLE2 = ethers.utils.id("GRANTOR_ROLE");
const OTHER_ROLE2 = ethers.utils.id("INITIAL_TRUSTEE_ROLE");

describe("🚩 🏵 Access Control 🤖", async function () {
  async function deployFixture() {
    const [
      admin,
      Grantor2,
      SuccessorTrustee1,
      SuccessorTrustee2,
      Beneficiary1,
      Beneficiary2,
    ] = await ethers.getSigners();

    const LoadedStaticRouter = await ethers.getContractFactory("Router");
    const router = await LoadedStaticRouter.connect(admin).deploy();
    await router.deployed();

    const routerAddress = router.address;

    const Name = "Trust Steve Living Trust";
    const InitialTrusteeAddress = admin.address;
    const CheckInPeriod = 2;
    const Grantors = [admin.address, Grantor2.address];
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

    const Initialize = await ethers.getContractFactory("Initialize");
    const initialize = await Initialize.attach(routerAddress);
    await initialize.initializeInitializableModule(...argz);

    // await accessControl.initializeInitializableModule();

    return { routerAddress };
  }

  describe("default admin", function () {
    it("deployer has default admin role", async function () {
      const { routerAddress } = await loadFixture(deployFixture);

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      const [admin, authorized, other] = await ethers.getSigners();
      expect(
        await accessControl.hasRole(DEFAULT_ADMIN_ROLE, admin.address)
      ).to.equal(true);

      expect(
        await accessControl.hasRole(DEFAULT_ADMIN_ROLE, other.address)
      ).to.equal(false);
    });

    it("other roles's admin is the default admin role", async function () {
      const { routerAddress } = await loadFixture(deployFixture);

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      expect(await accessControl.getRoleAdmin(ROLE)).to.equal(
        DEFAULT_ADMIN_ROLE
      );
    });

    it("default admin role's admin is itself", async function () {
      const { routerAddress } = await loadFixture(deployFixture);

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      expect(await accessControl.getRoleAdmin(DEFAULT_ADMIN_ROLE)).to.equal(
        DEFAULT_ADMIN_ROLE
      );
    });
  });

  describe("granting", function () {
    it("non-admin cannot grant role to other accounts", async function () {
      const { routerAddress } = await loadFixture(deployFixture);

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      const [admin, authorized, other] = await ethers.getSigners();

      const ad = await accessControl.getRoleAdmin(DEFAULT_ADMIN_ROLE);
      await accessControl.connect(admin).grantRole(ROLE, authorized.address);

      await expect(
        accessControl.connect(other).grantRole(ROLE, authorized.address)
      ).to.be.revertedWith(
        `AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
      );
    });

    it("accounts can be granted a role multiple times", async function () {
      const { routerAddress } = await loadFixture(deployFixture);

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      const [admin, authorized, other] = await ethers.getSigners();

      await accessControl.connect(admin).grantRole(ROLE, authorized.address);
      const receipt = await accessControl
        .connect(admin)
        .grantRole(ROLE, authorized.address);
      await expect(receipt).to.not.emit(accessControl, "RoleGranted");
    });
  });

  describe("revoking", function () {
    it("roles that are not had can be revoked", async function () {
      const { routerAddress } = await loadFixture(deployFixture);
      const [admin, authorized, other] = await ethers.getSigners();

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      expect(await accessControl.hasRole(ROLE, authorized.address)).to.equal(
        false
      );

      const receipt = await accessControl
        .connect(admin)
        .revokeRole(ROLE, authorized.address);
      await expect(receipt).to.not.emit(accessControl, "RoleRevoked");
    });

    context("with granted role", function () {
      it("admin can revoke role", async function () {
        const { routerAddress } = await loadFixture(deployFixture);
        const [admin, authorized, other] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.attach(routerAddress);

        await accessControl.connect(admin).grantRole(ROLE, authorized.address);

        await expect(
          await accessControl
            .connect(admin)
            .revokeRole(ROLE, authorized.address)
        )
          .to.emit(accessControl, "RoleRevoked")
          .withArgs(ROLE, authorized.address, admin.address);

        await expect(
          await accessControl.hasRole(ROLE, authorized.address)
        ).to.equal(false);
      });

      it("non-admin cannot revoke role", async function () {
        const { routerAddress } = await loadFixture(deployFixture);
        const [admin, authorized, other] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.attach(routerAddress);

        await accessControl.connect(admin).grantRole(ROLE, authorized.address);

        await expect(
          accessControl.connect(other).revokeRole(ROLE, authorized.address)
        ).to.be.revertedWith(
          `AccessControl: account ${other.address.toLowerCase()} is missing role ${DEFAULT_ADMIN_ROLE}`
        );
      });

      it("a role can be revoked multiple times", async function () {
        const { routerAddress } = await loadFixture(deployFixture);
        const [admin, authorized, other] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.attach(routerAddress);

        await accessControl.connect(admin).grantRole(ROLE, authorized.address);

        await accessControl.connect(admin).revokeRole(ROLE, authorized.address);

        const receipt = await accessControl
          .connect(admin)
          .revokeRole(ROLE, authorized.address);
        await expect(receipt).to.not.emit(accessControl, "RoleRevoked");
      });
    });
  });

  describe("renouncing", function () {
    it("roles that are not had can be renounced", async function () {
      const { routerAddress } = await loadFixture(deployFixture);
      const [admin, authorized, other] = await ethers.getSigners();

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      const receipt = await accessControl
        .connect(authorized)
        .renounceRole(ROLE, authorized.address);
      expect(receipt).to.not.emit(accessControl, "RoleRevoked");
    });

    context("with granted role", function () {
      // beforeEach(async function () {
      //   await this.accessControl.grantRole(ROLE, authorized, { from: admin });
      // });

      it("bearer can renounce role", async function () {
        const { routerAddress } = await loadFixture(deployFixture);
        const [admin, authorized, other] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.attach(routerAddress);

        await accessControl.connect(admin).grantRole(ROLE, authorized.address);

        const receipt = await accessControl
          .connect(authorized)
          .renounceRole(ROLE, authorized.address);

        expect(receipt)
          .to.emit(accessControl, "RoleRevoked")
          .withArgs(authorized.address, ROLE, authorized.address);

        await expect(
          await accessControl.hasRole(ROLE, authorized.address)
        ).to.equal(false);
      });

      it("only the sender can renounce their roles", async function () {
        const { routerAddress } = await loadFixture(deployFixture);
        const [admin, authorized, other] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.attach(routerAddress);

        await accessControl.connect(admin).grantRole(ROLE, authorized.address);

        await expect(
          accessControl.connect(admin).renounceRole(ROLE, authorized.address)
        ).to.be.revertedWith(`AccessControl: can only renounce roles for self`);
      });

      it("a role can be renounced multiple times", async function () {
        const { routerAddress } = await loadFixture(deployFixture);
        const [admin, authorized, other] = await ethers.getSigners();

        const AccessControl = await ethers.getContractFactory("AccessControl");
        const accessControl = await AccessControl.attach(routerAddress);

        await accessControl.connect(admin).grantRole(ROLE, authorized.address);

        await accessControl
          .connect(authorized)
          .renounceRole(ROLE, authorized.address);

        const receipt = await accessControl
          .connect(authorized)
          .renounceRole(ROLE, authorized.address);
        expect(receipt).to.not.emit(accessControl, "RoleRevoked");
      });
    });
  });

  describe("setting role admin", function () {
    it("a role's admin role can be changed", async function () {
      const { routerAddress } = await loadFixture(deployFixture);
      const [admin, authorized, other, otherAdmin] = await ethers.getSigners();

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      await accessControl
        .connect(admin)
        .grantRole(OTHER_ROLE2, otherAdmin.address);

      expect(await accessControl.getRoleAdmin(ROLE2)).to.equal(OTHER_ROLE2);
    });

    it("the new admin can grant roles", async function () {
      const { routerAddress } = await loadFixture(deployFixture);
      const [admin, authorized, other, otherAdmin] = await ethers.getSigners();

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      await accessControl
        .connect(admin)
        .grantRole(OTHER_ROLE2, otherAdmin.address);

      const receipt = await accessControl
        .connect(otherAdmin)
        .grantRole(ROLE2, authorized.address);

      expect(receipt)
        .to.emit("AccessControl", "RoleGranted")
        .withArgs(authorized.address, ROLE2, otherAdmin.address);
    });

    it("the new admin can revoke roles", async function () {
      const { routerAddress } = await loadFixture(deployFixture);
      const [admin, authorized, other, otherAdmin] = await ethers.getSigners();

      const AccessControl = await ethers.getContractFactory("AccessControl");
      const accessControl = await AccessControl.attach(routerAddress);

      await accessControl
        .connect(admin)
        .grantRole(OTHER_ROLE2, otherAdmin.address);

      const receipt = await accessControl
        .connect(otherAdmin)
        .revokeRole(ROLE2, authorized.address);

      expect(receipt)
        .to.emit("AccessControl", "RoleRevoked")
        .withArgs(authorized.address, ROLE2, otherAdmin.address);
    });

    // TODO: Would need to write a custom contract to test the remainder
    // it("a role's previous admins no longer grant roles", async function () {
    //   const { routerAddress } = await loadFixture(deployFixture);
    //   const [admin, authorized, other, otherAdmin] = await ethers.getSigners();

    //   const AccessControl = await ethers.getContractFactory("AccessControl");
    //   const accessControl = await AccessControl.attach(routerAddress);

    //   await accessControl
    //     .connect(admin)
    //     .grantRole(OTHER_ROLE2, otherAdmin.address);

    //   await expect(
    //     accessControl.connect(admin).grantRole(ROLE2, authorized.address)
    //   ).to.be.revertedWith(
    //     `AccessControl: account ${admin.address.toLowerCase()} is missing role ${OTHER_ROLE2}`
    //   );
    // });

    // it("a role's previous admins no longer revoke roles", async function () {
    //   await expectRevert(
    //     this.accessControl.revokeRole(ROLE, authorized, { from: admin }),
    //     `${errorPrefix}: account ${admin.toLowerCase()} is missing role ${OTHER_ROLE}`,
    //   );
    // });
  });

  // TODO: Would need to write a custom contract to test the remainder
  // describe("onlyRole modifier", function () {
  //   beforeEach(async function () {
  //     await this.accessControl.grantRole(ROLE, authorized, { from: admin });
  //   });

  //   it("do not revert if sender has role", async function () {
  //     const { routerAddress } = await loadFixture(deployFixture);
  //     const [admin, authorized, other, otherAdmin] = await ethers.getSigners();

  //     const AccessControl = await ethers.getContractFactory("AccessControl");
  //     const accessControl = await AccessControl.attach(routerAddress);

  //     await accessControl
  //       .connect(admin)
  //       .grantRole(OTHER_ROLE2, otherAdmin.address);

  //     await accessControl.methods["$_checkRole(bytes32)"](ROLE, {
  //       from: authorized,
  //     });
  //   });

  // it("revert if sender doesn't have role #1", async function () {
  //   await expectRevert(
  //     this.accessControl.methods['$_checkRole(bytes32)'](ROLE, { from: other }),
  //     `${errorPrefix}: account ${other.toLowerCase()} is missing role ${ROLE}`,
  //   );
  // });

  // it("revert if sender doesn't have role #2", async function () {
  //   await expectRevert(
  //     this.accessControl.methods['$_checkRole(bytes32)'](OTHER_ROLE, { from: authorized }),
  //     `${errorPrefix}: account ${authorized.toLowerCase()} is missing role ${OTHER_ROLE}`,
  //   );
  // });
  // });
});
