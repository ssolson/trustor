// deploy/01_deploy_simpleT.js

const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  console.log('\t'," 🧑‍🏫 Deployer Address: ", deployer)

 

  
  // Deploy USDC Token
   const deployUSDC = await deploy("USDC", {
    from: deployer,
    args: [],
    log: true,
  });
  // Get the USDC contract
  const usdc = await ethers.getContract("USDC", deployer);
  console.log("USDC: ", usdc.address);


  // Input arguments
   const Grantor = "0x79864b719729599a4695f62ad22AD488AB290e58";
   const Trustee = "0x79864b719729599a4695f62ad22AD488AB290e58";
   const Beneficiary = ["0xc6bEcBBB10327e57c0083A3127e5F54aB3D2Af23", 
                        "0x619cCf252351dAAb7cc9E239538c26e942E9430f"];
   const Percentages = [75,25];

  // Combine inputs to pass to constructor
  let argz = [Grantor, Trustee, Beneficiary, Percentages]

  const deploySimpleT = await deploy("SimpleT", {
    from: deployer,
    args: argz,
    log: true,
  });
  

  // // Get the Trust contract
  const vendor = await ethers.getContract("SimpleT", deployer);
  console.log("SimpleT: ", vendor.address);
  
  // Change ownership to grantor
  // try {
  //   console.log("\n 🤹  Sending ownership to frontend address...\n")
  //   const ownershipTransaction = await vendor.transferOwnership(Grantor);
  //   console.log("\n    ✅ confirming...\n");
  //   const ownershipResult = await ownershipTransaction.wait();
  //   // Sleep verification only on new contract deployment
  //   await sleep(3000); // wait seconds for deployment to propagate
  // } catch (e) {
  //   console.log(" ⚠️ Ownership already transfered.");
  // }

  // // Verify the contract with Etherscan for public chains
  // if (chainId !== "31337") {
  //   try {
  //     console.log(" 🎫 Verifing Contract on Etherscan... ");
  //     await run("verify:verify", {
  //       address: vendor.address,
  //       contract: "contracts/SimpleT.sol:SimpleT",
  //       constructorArguments: argz,
  //     });
  //   } catch (e) {
  //     console.log(" ⚠️ Failed to verify contract on Etherscan ");
  //   }
  // }
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports.tags = ["SimpleT"];
