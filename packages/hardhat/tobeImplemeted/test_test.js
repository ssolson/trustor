const { use, expect } = require("chai");
const { ethers } = require("hardhat");

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ROLE = ethers.utils.id("ROLE");
const OTHER_ROLE = ethers.utils.id("OTHER_ROLE");

describe("🚩 🏵 Access Control 🤖", async function () {
  async function deployFixture() {
    const [admin] = await ethers.getSigners();

    const LoadedStaticRouter = await ethers.getContractFactory("Router");
    const router = await LoadedStaticRouter.connect(admin).deploy();
    await router.deployed();

    const routerAddress = router.address;

    const AccessControl = await ethers.getContractFactory(
      "Roles"
      // "InitializableAccessControl"
    );
    const accessControl = await AccessControl.attach(routerAddress);
    await accessControl.initializeInitializableModule();

    return { accessControl };
  }

  describe("default admin", function () {
    it("deployer has default admin role", async function () {
      const { accessControl } = await deployFixture();
      const [admin, authorized, other] = await ethers.getSigners();

      const val = await accessControl.testEnum();
      console.log(val);
    });
  });
});
