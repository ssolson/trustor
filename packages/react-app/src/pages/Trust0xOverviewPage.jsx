import { useLocation } from 'react-router-dom';
import {
  useContractLoader,
  useContractReader,
} from "eth-hooks";
import {
  GrantorTable,
  TrusteeTable,
  BeneficiaryTable,
} from "../components";
import deployedContracts from "../contracts/hardhat_contracts.json"


export default function Trust0xOverviewPage(props) {
  function getCurrentTrust() {
    const location = useLocation();
    const splitPath = (location.pathname).split('/')
    const currentTrust  = splitPath[splitPath.length-1]
    console.log('location.pathname', currentTrust)
    return currentTrust;
  }

  deployedContracts[31337]['localhost'] ['contracts']['SimpleT']['address']=getCurrentTrust()

  const contractConfig = {
    deployedContracts: deployedContracts
  };

    console.log('deployedContracts', 
    deployedContracts[31337]['localhost']['contracts']['SimpleT']['address']
    )

    // Load in your local 📝 contract and read a value from it:
    const readContracts = useContractLoader(props.localProvider, contractConfig);


  return (
    <div>  
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      <h1> {getCurrentTrust()} </h1>
      <h1> GRANTORS </h1>
        <GrantorTable readContracts={readContracts} />
      <h1> TRUSTEES </h1>
        <TrusteeTable readContracts={readContracts} />
      <h1> BENEFICIARIES </h1>
        <BeneficiaryTable readContracts={readContracts} />
    </div>
  )
}
