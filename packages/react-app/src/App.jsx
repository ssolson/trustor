import Portis from "@portis/web3";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { 
  Alert, 
  Button, 
  Card, 
  Col, 
  Divider, 
  Row,
  Input, 
  List, 
  Menu,  
  Table, 
  Tag, 
  Breadcrumb, 
  Layout,
  Form, 
  Select, 
  Space
} from "antd";
const { Header, Footer, Sider, Content } = Layout;
import "antd/dist/antd.css";
import { 
  LaptopOutlined, 
  NotificationOutlined, 
  UserOutlined,
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  MinusCircleOutlined, 
  PlusOutlined,
  PlusCircleOutlined
} from '@ant-design/icons';
import Authereum from "authereum";
import {
  useBalance,
  useContractLoader,
  useContractReader,
  useGasPrice,
  useOnBlock,
  useUserProviderAndSigner,
} from "eth-hooks";
import { useExchangeEthPrice } from "eth-hooks/dapps/dex";
import { useEventListener } from "eth-hooks/events/useEventListener";
import Fortmatic from "fortmatic";
import React, { useCallback, useEffect, useState } from "react";
import { BrowserRouter, Link, Route, Switch } from "react-router-dom";

import WalletLink from "walletlink";
import Web3Modal from "web3modal";
// import "./App.css";
import {
  Account,
  Address,
  AddressInput,
  Balance,
  Contract,
  Faucet,
  GasGauge,
  LocalHeader,
  Ramp,
  ThemeSwitch,
  GrantorTable,
  TrusteeTable,
  BeneficiaryTable,
  SideBar,
} from "./components";
import { AddGrantor, ReleaseAssets } from "./components/ContractFunctions";
import {AllTrustsPage, FavoritesPage, NewTrustPage} from "./pages";
import {MainNavigation} from "./components/layout/"
import { INFURA_ID, NETWORK, NETWORKS } from "./constants";
import { Transactor } from "./helpers";

// contracts
import externalContracts from "./contracts/external_contracts";
import deployedContracts from "./contracts/hardhat_contracts.json";

import './index.css';
import background from './logo/Trustor.jpg';
import logo from './logo/Trustor_name_white.png';

const { ethers } = require("ethers");

/// 📡 What chain are your contracts deployed to?
const targetNetwork = NETWORKS.localhost; // <------- select your target frontend network (localhost, rinkeby, xdai, mainnet)

// 😬 Sorry for all the console logging
const DEBUG = true;
const NETWORKCHECK = true;

// 🛰 providers
if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
// const mainnetProvider = getDefaultProvider("mainnet", { infura: INFURA_ID, etherscan: ETHERSCAN_KEY, quorum: 1 });
// const mainnetProvider = new InfuraProvider("mainnet",INFURA_ID);
//
// attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
// Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
const scaffoldEthProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544")
  : null;
const poktMainnetProvider = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider(
      "https://eth-mainnet.gateway.pokt.network/v1/lb/611156b4a585a20035148406",
    )
  : null;
const mainnetInfura = navigator.onLine
  ? new ethers.providers.StaticJsonRpcProvider("https://mainnet.infura.io/v3/" + INFURA_ID)
  : null;
// ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID

// 🏠 Your local provider is usually pointed at your local blockchain
const localProviderUrl = targetNetwork.rpcUrl;
// as you deploy to other networks you can set REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
if (DEBUG) console.log("🏠 Connecting to provider:", localProviderUrlFromEnv);
const localProvider = new ethers.providers.StaticJsonRpcProvider(localProviderUrlFromEnv);

// 🔭 block explorer URL
const blockExplorer = targetNetwork.blockExplorer;

// Coinbase walletLink init
const walletLink = new WalletLink({
  appName: "coinbase",
});

// WalletLink provider
const walletLinkProvider = walletLink.makeWeb3Provider(`https://mainnet.infura.io/v3/${INFURA_ID}`, 1);

