import { useContractLoader, useContractReader } from "eth-hooks";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Table, Tag, Button } from "antd";
import "antd/dist/antd.css";
import deployedContracts from "../contracts/hardhat_contracts.json";
import Contract from "./Contract";
import ExecuteFunction from "./ExecuteFunction";
import { createContractObj, readContract } from "../helpers/contracts";
import { updateTrustBlockchainValues } from "../helpers/database";

const { ethers } = require("ethers");

export default function SyncChainToDB(props) {
  return (
    <div>
      <h2> Sync it</h2>
      <Button
        type={"primary"}
        onClick={async () => {
          // Use helper to read contract
          let contractDisplay = readContract(props.contract, props.userSigner);

          // Await responses
          const responses = await Promise.all(contractDisplay);

          // Drop null entries from write functions which cost gas (and were not run)
          let trustValues = Object.fromEntries(Object.entries(responses).filter(([_, v]) => v != null));

          console.log("trustValues", trustValues);

          // TODO: Send current state to the database
          updateTrustBlockchainValues(trustValues);
        }}
      >
        Sync
      </Button>
    </div>
  );
}
