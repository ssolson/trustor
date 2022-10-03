import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Space,
  Row,
  Col,
  Card,
  Divider,
  Select,
  Checkbox,
  Typography,
  Table,
} from "antd";
const { ethers } = require("ethers");

export default function GrantorCard(props) {
  const form = props.form;
  const grantorName = props.grantorName;

  return (
    <div>
      {/* GRANTOR */}
      <Card title="GRANTOR" size="medium" style={{ borderColor: "black" }}>
        <p>
          A grantor is an individual or other entity that creates a trust (i.e., the individual whose assets are put
          into the trust) regardless of whether the grantor also functions as the trustee.
        </p>

        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Grantor Names
        </Divider>
        <p>
          The Primary Grantor is used as a designator to specify a person and wallet which should have full
          adminstrative privildges over the trust. Formally as the administrator of the trust the primary grantor is
          Trust's initial trustee.
        </p>

        <Form.List name="grantorNames">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Row gutter={8} key={index}>
                  <Col span={1}>
                    <Form.Item>{`${index + 1}.`}</Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item
                      label="First"
                      name={[field.name, "first"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing first Name",
                        },
                      ]}
                    >
                      <Input placeholder="Grantor Name" />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item
                      label="Middle"
                      name={[field.name, "middle"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing last name",
                        },
                      ]}
                    >
                      <Input placeholder="Middle Name" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label="Last"
                      name={[field.name, "last"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing last name",
                        },
                      ]}
                    >
                      <Input placeholder="Last Name" />
                    </Form.Item>
                  </Col>

                  <Col span={1}>
                    {fields.length > 1 ? <MinusCircleOutlined onClick={() => remove(field.name)} /> : null}
                  </Col>
                </Row>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                  Add Grantor
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Grantor Addresses
        </Divider>
        <p>
          Specify the Addresses you would to title into the Trust. Listing an address here only expresses into to list
          the address into the Trust. An aaditional message must be signed by each wallet expressing the intent to
          release right title and interest into the Trust once created.
        </p>

        {/* <Divider orientation="left" dashed style={{ borderColor: "grey" }}>
          Grantor Addresses
        </Divider> */}
        <p>
          In this section list all address which are intended to be added to the trust. These addresses are not tied to
          a specific Grantor.
        </p>
        <Form.List name="grantorAddresses">
          {(fields, { add, remove }) => (
            <>
              {fields.map((field, index) => (
                <Row gutter={8} key={index}>
                  <Col span={1}>
                    <Form.Item>{`${index + 1}.`}</Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label="Address"
                      name={[field.name, "address"]}
                      rules={[
                        {
                          required: true,
                          message: "Missing Grantor Address",
                        },
                      ]}
                    >
                      <Input placeholder="Grantor Address" />
                    </Form.Item>
                  </Col>
                  <Col span={1}>
                    {fields.length > 1 ? <MinusCircleOutlined onClick={() => remove(field.name)} /> : null}
                  </Col>
                </Row>
              ))}

              <Form.Item>
                <Button type="dashed" onClick={() => add()} block icon={<PlusCircleOutlined />}>
                  Add Grantor Address
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
      </Card>

      {/* TEST */}
      {/* <Card title="TEST" size="medium">
        <Button
          type={"primary"}
          onClick={async () => {
            console.log("You clicked the button!");
            // let vals = form.getFieldsValue("newTrust");
            // let grantors = vals["grantorNames"];
            // console.log("join", grantors[0]);

            // let grantor_names = grantors.map(element =>
            //   [element.first, element.middle.substring(0, 1), element.last].join(" "),
            // );
            // console.log("grantor_names", grantor_names);

            // let grantor = grantor_names.join(" & ");
            // console.log("grantor", grantor);

            console.log(grantorName);
            console.log(!grantorName.includes(undefined));
            // console.log(
            //   grantorName.map(element =>
            //     Object.values(element).every(value => {
            //       if (value === null) {
            //         return true;
            //       }
            //       return false;
            //     }),
            //   ),
            // );

            console.log(grantorName.map(element => Object.values(element).join(" ")));
          }}
        >
          Click it
        </Button>
      </Card> */}
    </div>
  );
}
