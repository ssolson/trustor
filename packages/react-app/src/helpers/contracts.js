import deployedContracts from "../contracts/hardhat_contracts.json";
const { ethers } = require("ethers");

const isQueryable = fn => (fn.stateMutability === "view" || fn.stateMutability === "pure") && fn.inputs.length === 0;

/**
 * Creates the contract configuration
 * NOTE: Need to expand inputs for chain, and name/ greater generalization
 * @param {String} trust_address Address of trust configuration is needed for
 * @return {Object} contractConfig The conract configuration
 */
export function createContractConfig(trust_address) {
  deployedContracts[31337]["localhost"]["contracts"]["SimpleT"]["address"] = trust_address;

  const contractConfig = {
    deployedContracts: deployedContracts,
  };

  return contractConfig;
}

export function createContractObj(name, loadContracts, customContract) {
  let contract;
  if (!customContract) {
    contract = loadContracts ? loadContracts[name] : "";
  } else {
    contract = customContract;
  }
  return contract;
}

// Reads a contract and return values for all functions
export function readContract(contract, userSigner) {
  // Get the contract functions
  const displayedContractFunctions = contract
    ? Object.values(contract.interface.functions).filter(
        // fn => fn.type === "function" && !(props.show && props.show.indexOf(fn.name) < 0),
        fn => fn.type === "function",
      )
    : [];

  // Iterate over readable functions, and return value
  const contractDisplay = displayedContractFunctions.map(async contractFuncInfo => {
    const contractFunc =
      contractFuncInfo.stateMutability === "view" || contractFuncInfo.stateMutability === "pure"
        ? contract[contractFuncInfo.name]
        : contract.connect(userSigner)[contractFuncInfo.name];

    if (typeof contractFunc === "function") {
      let funcResponseStr = null;
      if (isQueryable(contractFuncInfo)) {
        try {
          const funcResponse = await contractFunc();

          funcResponseStr = JSON.stringify(funcResponse);

          if (funcResponse && funcResponse.toNumber) {
            try {
              funcResponseStr = funcResponse.toNumber();
            } catch (e) {
              funcResponseStr = "Ξ" + ethers.utils.formatUnits(funcResponse, "ether");
            }
          }
        } catch (e) {
          console.log(e);
        }
        return {
          [contractFuncInfo.name]: {
            contractFunction: contractFunc,
            functionInfo: contractFuncInfo,
            value: funcResponseStr,
          },
        };
      }
    }
    return null;
  });

  return contractDisplay;
}