// Portis ID: 6255fb2b-58c8-433b-a2c9-62098c05ddc9
/*
  Web3 modal helps us "connect" external wallets:
*/
const web3Modal = new Web3Modal({
  network: "mainnet", // Optional. If using WalletConnect on xDai, change network to "xdai" and add RPC info below for xDai chain.
  cacheProvider: true, // optional
  theme: "light", // optional. Change to "dark" for a dark theme.
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider, // required
      options: {
        bridge: "https://polygon.bridge.walletconnect.org",
        infuraId: INFURA_ID,
        rpc: {
          1: `https://mainnet.infura.io/v3/${INFURA_ID}`, // mainnet // For more WalletConnect providers: https://docs.walletconnect.org/quick-start/dapps/web3-provider#required
          42: `https://kovan.infura.io/v3/${INFURA_ID}`,
          100: "https://dai.poa.network", // xDai
        },
      },
    },
    portis: {
      display: {
        logo: "https://user-images.githubusercontent.com/9419140/128913641-d025bc0c-e059-42de-a57b-422f196867ce.png",
        name: "Portis",
        description: "Connect to Portis App",
      },
      package: Portis,
      options: {
        id: "6255fb2b-58c8-433b-a2c9-62098c05ddc9",
      },
    },
    fortmatic: {
      package: Fortmatic, // required
      options: {
        key: "pk_live_5A7C91B2FC585A17", // required
      },
    },
    "custom-walletlink": {
      display: {
        logo: "https://play-lh.googleusercontent.com/PjoJoG27miSglVBXoXrxBSLveV6e3EeBPpNY55aiUUBM9Q1RCETKCOqdOkX2ZydqVf0",
        name: "Coinbase",
        description: "Connect to Coinbase Wallet (not Coinbase App)",
      },
      package: walletLinkProvider,
      connector: async (provider, _options) => {
        await provider.enable();
        return provider;
      },
    },
    authereum: {
      package: Authereum, // required
    },
  },
});




