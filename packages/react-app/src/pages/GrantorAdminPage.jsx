import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';
import { 
  Button, 
  Card, 
  Divider, 
  Input, 
  Form,  
  Space
} from "antd";
import { 
  MinusCircleOutlined, 
  PlusCircleOutlined,
} from '@ant-design/icons';
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


export default function GrantorAdminPage(props) {
  const [newGrantorAddr, setNewGrantorAddr] = useState();
  const [newTrusteeAddr, setNewTrusteeAddr] = useState();
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log('Received values of form:', values);
  };

  const location = useLocation();

  function getCurrentTrust() {
    const splitPath = (location.pathname).split('/')
    const currentTrust  = splitPath[2]
    console.log('location.pathname', currentTrust)
    return currentTrust;
  }

  let trust_address = getCurrentTrust()
  deployedContracts[31337]['localhost']['contracts']['SimpleT']['address']=trust_address

  const contractConfig = {
    deployedContracts: deployedContracts
  };

    // console.log('deployedContracts', 
    // deployedContracts[31337]['localhost']['contracts']['SimpleT']['address']
    // )

    // Load in your local 📝 contract and read a value from it:
    const readContracts = useContractLoader(props.localProvider, contractConfig);
    
  return (
    <div>  
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      {/* <GrantorTable readContracts={readContracts} /> */}
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
                onClick={async () => {props.tx(props.writeContracts.SimpleT.addGrantor(newGrantorAddr), )}}  
              >
                Add
              </Button>
            </Input.Group>
          </div>
        </Card>
      </div> 
      
      <Divider orientation="left">Modify Trustee Actions</Divider>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      <TrusteeTable readContracts={props.readContracts} />
      <div style={{ padding: 8, marginTop: 32, width: 400, margin: "auto" }}>
      
        <Card title="Add Trustee" >                
          <div className="site-input-group-wrapper">
            <Input.Group compact>
              <Input
                style={{
                  width: "calc(100% - 80px)"
                }}
                onChange={e => {
                  setNewTrusteeAddr(e.target.value);
                }}
                placeholder="Trustee address"
              />
              <Button
                type={"primary"}
                onClick={async () => {props.tx(props.writeContracts.SimpleT.addTrustee(newTrusteeAddr), )}}  
              >
                Add
              </Button>
            </Input.Group>
          </div>
        </Card>
      </div>
      
      <Divider orientation="left">Modify Beneficiary Actions</Divider>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }}/>
      <BeneficiaryTable readContracts={props.readContracts} />
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
                  <Space key={field.key} align="baseline">
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
                let addresses = vals.map(element => element.address)
                let shares = vals.map(element => element.shares)
                
                
                // console.log('newBeneficiaries', vals);
                console.log('addresses', addresses);
                console.log('shares', shares);
                const result = props.tx(props.writeContracts.SimpleT.setBeneficiaries(addresses, shares), )
                console.log('result', result);

              }}
              >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div> 
    </div>
  )
}


// export default FavoritesPage;