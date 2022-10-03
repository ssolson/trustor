import NewTrust from "contracts/bytecode.json";
import { useNavigate } from "react-router-dom";
import { useContractLoader } from "eth-hooks";
import React, { useCallback, useEffect, useState } from "react";
import "antd/dist/antd.css";
import { addNewTrust } from "helpers/database";
import GrantorCard from "./GrantorCard";
import TrusteeCard from "./TrusteeCard";
import BeneficiaryCard from "./BeneficiaryCard";
import GeneralCard from "./GeneralCard";
import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, InputNumber, Space, Row, Col, Card, Divider, Select, Checkbox } from "antd";
const { ethers } = require("ethers");

const formTailLayout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 8,
    offset: 4,
  },
};

export default function NewTrustPage(props) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [checkInitialTrustee, setCheckInitialTrustee] = useState(false);

  useEffect(() => {
    form.validateFields(["initialTrustee"]);
  }, [checkInitialTrustee, form]);

  const onCheckboxChange = e => {
    setCheckInitialTrustee(e.target.checked);
  };

  const onCheck = async () => {
    try {
      const values = await form.validateFields();
      console.log("Success:", values);
    } catch (errorInfo) {
      console.log("Failed:", errorInfo);
    }
  };

  const onFinish = async form => {
    //  navigate("/trusts");
    console.log("Amazing!");
  };

  const contracts = useContractLoader(props.localProvider, props.contractConfig, props.localChainId);
  let lockedContract = contracts ? contracts["SimpleT"] : "";
  // console.log("lockedContract", lockedContract);
  if (lockedContract) {
    // console.log("connect", lockedContract.connect(props.userSigner));
  }
  const contract = { ...lockedContract };

  contract["address"] = "0x8B0125E6ceFe1B430803CDfEE4fe5F71a3B9FFe9";

  if (contract.interface) {
    const displayedContractFunctions = contract
      ? Object.values(contract.interface.functions).filter(
          // fn => fn.type === "function" && !(props.show && props.show.indexOf(fn.name) < 0),
          fn => fn.type === "function",
        )
      : [];
    // console.log("displayedContractFunctions", displayedContractFunctions);
  }

  const [initialTrustee, setInitialTrustee] = useState("Please Add a Grantor Name");

  const grantorName = Form.useWatch("grantorNames", form);
  useEffect(() => {
    // TODO: Set up to always go First, M, Last. Currently Order of inputs matters
    let combinedName =
      typeof grantorName !== "undefined" && grantorName && !grantorName.includes(undefined)
        ? grantorName.map(element => Object.values(element).join(" ")).join(" & ")
        : "Please Add a Grantor Name";
    setInitialTrustee(combinedName);
  }, [grantorName, form]);
  // TODO: ADD watch, varaible, and useEffect for manual Initial Trustee, right now it doesn't work

  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />
      <Form
        form={form}
        name="newTrust"
        onFinish={onFinish}
        initialValues={{
          grantorNames: [undefined],
          grantorAddresses: [undefined],
          newTrustee: [undefined],
          newBeneficiary: [undefined],
          initialTrusteeName: [grantorName],
        }}
      >
        <Space
          direction="vertical"
          size="middle"
          style={{
            display: "flex",
          }}
        >
          <GrantorCard form={form} grantorName={grantorName} />
          <TrusteeCard form={form} grantorName={grantorName} initialTrustee={initialTrustee} />
          <BeneficiaryCard />
          <GeneralCard form={form} grantorName={grantorName} />

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              onClick={async () => {
                // Step 1: Collect Data from input fields to pass to Smart COntract as arguments
                let vals = form.getFieldsValue("newTrust");
                // console.log("vals", vals);

                // Set initial Trustee name
                if (
                  typeof vals["initialTrusteeName"] === "undefined" ||
                  vals["initialTrusteeName"] ||
                  vals["initialTrusteeName"].includes(undefined)
                ) {
                  vals["initialTrusteeName"] = initialTrustee;
                }

                // Set Trust Name
                if (
                  typeof vals["trustName"] === "undefined" ||
                  vals["trustName"] ||
                  vals["trustName"].includes(undefined)
                ) {
                  vals["trustName"] = initialTrustee + " Living Trust";
                }
                // console.log("vals", vals);

                // let grantors = vals["newGrantor"];
                // let grantor_names = grantors.map(element => element.name);
                // let grantor_addrs = grantors.map(element => element.address);
                const Grantor = vals["initialTrusteeWallet"];

                // const initial_trustee_name = grantors[0]["name"];
                // const initial_trustee_addr = Grantor;

                // let trustees = vals["newTrustee"];
                // trustees.map((element, index) => (trustees[index]["id"] = index));
                // let trustee_names = trustees.map(element => element.name);
                // let trustee_addrs = trustees.map(element => element.address);
                const Trustee = vals["newTrustee"][0]["address"];

                // console.log("Trustee", Trustee);
                // console.log("trustee_names", trustee_names);
                // console.log("trustee_addrs", trustee_addrs);

                let beneficiaries = vals["newBeneficiary"];
                let bene_addrs = beneficiaries.map(element => element.address);
                let bene_shares = beneficiaries.map(element => element.shares);

                const Name = vals["trustName"];
                // // const Grantor = vals["grantor_address"];
                // // const Trustee = vals["trustee_address"];
                const Beneficiary = bene_addrs;
                const Shares = bene_shares;

                let argz = [Name, Grantor, Trustee, Beneficiary, Shares];
                console.log("argz", argz);

                // Step 2: Initiate and deploy the smart contract
                const Trust = new ethers.ContractFactory(NewTrust.abi, NewTrust.bytecode, props.userSigner);

                const newTrustContract = await Trust.deploy(...argz);
                await newTrustContract.deployed();

                const new_trust_address = newTrustContract.address;
                console.log("Trust Address: ", new_trust_address);

                // Step 3: Add the trust to the users database
                // const newTrustDoc = {
                //   name: vals["name"],
                //   trust_address: new_trust_address,
                //   grantor_address: Grantor,
                //   trustee_address: Trustee,
                //   beneficiary_address: Beneficiary,
                //   beneficiary_shares: Shares,
                // };

                // // Add roles to users in the User collection
                // let roles = ["grantor", "trustee", "beneficiary"];

                // // Assign roles to unique addresses
                // let address_roles = {};
                // roles.forEach((role, idx) => {
                //   if (role === "beneficiary") {
                //     beneficiaries.forEach((beneficiary, idx) => {
                //       let beneficiary_address = beneficiary.address;
                //       console.log("beneficiary_address", beneficiary_address);
                //       if (!address_roles[beneficiary_address]) {
                //         address_roles[beneficiary_address] = [role];
                //       } else {
                //         address_roles[beneficiary_address].push(role);
                //       }
                //     });
                //   } else {
                //     let user_address = newTrustDoc[`${role}_address`];
                //     console.log("address_roles[user_address]", address_roles[user_address]);
                //     console.log(role);
                //     if (!address_roles[user_address]) {
                //       address_roles[user_address] = [role];
                //     } else {
                //       address_roles[user_address].push(role);
                //     }
                //     console.log("MODIFIED", address_roles[user_address]);
                //   }
                // });
                // console.log(address_roles);
                // // console.log('addresses[user_address]', addresses[user_address]);
                // let addresses = Object.keys(address_roles);
                // addresses.forEach(async (address, idx) => {
                //   // Check if user exists in User Collection
                //   let response = await fetch(`http://localhost:5000/user/${address}`).catch(error => {
                //     // window.alert(error);
                //     console.log(error);
                //     return;
                //   });

                //   // Get Response
                //   const record = await response.json();
                //   console.log("record", record);
                //   // Now: add user if not exist, append trust to user if currently exists
                //   if (!record) {
                //     // User not exist, create user record

                //     const newUser = {
                //       _id: address,
                //       [new_trust_address]: {
                //         role: address_roles[address],
                //       },
                //     };

                //     await fetch("http://localhost:5000/user/add", {
                //       method: "POST",
                //       headers: {
                //         "Content-Type": "application/json",
                //       },
                //       body: JSON.stringify(newUser),
                //     }).catch(error => {
                //       window.alert(error);
                //       return;
                //     });

                //     return;
                //   } else {
                //     // User already exists add trust to user.
                //     // If new trust for user add trust, else modify trust roles
                //     console.log("record[new_trust_address]", record[new_trust_address]);
                //     console.log("record[new_trust_address] === undefined", record[new_trust_address] === undefined);

                //     // Create new trust record
                //     const newTrustData = {
                //       [new_trust_address]: {
                //         role: address_roles[address],
                //       },
                //     };
                //     console.log("newTrust", newTrustData);

                //     let response2 = await fetch(`http://localhost:5000/user/${address}`, {
                //       method: "POST",
                //       headers: {
                //         "Content-Type": "application/json",
                //       },
                //       body: JSON.stringify(newTrustData),
                //     }).catch(error => {
                //       window.alert(error);
                //       return;
                //     });
                //   }
                // });

                // // Add newTrust to the Trust Collection
                // const newTrust = {
                //   _id: new_trust_address,
                //   name: vals["name"],
                //   trust_address: new_trust_address,
                //   grantor_address: Grantor,
                //   trustee_address: Trustee,
                //   beneficiary_address: Beneficiary,
                //   beneficiary_shares: Shares,
                // };
                // newTrust["_id"] = new_trust_address;

                // addNewTrust(newTrust);
              }}
            >
              Submit
            </Button>
          </Form.Item>
        </Space>
      </Form>

      <Button
        type={"primary"}
        onClick={async () => {
          console.log("You clicked the button!");
          console.log(grantorName);
          console.log(
            typeof grantorName !== "undefined" && grantorName && !grantorName.includes(undefined)
              ? grantorName.map(element => Object.values(element).join(" ")).join(" & ")
              : "Please Add a Grantor Name",
          );
          console.log(initialTrustee);
        }}
      >
        Click it
      </Button>
    </div>
  );
}

{
  /* <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />  */
}