function App(props) {
  const mainnetProvider =
    poktMainnetProvider && poktMainnetProvider._isProvider
      ? poktMainnetProvider
      : scaffoldEthProvider && scaffoldEthProvider._network
      ? scaffoldEthProvider
      : mainnetInfura;

  const [injectedProvider, setInjectedProvider] = useState();
  const [address, setAddress] = useState();

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      window.location.reload();
    }, 1);
  };

  /* 💵 This hook will get the price of ETH from 🦄 Uniswap: */
  const price = useExchangeEthPrice(targetNetwork, mainnetProvider);

  /* 🔥 This hook will get the price of Gas from ⛽️ EtherGasStation */
  const gasPrice = useGasPrice(targetNetwork, "fast");
  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProviderAndSigner = useUserProviderAndSigner(injectedProvider, localProvider);
  const userSigner = userProviderAndSigner.signer;

  useEffect(() => {
    async function getAddress() {
      if (userSigner) {
        const newAddress = await userSigner.getAddress();
        setAddress(newAddress);
      }
    }
    getAddress();
  }, [userSigner]);

  // You can warn the user if you would like them to be on a specific network
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId =
    userSigner && userSigner.provider && userSigner.provider._network && userSigner.provider._network.chainId;

  // For more hooks, check out 🔗eth-hooks at: https://www.npmjs.com/package/eth-hooks

  // The transactor wraps transactions and provides notificiations
  const tx = Transactor(userSigner, gasPrice);

  // Faucet Tx can be used to send funds from the faucet
  const faucetTx = Transactor(localProvider, gasPrice);

  // 🏗 scaffold-eth is full of handy hooks like this one to get your balance:
  const yourLocalBalance = useBalance(localProvider, address);

  const contractConfig = { deployedContracts: deployedContracts || {}, externalContracts: externalContracts || {} };

  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(localProvider, contractConfig);

  // If you want to make 🔐 write transactions to your contracts, use the userSigner:
  const writeContracts = useContractLoader(userSigner, contractConfig, localChainId);

  // EXTERNAL CONTRACT EXAMPLE:
  // If you want to bring in the mainnet DAI contract it would look like:
  const mainnetContracts = useContractLoader(mainnetProvider, contractConfig);

  // If you want to call a function on a new block
  useOnBlock(mainnetProvider, () => {
    console.log(`⛓ A new mainnet block is here: ${mainnetProvider._lastBlockNumber}`);
  });

  const trustAddress = readContracts && readContracts.SimpleT && readContracts.SimpleT.address;

  const trustETHBalance = useBalance(localProvider, trustAddress);
  if (DEBUG) console.log("💵 trustETHBalance", trustETHBalance ? ethers.utils.formatEther(trustETHBalance) : "...");

  const trustTokenApproval = useContractReader(readContracts, "SimpleT", "isApprovedForAll", [
    address, trustAddress
  ]);
  console.log("🤏 trustTokenApproval",trustTokenApproval)

  const tokensPerGrantor = useContractReader(readContracts, "SimpleT", "tokensPerGrantor");
  console.log("🏦 tokensPerEth:", tokensPerGrantor ? ethers.utils.formatEther(tokensPerGrantor) : "...");


  



  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (
      DEBUG &&
      mainnetProvider &&
      address &&
      selectedChainId &&
      yourLocalBalance &&
      readContracts &&
      writeContracts &&
      mainnetContracts
    ) {
      console.log("_____________________________________ 🏗 Trustor Digital _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("🏠 localChainId", localChainId);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
      console.log("📝 readContracts", readContracts);
      console.log("🔐 writeContracts", writeContracts);
      console.log("SIMPLET: ", readContracts.SimpleT);
    }
  }, [
    mainnetProvider,
    address,
    selectedChainId,
    yourLocalBalance,
    readContracts,
    writeContracts,
    mainnetContracts,
  ]);

  let networkDisplay = "";
  if (NETWORKCHECK && localChainId && selectedChainId && localChainId !== selectedChainId) {
    const networkSelected = NETWORK(selectedChainId);
    const networkLocal = NETWORK(localChainId);
    if (selectedChainId === 1337 && localChainId === 31337) {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network ID"
            description={
              <div>
                You have <b>chain id 1337</b> for localhost and you need to change it to <b>31337</b> to work with
                HardHat.
                <div>(MetaMask -&gt; Settings -&gt; Networks -&gt; Chain ID -&gt; 31337)</div>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    } else {
      networkDisplay = (
        <div style={{ zIndex: 2, position: "absolute", right: 0, top: 60, padding: 16 }}>
          <Alert
            message="⚠️ Wrong Network"
            description={
              <div>
                You have <b>{networkSelected && networkSelected.name}</b> selected and you need to be on{" "}
                <Button
                  onClick={async () => {
                    const ethereum = window.ethereum;
                    const data = [
                      {
                        chainId: "0x" + targetNetwork.chainId.toString(16),
                        chainName: targetNetwork.name,
                        nativeCurrency: targetNetwork.nativeCurrency,
                        rpcUrls: [targetNetwork.rpcUrl],
                        blockExplorerUrls: [targetNetwork.blockExplorer],
                      },
                    ];
                    console.log("data", data);

                    let switchTx;
                    // https://docs.metamask.io/guide/rpc-api.html#other-rpc-methods
                    try {
                      switchTx = await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: data[0].chainId }],
                      });
                    } catch (switchError) {
                      // not checking specific error code, because maybe we're not using MetaMask
                      try {
                        switchTx = await ethereum.request({
                          method: "wallet_addEthereumChain",
                          params: data,
                        });
                      } catch (addError) {
                        // handle "add" error
                      }
                    }

                    if (switchTx) {
                      console.log(switchTx);
                    }
                  }}
                >
                  <b>{networkLocal && networkLocal.name}</b>
                </Button>
              </div>
            }
            type="error"
            closable={false}
          />
        </div>
      );
    }
  } else {
    networkDisplay = (
      <div style={{ zIndex: -1, position: "absolute", right: 154, top: 28, padding: 16, color: targetNetwork.color }}>
        {targetNetwork.name}
      </div>
    );
  }

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new ethers.providers.Web3Provider(provider));

    provider.on("chainChanged", chainId => {
      console.log(`chain changed to ${chainId}! updating providers`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    provider.on("accountsChanged", () => {
      console.log(`account changed!`);
      setInjectedProvider(new ethers.providers.Web3Provider(provider));
    });

    // Subscribe to session disconnection
    provider.on("disconnect", (code, reason) => {
      console.log(code, reason);
      logoutOfWeb3Modal();
    });
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  const [route, setRoute] = useState();
  useEffect(() => {
    setRoute(window.location.pathname);
  }, [setRoute]);

  let faucetHint = "";
  const faucetAvailable = localProvider && localProvider.connection && targetNetwork.name.indexOf("local") !== -1;

  const [faucetClicked, setFaucetClicked] = useState(false);
  if (
    !faucetClicked &&
    localProvider &&
    localProvider._network &&
    localProvider._network.chainId === 31337 &&
    yourLocalBalance &&
    ethers.utils.formatEther(yourLocalBalance) <= 0
  ) {
    faucetHint = (
      <div style={{ padding: 16 }}>
        <Button
          type="primary"
          onClick={() => {
            faucetTx({
              to: address,
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


  const [tokenSendToAddress, setTokenSendToAddress] = useState();
  const [tokenSendAmount, setTokenSendAmount] = useState();

  const [collapsed, setCollapsed] = useState(false);
  const [newGrantorAddr, setNewGrantorAddr] = useState();
  const [newAddress, setNewAddress] = useState();
  const [newTrusteeAddr, setNewTrusteeAddr] = useState();
  const [releaseAssets, setReleaseAssets] = useState();
  





  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form:', values);
  };




  return (
    <div className="App">
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh', }}>
          <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
            <img src={logo} className="logo" />
            <SideBar />
          </Sider>
          <Layout className="site-layout">
            <LocalHeader />
            <Content style={{padding: '0 50px',}}>
              <div className="site-layout-content">
                <Switch>
                  <Route path="/" exact>
                    <img src={background} style={{ padding: 25, marginTop: 50,  height: 600,}} />
                  </Route>
                  <Route exact path="/Overview">
                  <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                  <h1> GRANTORS </h1>
                    <GrantorTable readContracts={readContracts} />
                  <h1> TRUSTEES </h1>
                    <TrusteeTable readContracts={readContracts} />
                  <h1> BENEFICIARIES </h1>
                    <BeneficiaryTable readContracts={readContracts} />
                  </Route>
                  <Route exact path="/grantor/overview"> 
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <h1> GRANTORS </h1>
                      <GrantorTable readContracts={readContracts} />
                  </Route>
                  <Route exact path="/grantor/admin">
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <GrantorTable readContracts={readContracts} />
                    <Divider orientation="left">Modify Grantor Actions</Divider>
                    <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}>
                      <Card title="Add Grantor" >                
                        <div className="site-input-group-wrapper">
                          <Input.Group compact>
                            <Input
                              style={{width: "calc(100% - 80px)" }}
                              onChange={e => {setNewGrantorAddr(e.target.value)}}
                              placeholder="Grantor address"
                            />
                            <Button
                              type={"primary"}
                              onClick={async () => {tx(writeContracts.SimpleT.addGrantor(newGrantorAddr), )}}  
                            >
                              Add
                            </Button>
                          </Input.Group>
                        </div>
                      </Card>
                    </div>
                    <Divider orientation="left">Modify Trustee Actions</Divider>
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <TrusteeTable readContracts={readContracts} />
                    <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}>
                    
                      <Card title="Add Trustee" >                
                        <div className="site-input-group-wrapper">
                          <Input.Group compact>
                            <Input
                              style={{
                                width: "calc(100% - 80px)"
                              }}
                              onChange={e => {
                                setNewAddress(e.target.value);
                              }}
                              placeholder="Grantor address"
                            />
                            <Button
                              type={"primary"}
                              onClick={async () => {tx(writeContracts.SimpleT.addTrustee(newAddress), )}}  
                            >
                              Add
                            </Button>
                          </Input.Group>
                        </div>
                      </Card>
                    </div>
                    
                    <Divider orientation="left">Modify Beneficiary Actions</Divider>
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <BeneficiaryTable readContracts={readContracts} />
                    <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}>
                      <Form form={form} 
                        name="dynamic_form_nest_item" 
                        onFinish={onFinish} 
                        autoComplete="off" 
                        >
                        <Form.List name="newBeneficiaries">
                          {(fields, { add, remove }) => (
                            <>
                              {fields.map((field) => (
                                <Space  key={field.key} align="baseline">
                                {/* <div key={field.key}> */}
                                  
                                  <Form.Item
                                    // {...field}
                                    label="Beneficiary"
                                    name={[field.name, 'address']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Missing Beneficiary address',
                                      },
                                    ]}
                                    >
                                    <Input />
                                  </Form.Item>
                                  <Form.Item
                                    // {...field}
                                    label="Shares"
                                    name={[field.name, 'shares']}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Missing Shares',
                                      },
                                    ]}
                                    >
                                    <Input />
                                  </Form.Item>

                                  <MinusCircleOutlined onClick={() => remove(field.name)} />
                                
                                {/* </div> */}
                                </Space >
                              ))}

                              <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                                  Add Beneficiary
                                </Button>
                              </Form.Item>
                            </>
                          )}
                        </Form.List>
                        <Form.Item>
                          <Button 
                            type="primary" 
                            htmlType="submit"
                            onClick={async () => {
                              let vals = form.getFieldValue('newBeneficiaries');
                              let  addresses = vals.map(element => element.address)
                              let shares = vals.map(element => element.shares)
                              
                              
                              // console.log('newBeneficiaries', vals);
                              console.log('addresses', addresses);
                              console.log('shares', shares);
                              const result = tx(writeContracts.SimpleT.setBeneficiaries(addresses, shares), )
                              console.log('result', result);

                            }}
                            >
                            Submit
                          </Button>
                        </Form.Item>
                      </Form>
                    </div>

                  </Route>

                  <Route exact path="/grantor/approve"> 
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <h1> GRANTORS </h1>
                      <GrantorTable readContracts={readContracts} />


                      <Card title="Release Right, Title, and Interest" extra={<a href="#">code</a>}>                
                        <div className="site-input-group-wrapper">
                          <Button
                            type={"primary"}
                            onClick={async () => {
                              const result = tx(writeContracts.SimpleT.assignAssetsToTrust(), )}
                            } 
                            // disabled={!tokenSellAmount.valid} IsGrantor && Active=False
                            >
                            Assign Assets To Trust
                          </Button>  
                        </div>
                      </Card>
                  </Route>

                  <Route exact path="/trustee/overview">
                  <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                  <h1> Trustees </h1>
                    <TrusteeTable readContracts={readContracts} />
                  </Route>

                  
                  <Route exact path="/trustee/administer">
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <Card title="Release Assets to Beneficiaries" extra={<a href="#">code</a>}>                
                        <div className="site-input-group-wrapper">
                          <Button
                            type={"primary"}
                            onClick={
                              async (tx, writeContracts) => {
                              ReleaseAssets(tx, writeContracts) }
                            } 
                            // disabled={!tokenSellAmount.valid} IsGrantor && Active=False
                            >
                            Release
                          </Button>  
                        </div>
                      </Card>
                    
                  </Route>





                  <Route exact path="/simple-trust">
                    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
                    <GrantorTable readContracts={readContracts} />
                    <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}>
                      <Card title="Add Grantor" >                
                        <div className="site-input-group-wrapper">
                          <Input.Group compact>
                            <Input
                              style={{
                                width: "calc(100% - 80px)"
                              }}
                              onChange={e => {
                                setNewGrantorAddr(e.target.value);
                              }}
                              placeholder="Grantor address"
                            />
                            <Button
                              type={"primary"}        
                              // onClick={
                              //   (tx, writeContracts, newGrantorAddr) => {
                              //     AddGrantor(tx, writeContracts, newGrantorAddr) }
                              //   } 
                              onClick={async () => {
                                const result = tx(writeContracts.SimpleT.addGrantor(newGrantorAddr), update => {
                                  console.log("📡 Transaction Update:", update);
                                  if (update && (update.status === "confirmed" || update.status === 1)) {
                                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                                    console.log(
                                      " ⛽️ " +
                                        update.gasUsed +
                                        "/" +
                                        (update.gasLimit || update.gas) +
                                        " @ " +
                                        parseFloat(update.gasPrice) / 1000000000 +
                                        " gwei",
                                    );
                                  }
                                });
                                console.log("awaiting metamask/web3 confirm result...", result);
                                console.log(await result);;
                              }
                            }                 
                              >
                              Add
                            </Button>
                          </Input.Group>
                        </div>
                        <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }} />
                        <Button
                          type={"primary"}
                          onClick={async () => {
                            const result = tx(writeContracts.SimpleT.assignAssetsToTrust(), update => {
                              console.log("📡 Transaction Update:", update);
                              if (update && (update.status === "confirmed" || update.status === 1)) {
                                console.log(" 🍾 Transaction " + update.hash + " finished!");
                                console.log(
                                  " ⛽️ " +
                                    update.gasUsed +
                                    "/" +
                                    (update.gasLimit || update.gas) +
                                    " @ " +
                                    parseFloat(update.gasPrice) / 1000000000 +
                                    " gwei",
                                );
                              }
                            });
                            console.log("awaiting metamask/web3 confirm result...", result);
                            console.log(await result);
                          }} 
                          // disabled={!tokenSellAmount.valid} IsGrantor && Active=False
                          >
                          Assign Assets To Trust
                        </Button>  
                      </Card>
                    </div>
                  </Route>
                  
                  <Route path="/contracts">
                    <Contract
                      name="SimpleT"
                      signer={userSigner}
                      provider={localProvider}
                      address={address}
                      blockExplorer={blockExplorer}
                      contractConfig={contractConfig}
                    />
                    <div style={{ position: "fixed", textAlign: "left", left: 0, bottom: 20, padding: 10 }}>
                      <Row align="middle" gutter={[3, 3]}>
                        <Col span={12}>
                          <Ramp price={price} address={address} networks={NETWORKS} />
                        </Col>

                        <Col span={12} style={{ textAlign: "center", opacity: 0.8 }}>
                          <GasGauge gasPrice={gasPrice} />
                        </Col>
                      </Row>

                      <Row align="middle" gutter={[4, 4]}>
                        <Col span={24}>
                          {
                            faucetAvailable ? (
                              <Faucet localProvider={localProvider} price={price} ensProvider={mainnetProvider} />
                            ) : (
                              ""
                            )
                          }
                        </Col>
                      </Row>
                    </div>
                  </Route>
                </Switch>
              </div>
            </Content>
            <Footer style={{textAlign: 'center',}}>
              Trustor Digital ©2022
            </Footer>
            <div style={{ position: "fixed", zIndex: 2, textAlign: "right", right: 0, top: 0, padding: 10 }}>
                <Account
                  address={address}
                  localProvider={localProvider}
                  userSigner={userSigner}
                  mainnetProvider={mainnetProvider}
                  price={price}
                  web3Modal={web3Modal}
                  loadWeb3Modal={loadWeb3Modal}
                  logoutOfWeb3Modal={logoutOfWeb3Modal}
                  blockExplorer={blockExplorer}
                />
                {faucetHint}
              </div>
          </Layout>
        </Layout>
      </BrowserRouter>
    


      {/* {networkDisplay} */}

    </div>
  );
}

export default App;
