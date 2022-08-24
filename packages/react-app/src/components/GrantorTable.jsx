import {useContractReader } from "eth-hooks";
import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import {
  addNewTrust,
  getUserTrusts,
  getTrustData,
  updateTrustBlockchainValues
} from '../helpers/database'

const { ethers } = require("ethers");

export default function GrantorTable({
  readContracts,
  }) {

  const columns = [
    {
      title: 'Grantor',
      dataIndex: 'name',
      sorter: true,
      // render: (name) => `${name.first} ${name.last}`,
      width: '5%',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: '20%',
    },
    {
        title: 'Token ID',
        dataIndex: 'token',
        key: 'token',
        width: '10%',
    },
    {
      title: 'Grantor Balance',
      dataIndex: 'grantor_bal',
      key: 'grantor_bal',
      width: '10%',
    },
    {
      title: 'Trust Balance',
      dataIndex: 'trust_bal',
      key: 'trust_bal',
      width: '10%',
  },
    {
      title: 'Assets Assigned to Trust',
      dataIndex: 'active',
      key: 'active',
      render: (_, { active }) => (
        <>
          {active.map((act) => {
          let color = act==='true' ? 'green' : 'volcano';
          
          return (
            <Tag color={color} key={act}>
              {act.toUpperCase()}
            </Tag>
          );
        })}
        </>
      ),
      width: '15%',
    },
  ];


  const trustAddress = readContracts && readContracts.SimpleT && readContracts.SimpleT.address;
  const getGrantors = useContractReader(readContracts, "SimpleT", "getGrantors", []);


  useEffect(async ()=> {
      // const allGrantors = await readContracts.SimpleT.getGrantors();
      if (getGrantors) {
        var grantorData =[];  
        for (const index in getGrantors) {
          let grantorAdress = getGrantors[index];
          let tokenID = await readContracts.SimpleT._token_ids(grantorAdress);
          let grantor_bal = await readContracts.SimpleT.balanceOf(grantorAdress, tokenID.toNumber());
          let trust_bal = await readContracts.SimpleT.balanceOf(trustAddress, tokenID.toNumber());
          let isActive = trust_bal>0 ? true : false;  
          console.log("isActive: ", isActive);

          let i=parseInt(index)+1;
          let dat={
            key: index, 
            name: `${i}`,
            address:  grantorAdress,
            token: tokenID.toNumber(),
            grantor_bal: ethers.utils.formatEther(grantor_bal),
            trust_bal: ethers.utils.formatEther(trust_bal),
            active: [String(isActive)],
          };       
          grantorData.push(dat); // console.log(dat);
        }
        console.log("GrantorData: ",grantorData);
        setGrantorData(grantorData)

        // Replace the Above with data from the database
        const response = getTrustData(trustAddress)
        const trustData = await response;
        console.log("trustData: ", trustData);
        // let dat2={
        //   // key: index, 
        //   name: `${i}`,
        //   address:  grantorAdress,
        //   token: tokenID.toNumber(),
        //   grantor_bal: ethers.utils.formatEther(grantor_bal),
        //   trust_bal: ethers.utils.formatEther(trust_bal),
        //   active: [String(isActive)],
        // }; 
      }
      
  }, [getGrantors])




  // const [newGrantorAddr, setNewGrantorAddr] = useState("loading...");
  const [grantorData, setGrantorData] = useState();
  const [data1, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // const fetchData = (params = {}) => {
  //   setLoading(true);
  //   getAllGrantors()
  //     .then( results => {
  //       console.log("🏦 results:", results)
  //       setData(results);
  //       setLoading(false);
  //       setPagination({
  //         ...params.pagination,
  //         total: 10, //Need to fix this
  //       });
  //     });
  // };
    
  // useEffect(() => {
  //   fetchData({
  //     pagination,
  //   });
  // }, [getGrantors]);
  
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchData({
      sortField: sorter.field,
      sortOrder: sorter.order,
      pagination: newPagination,
      ...filters,
    });
  };


  return (
    <div>
      <Table
        columns={columns}
        dataSource={grantorData}
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
      />


    </div>
  );
}
