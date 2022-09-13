import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import {
  useContractLoader,
  useContractReader,
} from "eth-hooks";
import {
  GrantorTable,
  TrusteeTable,
  BeneficiaryTable,
  SyncChainToDB,
  Contract,
  PDFFile
} from "../components";
import deployedContracts from "../contracts/hardhat_contracts.json"
import { Button } from "antd";
import { 
  createContractObj, 
  readContract
} from '../helpers/contracts'
// import { PDFDownloadLink } from '@react-pdf/renderer';



export default function Trust0xOverviewPage(props) {

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }
  
  const location = useLocation();

  function getCurrentTrust() {
    const splitPath = (location.pathname).split('/')
    const currentTrust  = splitPath[splitPath.length-1]
    // console.log('location.pathname', currentTrust)
    return currentTrust;
  }

  let trust_address = getCurrentTrust()
  deployedContracts[31337]['localhost']['contracts']['SimpleT']['address']=trust_address

  const contractConfig = {
    deployedContracts: deployedContracts
  };


  // Load in your local 📝 contract and read a value from it:
  const readContracts = useContractLoader(props.localProvider, contractConfig);

  const trustAddress = readContracts && readContracts.SimpleT && readContracts.SimpleT.address;
  const allGrantors = useContractReader(readContracts, "SimpleT", "getGrantors", []);

  const contract = createContractObj(
    "SimpleT",
    props.localProvider,
    contractConfig,
    props.localChainId
  )
  console.log(contract)


  return (
    <div>  
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      <h1> {trust_address} </h1>
      <h1> GRANTORS </h1>
        {/* <GrantorTable readContracts={readContracts} /> */}
      <h1> TRUSTEES </h1>
        <TrusteeTable readContracts={readContracts} />
      <h1> BENEFICIARIES </h1>
        <BeneficiaryTable readContracts={readContracts} />
      {/* <div>
        <Button 
          type={"primary"}
          onClick={()=> {
            console.log("contractConfig",contractConfig);
            
          }}
        >
        What the config?
        </Button>
      </div> */}

      <div>        
        <SyncChainToDB 
          name="SimpleT"
          provider={props.localProvider}
          contractConfig={contractConfig}
          readContracts={readContracts}
          chainId = {props.localChainId}
          userSigner = {props.userSigner}
          contract = {contract}
        />
      </div>
      <div>        
        {/* <PDFDownloadLink document={<PDFFile />} fileName="FORM">
          {({ loading }) => 
            loading ? (
              <button>Loading Document...</button>
            ) : (
              <button> Download </button>
            )
          }
        </PDFDownloadLink> */}
        {/* <PDFFile /> */}
      </div>
    </div>
  )
}
