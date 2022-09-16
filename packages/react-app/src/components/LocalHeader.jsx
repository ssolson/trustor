import { Layout, Button } from "antd";
import React, { useState } from "react";
import { Account } from "../components";
import { Transactor } from "../helpers";
const { Header } = Layout;
const { ethers } = require("ethers");

export default function LocalHeader(props) {
  const faucetTx = Transactor(props.localProvider, props.gasPrice);

  let faucetHint = "";

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    props.localProvider &&
    props.localProvider._network &&
    props.localProvider._network.chainId === 31337 &&
    props.yourLocalBalance &&
    ethers.utils.formatEther(props.yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: props.address,
              value: ethers.utils.parseEther("1"),
            });
            setFaucetClicked(true);
          }}
        >
          💰 Grab funds from the faucet ⛽️
        </Button>
      </div>
    );
  }
  return (
    <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
      <div style={{ position: "fixed", zIndex: 2, textAlign: "right", right: 0, top: 0, padding: 10 }}>
        <Account
          address={props.address}
          localProvider={props.localProvider}
          userSigner={props.userSigner}
          mainnetProvider={props.mainnetProvider}
          price={props.price}
          web3Modal={props.web3Modal}
          loadWeb3Modal={props.loadWeb3Modal}
          logoutOfWeb3Modal={props.logoutOfWeb3Modal}
          blockExplorer={props.blockExplorer}
        />
        {faucetHint}
      </div>
    </Header>
  );
}
