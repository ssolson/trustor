import React, { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Table, Tag, Button } from "antd";
import externalContracts from "../contracts/external_contracts";
import simpleT_ABI from "../contracts/SimpleT_ABI";
import {useContractLoader, useContractReader } from "eth-hooks";

import {
  addNewTrust,
  getUserTrusts,
  getTrustData,
  updateTrustBlockchainValues
} from '../helpers/database'
import { 
  createContractObj, 
  readContract
} from '../helpers/contracts'
 

export default function TrustList(props) {  
  // Get and set the user Trust Addresses  
  const [userData, setUserData] = useState();
  const [records, setRecords] = useState();

  useEffect(async () => {
    const user_data_promise = getUserTrusts(props.address)
    const user_data = await user_data_promise;
    setUserData(user_data)
  }, [props.address])

  // Create object to house all of the contracts
  let trust_contracts = {
    "31337": {
      "localhost":{
        "name": "localhost",
        "chainId": "31337",
        "contracts":{}
      }
    },
  };
  
  // Add address and abi for each contract to object
  if (userData) {
    Object.keys(userData).forEach((trust_address, index) => {
      if (trust_address != '_id') {
        trust_contracts[31337]['localhost']['contracts'][trust_address] = {
          address: trust_address,
          abi: simpleT_ABI["abi"],
        }
      }
    });
  }
  console.log("trust_contracts", trust_contracts);

  const contractConfig = {
    deployedContracts: trust_contracts || {}
  };
  // console.log("props.contractConfig", props.contractConfig);
  // console.log("contractConfig", contractConfig);

  // Load in your local 📝 contract and read a value from it:
  const contracts = useContractLoader(props.localProvider, contractConfig, props.localChainId);
  // console.log("contracts", contracts);
  
  // SYNC blockchain to Database
  // TODO: Create sync button to limit requests to blockchain
  // TODO: consider interating over contracts instead of user_data: 
  //  const address = contract ? contract.address : ""; 
  if (userData) {
    Object.keys(userData).forEach(async (trust_address, index) => {
      if (trust_address != '_id') {
        console.log("trust_address",trust_address)  

        let contract = contracts ? contracts[trust_address] : "";

        // Use helper to read contract
        let contractDisplay = readContract(contract, props.userSigner);

        // Await responses
        const responses = await Promise.all(contractDisplay)      

        // Array => Object
        let trustValues = Object.assign({}, ...responses);
        
        // Look for trust in database
        let trustDataPromise = getTrustData(trust_address);
        let trustData = await trustDataPromise;
        console.log("trustData", trustData);
        if (trustData) {
          updateTrustBlockchainValues(
            trust_address,
            trustValues
          )
        } else {
          // Not found. Add the Trust.
          let newTrust = {
            _id: trust_address,
            blockchain: trustValues,
          }
          addNewTrust(newTrust)
        }
      }
    });
  }



  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      
    },
    {
      title: 'Address',
      dataIndex: '_id',
      key: '_id',
      render:text=><Link to={`${text}`}>{text}</Link>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },

  ];


 //===================================================
 // This method fetchs the records from the database.
 //===================================================

 useEffect(async () => {
    // // TODO: This is used in sideBar too, extract to single
    const responsePromise = getUserTrusts(props.address);    
    const userTrusts = await responsePromise;
    console.log('userTrusts', userTrusts)

    let trusts = [];
    if ( userTrusts !== undefined && userTrusts !== null) {
      // TODO need to make this one request of multiple trusts
      for (const [trust_address, value] of Object.entries(userTrusts)) {
        if (trust_address != '_id') {
          // SYNC Chain with Database (this is also how 'blockchain'entries are initially added)
          const response = await fetch(`http://localhost:5000/trust/${trust_address}`);
          if (!response.ok) {
            const message = `An error occurred: ${response.statusText}`;
            window.alert(message);
            return;
          } else {
            let trustData = await response.json();
            trustData['role'] = userTrusts[trust_address]['role'];
            trusts.push(trustData);
          }
        }
        console.log("trusts", trusts);
      }
    }
  
    setRecords(trusts);
 
   return;
  }, [props.address]);
 
  // This method will delete a record
  async function deleteRecord(id) {
    await fetch(`http://localhost:5000/${id}`, {
      method: "DELETE"
    });
  
    const newRecords = records.filter((el) => el._id !== id);
    setRecords(newRecords);
  }
 

  const onClick = (e) => {
    console.log('Content: ', e.currentTarget.dataset.id);
  }

 // This following section will display the table with the records of individuals.
 return (
   <div>
      <div style={{ padding: 25, marginTop: 100, width: 400, margin: "auto" }}/>
     <h3>Your Trusts</h3>
     <Table
      columns={columns}
      dataSource={records}
      // pagination={pagination}
      // loading={loading}
      // onChange={handleTableChange}
    />
  <NavLink className="nav-link" to="/trusts/new">
    <Button type={"primary"}>
      New Trust     
    </Button >
  </NavLink>



     {/* Example Button */}
    {/* <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />      
    <Button
      type={"primary"}
      onClick={async () => {
        console.log("records", records);
        }
      }
    >  
        Click it
    </Button> */}
   </div>
 );
}

// // Render a button by adding to the table columns
// {
//   title: 'Action',
//   dataIndex: 'del',
//   key: '_id',
//   render: (text, record) => (
//     <button 
//       onClick={async ()=> {
//         console.log('record',record)
//         console.log('_id',record._id)

//         const users_with_trust_promise = await fetch(`http://localhost:5000/user/trust/${record._id}`);
        
//         const users_with_trust = await users_with_trust_promise.json();


//         console.log("users_with_trust", users_with_trust);



//         // await fetch(`http://localhost:5000/${record._id}`, {
//         //   method: "DELETE"
//         // });
//         // const newRecords = records.filter((el) => el._id !== record._id);
//         // setRecords(newRecords);
//         // console.log('newRecords',newRecords)

//       }}
//       >
//       {"Delete"}
//     </button>
//   )
// },