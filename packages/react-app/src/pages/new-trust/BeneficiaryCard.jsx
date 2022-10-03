import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Space, Row, Col, Card, Divider, Select, Checkbox } from "antd";
const { ethers } = require("ethers");

export default function BeneficiaryCard(props) {
  return (
    <div>
      {/* Beneficiaries */}
      <Card title="Beneficiary" size="medium" style={{ borderColor: "black" }}>
        <p>
          The Beneficiary recieves the assets from the Trust. In addition to specifying the name and address of a
          beneficiary a number of shares must be assigned. A beneficiary is entitled to recieve their percentage of the
          total shares issued.
        </p>
        <Form.List name="newBeneficiary">
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
                    <Col span={10}>
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
                    {/* <Col span={1}></Col> */}

                    <Col span={16}>
                      <Form.Item
                        label="Address"
                        name={[field.name, "address"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing Beneficiary address",
                          },
                        ]}
                      >
                        <Input placeholder="Beneficiary Address" />
                      </Form.Item>
                    </Col>
                    <Col span={7}>
                      <Form.Item
                        label="Shares"
                        name={[field.name, "shares"]}
                        rules={[
                          {
                            required: true,
                            message: "Missing Shares",
                          },
                        ]}
                      >
                        <InputNumber placeholder="0" />
                      </Form.Item>
                    </Col>
                    <Col span={1}>
                      {fields.length > 1 ? <MinusCircleOutlined onClick={() => remove(field.name)} /> : null}
                    </Col>
                  </Row>
                </Card>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                  Add Beneficiary
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>
      {/* TEST */}
      {/* <Card title="TEST" size="medium"></Card> */}
    </div>
  );
}
