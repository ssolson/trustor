import NewTrust from '../contracts/SimpleT.json';
import { useNavigate } from "react-router-dom";
import React, { useState } from 'react';
const { ethers } = require("ethers");
import 'antd/dist/antd.css';

import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Space,
} from 'antd';
import { 
  MinusCircleOutlined, 
  PlusCircleOutlined,
} from '@ant-design/icons';


export default function NewTrustPage(props) {
  const navigate = useNavigate(); 
  const [form] = Form.useForm();

  const onFinish = async (form) => {
    // e.preventDefault();
    console.log('Received values of form:', form);
  
     navigate("/your-trusts");
   }
  
  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      <Form 
        form={form} 
        name="newTrust"
        onFinish={onFinish}
      >
        <Form.Item 
          // name='trust_name'
          name='name'
          label="Trust Name"
          >
          <Input />
        </Form.Item>
        <Form.Item 
        label="Grantor Address"
        name='grantor_address'
        >
          <Input />
        </Form.Item>  
        <Form.Item 
        label="Initial Trustee Address"
        name='trustee_address'
        >
          <Input />
        </Form.Item>  
        <Form.Item 
        label="Trust End Date"
        name='end_date'
        >
          <DatePicker />
        </Form.Item>
        <Form.List 
          name="newBeneficiaries"
          >
          {(fields, { add, remove }) => (
            <>
              {fields.map((field) => (
                <Space  key={field.key} align="baseline">
                  <Form.Item
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
                    label="Shares"
                    name={[field.name, 'shares']}
                    rules={[
                      {
                        required: true,
                        message: 'Missing Shares',
                      },
                    ]}
                    >
                    <InputNumber />
                  </Form.Item>
                  <MinusCircleOutlined onClick={() => remove(field.name)} />
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
              let vals = form.getFieldsValue('newTrust');              
              console.log('vals', vals);

              let beneficiaries = vals['newBeneficiaries'];
              let bene_addrs = beneficiaries.map(element => element.address)
              let bene_shares = beneficiaries.map(element => element.shares)

              console.log(props.userSigner.address);

              const Trust = new ethers.ContractFactory(
                NewTrust.abi,
                NewTrust.bytecode,
                props.userSigner
              );
    
              console.log("New TRUST: ", Trust);
    
              const Grantor = vals['grantor_address'];
              const Trustee = vals['trustee_address'];
              const Beneficiary = bene_addrs;
              const Shares = bene_shares;

              // const Grantor = "0x69dA48Df7177bc57639F1015E3B9a00f96f7c1d1";
              // const Trustee = "0x1Bd59929EAb8F689B3c384420f4C50A343110E40";
              // const Beneficiary = ["0x1Bd59929EAb8F689B3c384420f4C50A343110E40", 
              //                     "0x79864b719729599a4695f62ad22AD488AB290e58"];
              // const Shares = [75,25];
              let argz = [Grantor, Trustee, Beneficiary, Shares]
              const newTrustContract = await Trust.deploy(...argz);
              await newTrustContract.deployed();
    
              console.log("Trust Address: ", newTrustContract.address);
                               
              
                  //  When a post request is sent to the create url, we'll add a new record to the database.
                const newTrustDoc = {};
                newTrustDoc['name'] = vals['name'];
                newTrustDoc['trust_address'] = newTrustContract.address;
                newTrustDoc['_id'] = newTrustContract.address;
                newTrustDoc['grantor_address'] = Grantor;
                newTrustDoc['beneficiary_address'] = Beneficiary;
                newTrustDoc['beneficiary_shares'] = Shares;
                console.log('newTrustDoc', newTrustDoc);
                await fetch("http://localhost:5000/record/add", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(newTrustDoc),
                })
                .catch(error => {
                  window.alert(error);
                  return;
                });
              // const allTrustContracts = trustContracts;
    
              // console.log("All Trust Contracts: ", trustContracts);
              
              // const newTrust = {
              //   account: {
              //     vals['grantor_address'] :
              //       trusts: {
              //         newTrustContract.address : {
              //           roles: 'grantor'
              //         }
              //       }
              //   name: vals['grantor_address'],
              //   address: newTrustContract.address
              // }

              // const newTrust = {
              //   name: vals['grantor_address'],
              //   address: newTrustContract.address
              // }



              // fetch(
              //   'https://trustor-2e1dd-default-rtdb.firebaseio.com/trusts.json',
              //   {
              //     method: 'POST',
              //     body: JSON.stringify(newTrust),
              //     headers: {
              //       'Content-Type': 'application/json'
              //     }
              //   })
            }}
            >
            Submit
          </Button>
        </Form.Item>
      </Form>
      </div>
  )
}


    {/* <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />  
    
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
    New Trust Page  */}