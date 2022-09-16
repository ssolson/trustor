import { useContractLoader, useContractReader } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import { Table, Tag } from "antd";
import "antd/dist/antd.css";

const { ethers } = require("ethers");

export default function BeneficiaryTable({ readContracts }) {
  const columns = [
    {
      title: "Beneficiary",
      dataIndex: "name",
      sorter: true,
      // render: (name) => `${name.first} ${name.last}`,
      width: "5%",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
      width: "20%",
    },
    {
      title: "Percentage",
      dataIndex: "percent",
      key: "percent",
      width: "20%",
    },
    {
      title: "Can Claim",
      dataIndex: "active",
      key: "active",
      render: (_, { active }) => (
        <>
          {active.map(act => {
            let color = act === "true" ? "green" : "volcano";

            return (
              <Tag color={color} key={act}>
                {act.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
      width: "15%",
    },
  ];

  const trustAddress = readContracts && readContracts.SimpleT && readContracts.SimpleT.address;
  const allBeneficiaries = useContractReader(readContracts, "SimpleT", "getBeneficiaries", []);

  async function getAllBeneficiaries() {
    if (allBeneficiaries) {
      const allBeneficiaries = await readContracts.SimpleT.getBeneficiaries();

      console.log("allGrantors", allBeneficiaries);
      var beneficiaryData = [];

      for (const index in allBeneficiaries) {
        let trusteeAdress = allBeneficiaries[index];
        let percent = await readContracts.SimpleT.getAddressShares(trusteeAdress);
        // let isActive = trust_bal>0 ? true : false;
        let isActive = false;

        let i = parseInt(index) + 1;
        let dat = {
          key: index,
          name: `${i}`,
          address: trusteeAdress,
          percent: percent.toString(),
          active: [String(isActive)],
        };
        beneficiaryData.push(dat); // console.log(dat);
      }
      console.log("beneficiaryData: ", beneficiaryData);
      setBeneficiaryData(beneficiaryData);
      return beneficiaryData;
    }
  }

  const [beneficiaryData, setBeneficiaryData] = useState();
  const [data1, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const fetchData = (params = {}) => {
    setLoading(true);
    getAllBeneficiaries().then(results => {
      console.log("🏦 results:", results);
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
  }, [allBeneficiaries]);

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
