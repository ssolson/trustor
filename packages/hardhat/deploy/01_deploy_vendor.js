// deploy/01_deploy_simpleT.js
const fs = require("fs");
const { ethers } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  console.log("\t", " 🧑‍🏫 Deployer Address: ", deployer);

  // Input arguments 
  const Name = "Trust Steve Living Trust";
  
  const Initial_Trustee = "0x1Bd59929EAb8F689B3c384420f4C50A343110E40";
  const CheckInPeriod = 2
  
  const Grantors = [
    "0x69dA48Df7177bc57639F1015E3B9a00f96f7c1d1",
    "0x8423494561f327a10AC0E5A897dCf057CAF9a8d1"
  ];
  
  const SuccessorTrustees = [
    "0x1Bd59929EAb8F689B3c384420f4C50A343110E40",
    "0x79864b719729599a4695f62ad22AD488AB290e58",
  ];
  const SuccessorTrusteePositions = [0,1]
  const SuccessorTrusteePeriod = 2
  
  const Beneficiary = [
    "0x1Bd59929EAb8F689B3c384420f4C50A343110E40",
    "0x79864b719729599a4695f62ad22AD488AB290e58",
  ];
  const Percentages = [75, 25];


  // Combine inputs to pass to constructor
  let argz = [
    Name, 
    Initial_Trustee, 
    CheckInPeriod,
    Grantors, 
    SuccessorTrustees, 
    SuccessorTrusteePositions, 
    SuccessorTrusteePeriod, 
    Beneficiary, 
    Percentages
  ];

  const deploySimpleT = await deploy("SimpleT", {
    from: deployer,
    args: argz,
    log: true,
  });

  // Get the Trust contract
  // const vendor = await ethers.getContract("SimpleT", deployer);
  // console.log("SimpleT: ", vendor.address);

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

// Copy bytecode to frontend
const filePath = "./artifacts/contracts/SimpleT.sol/SimpleT.json";
const filePathCopy = "../react-app/src/contracts/bytecode.json";

fs.copyFile(filePath, filePathCopy, (err) => {
  if (err) throw err;

  console.log("File Copy Successfully.");
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports.tags = ["SimpleT"];
