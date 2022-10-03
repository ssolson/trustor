import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Space, Row, Col, Card, Divider, Select, Checkbox } from "antd";
const { ethers } = require("ethers");

const jurisdictions = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "District of Columbia",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

export default function GeneralCard(props) {
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
      <Card title="TODO: General Trust INFO" size="medium" style={{ borderColor: "black" }}>
        {/* JURISDICTION */}
        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Trust Jurisdiction
        </Divider>
        <Row gutter={8}>
          <Col span={8}>
            <Form.Item label="Trust Jurisdiction" required={true}>
              <Select>
                {jurisdictions.map((jurisdiction, index) => (
                  <Select.Option key={index} value={jurisdiction}>
                    {jurisdiction}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* TRUST NAME */}
        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Trust Name
        </Divider>
        <Row>
          <Col span={16}>
            <Form.Item>
              <Checkbox checked={checkInitialTrustee} onChange={onCheckboxChange}>
                Manually Set Trust Name
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={8}>
          <Col span={1}></Col>
          <Col span={16}>
            <Form.Item
              name="trustName"
              label="Trust Name"
              rules={[
                {
                  required: checkInitialTrustee,
                  message: "A trust must have a name.",
                },
              ]}
            >
              <Input
                placeholder={
                  typeof grantorName !== "undefined" && grantorName && !grantorName.includes(undefined) // &&
                    ? grantorName.map(element => Object.values(element).join(" ")).join(" & ") + " Living Trust"
                    : "Please Add Grantor Name(s) for Trust Name suggestion"
                }
                disabled={!checkInitialTrustee}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* CHECK-IN PERIOD */}
        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Time Between Succesor Trustees
        </Divider>
        <p>Specify the time each Trustee has before the next Trustee has access to the Trust.</p>
        <Row gutter={8}>
          <Col span={8.5}>
            <Form.Item
              name="checkInPeriod"
              label="How often would you like to Check-In?"
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
          <Col span={4}> Months </Col>
        </Row>

        {/* TRUST END DATE */}
        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Ultimate Trust End Date
        </Divider>
        <Form.Item label="Trust End Date" name="end_date">
          <DatePicker />
        </Form.Item>
      </Card>
      {/* TEST */}
      {/* <Card title="TEST" size="medium"></Card> */}
    </div>
  );
}
