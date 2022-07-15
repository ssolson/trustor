import {useContractLoader, useContractReader } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag } from "antd";
import "antd/dist/antd.css";

const { ethers } = require("ethers");

export default function TrusteeTable({
  readContracts,
  }) {

  const columns = [
    {
      title: 'Trustee',
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
      title: 'Trust set for Execution?',
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
  const allTrustees = useContractReader(readContracts, "SimpleT", "getTrustee", []);

  async function getAllTrustees()  {
    if (allTrustees) {
      const allTrustees = await readContracts.SimpleT.getTrustee();
      
      console.log("allGrantors", allTrustees);
      var trusteeData =[];
  
      for (const index in allTrustees) {
        let trusteeAdress = allTrustees[index];
        // let isActive = trust_bal>0 ? true : false;  
        let isActive = true;  

        let i=parseInt(index)+1;
        let dat={
          key: index, 
          name: `${i}`,
          address:  trusteeAdress,
          active: [String(isActive)],
        };       
        trusteeData.push(dat); // console.log(dat);
      }
      console.log("TrusteeData: ",trusteeData);
      setTrusteeData(trusteeData)
      return trusteeData;
    }
  }

  
  const [trusteeData, setTrusteeData] = useState();
  const [data1, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchData = (params = {}) => {
    setLoading(true);
    getAllTrustees()
      .then( results => {
        console.log("🏦 results:", results)
        setData(results);
        setLoading(false);
        setPagination({
          ...params.pagination,
          total: 10, //Need to fix this
        });
      });
  };
    
  useEffect(() => {
    fetchData({
      pagination,
    });
  }, [allTrustees]);
  
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
      dataSource={data1}
      pagination={pagination}
      loading={loading}
      onChange={handleTableChange}
    />
    </div>
  );
}
