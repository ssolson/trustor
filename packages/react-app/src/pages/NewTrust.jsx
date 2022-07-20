import { Button } from "antd";
import NewTrust from '../contracts/SimpleT.json';

export default function NewTrustPage() {
  return (
  <div>
    <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />  
    
    <Button
      type={"primary"}
      onClick={
        async (trustContracts) => {
          console.log("You clicked the button!")
          
          const Trust = new ethers.ContractFactory(
            NewTrust.abi,
            NewTrust.bytecode,
            userSigner
          );

          console.log("New TRUST: ", Trust);

          const Grantor = "0x69dA48Df7177bc57639F1015E3B9a00f96f7c1d1";
          const Trustee = "0x1Bd59929EAb8F689B3c384420f4C50A343110E40";
          const Beneficiary = ["0x1Bd59929EAb8F689B3c384420f4C50A343110E40", 
                              "0x79864b719729599a4695f62ad22AD488AB290e58"];
          const Percentages = [75,25];
          let argz = [Grantor, Trustee, Beneficiary, Percentages]
          const newTrustContract = await Trust.deploy(...argz);
          await newTrustContract.deployed();

          console.log("Trust Address: ", newTrustContract.address);
                                    
          const allTrustContracts = trustContracts;

          console.log("All Trust Contracts: ", trustContracts);

          // addContract("NewContract1",  newTrustContract.address);
          

          // setTrustContracts(allTrustContracts.push(newTrustContract.address));
          // console.log("All Trust Address: ", trustContracts);

        }
      }
    >  
        Click it
    </Button>
    New Trust Page 
  </div>
  )
}


// export default NewTrustPage;