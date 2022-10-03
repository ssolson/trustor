import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Space, Row, Col, Card, Divider, Select, Checkbox } from "antd";
const { ethers } = require("ethers");

export default function GrantorCard(props) {
  const form = props.form;

  const grantorName = props.grantorName;

  const [checkInitialTrustee, setCheckInitialTrustee] = useState(false);

  useEffect(() => {
    form.validateFields(["initialTrustee"]);
  }, [checkInitialTrustee, form]);

  const onCheckboxChange = e => {
    setCheckInitialTrustee(e.target.checked);
  };

  return (
    <div>
      <Card title="TRUSTEE" size="medium" style={{ borderColor: "black" }}>
        <p>
          The Trustees oversee the execution of the Trust on the Grantor's behalf. Trustees are required to make
          decisions in the beneficiary's best interests and have a fiduciary responsibility to them, meaning they act in
          the best interests of the beneficiaries to manage their assets. The inital trustee is set to the grantor
          because after the grantor has transferred their assets to the trust, they then serve as its initial trustee.
          That means, while the trust technically holds the assets, the creator retains the right to alter the trust,
          remove property from the trust, or revoke it entirely during their lifetime.
        </p>

        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Administrative Wallet
        </Divider>
        <p>
          The listed wallet will have full administrative control over the wallet. This wallet is not required to be
          grantor. This grantor and wallet will serve as the initial trustee. This should be the Grantor of the Trust in
          almost all cases and unless you know what you are doing it is not suggested to list a name here as the name
          will default to the grantors of the trust.
        </p>
        <Row gutter={8}>
          <Col span={16}>
            <Form.Item
              name="initialTrusteeWallet"
              label="Administrative Wallet Address"
              rules={[
                {
                  required: true,
                  message: "Please input the Initial Trustee name.",
                },
              ]}
            >
              <Input placeholder="Trust Admin Address" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={16}>
            <Form.Item>
              <Checkbox checked={checkInitialTrustee} onChange={onCheckboxChange}>
                Manually Set Intial Trustee (Not Reccomended)
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={1}></Col>
          <Col span={16}>
            <Form.Item
              name="initialTrusteeName"
              label="Initial Trustee Name"
              // initialValue={props.initialTrustee}
              rules={[
                {
                  required: checkInitialTrustee,
                  message: "Please input the Initial Trustee name.",
                },
              ]}
            >
              <Input placeholder={props.initialTrustee} disabled={!checkInitialTrustee} />
              {/* <Input disabled={!checkInitialTrustee} /> */}
            </Form.Item>
          </Col>
        </Row>

        <p></p>

        {/* TRUSTEE TIME */}
        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Time Between Succesor Trustees
        </Divider>
        <p>Specify the time each Trustee has before the next Trustee has access to the Trust.</p>
        <Row gutter={8}>
          <Col span={8.5}>
            <Form.Item
              name="timeBetweenTrustees"
              label="Trustee Action Period"
              initialValue={2}
              rules={[
                {
                  required: true,
                  message: "Must Specify the time a Trustee has to act.",
                },
              ]}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span={4}> Weeks </Col>
        </Row>

        {/* SUCCESOR TRUSTEE INPUT */}
        <Divider orientation="left">Succesor Trustee</Divider>
        <p>
          A Successor Trustee is the person or institution who takes over the management of a living trust property when
          the original trustee has died or become incapacitated. A successor Trustee will be able to execute the Trust
          following 2 weeks of inactivity by the previously assigned Trustee. Succesor Trustees are assigned in order,
          meaning that Succesor Trustee 1 may act as a Trustee after 2 weeks of inactivity by the initial Trustee.
          Succesor trustee 2 would be able to act as Trustee following an additional 2 weeks of inactivity by successor
          trustee 1.
        </p>
        <Form.List name="newTrustee">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Card key={index}>
                  <Row gutter={8}>
                    <Col span={1}>
                      <Form.Item>{`${index + 1}.`}</Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        label="First"
                        name={[field.name, "first"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing Trustee First Name",
                          },
                        ]}
                      >
                        <Input placeholder="First Name" />
                      </Form.Item>
                    </Col>
                    <Col span={4}>
                      <Form.Item label="MI" name={[field.name, "middle"]}>
                        <Input />
                      </Form.Item>
                    </Col>
                    <Col span={9}>
                      <Form.Item
                        label="Last"
                        name={[field.name, "last"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing Trustee Last Name",
                          },
                        ]}
                      >
                        <Input placeholder="Last Name" />
                      </Form.Item>
                    </Col>
                    <Col span={1}></Col>
                    <Col span={1}></Col>
                    <Col span={22}>
                      <Form.Item
                        label="Address"
                        name={[field.name, "address"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing Trustee Address",
                          },
                        ]}
                      >
                        <Input placeholder="Trustee Address" />
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      {fields.length > 1 ? <MinusCircleOutlined onClick={() => remove(field.name)} /> : null}
                    </Col>
                  </Row>
                </Card>
              ))}

              {/* BUTTON TO ADD MORE TRUSTEES */}
              <Col span={24}>
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                    Add Trustee
                  </Button>
                </Form.Item>
              </Col>
            </>
          )}
        </Form.List>
      </Card>

      {/* TEST */}
      <Card title="TEST" size="medium">
        <Button
          type={"primary"}
          onClick={async () => {
            console.log("You clicked the button!");

            console.log(props.initialTrustee);
          }}
        >
          Click it
        </Button>
      </Card>
    </div>
  );
}
