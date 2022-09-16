import { Link } from "react-router-dom";
import { Menu, Layout } from "antd";
import React, { useEffect, useState } from "react";
import { LaptopOutlined, HomeOutlined } from "@ant-design/icons";

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const getUserTrusts = async userSigner => {
  // Define Trusts as empty
  let trusts = [];
  let user_data = {};

  try {
    const response = await fetch(`http://localhost:5000/user/${userSigner}`);
    if (!response.ok) {
      const message = `An error occurred: ${response.statusText}`;
      window.alert(message);
      return;
    }
    user_data = await response.json();
  } catch (error) {
    console.log("SideBar thinks you are offline :o");
  }

  if (user_data) {
    for (const [trust_address, value] of Object.entries(user_data)) {
      // let current_trust = {};
      if (trust_address != "_id") {
        // console.log(`${trust_address}: ${[value['role']]}`);
        let userRoles = value["role"].map(role =>
          getItem(<Link to={`/trusts/${trust_address}/${role}`}>{role}</Link>, `/trusts/${trust_address}/${role}`),
        );
        let pdf = {
          key: "PDF",
          label: <Link to={`/trusts/${trust_address}/pdf`}>PDF</Link>,
        };
        console.log("children?", [...userRoles, pdf]);

        const current_trust = {
          key: trust_address,
          label: (
            <Link to={`/trusts/${trust_address}`}>
              {trust_address.slice(0, 5) + "..." + trust_address.substring(trust_address.length - 4)}
            </Link>
          ),
          children: [...userRoles, pdf],
        };
        trusts.push(current_trust);
        console.log("trusts.children", trusts[0]["children"]);
      }
      console.log("trusts", trusts);
    }
  }
  return trusts;
};

export default function SideBar(props) {
  const [userTrusts, setUserTrusts] = useState([]);
  let address = "0x0000000000000000000000000000000000000000";
  try {
    address = props.userSigner.address;
  } catch (e) {
    console.log("address not set");
  }
  const [user, setUser] = useState(address);

  useEffect(() => {
    // console.log("props", props);
    setUser(address);
  }, [address]);

  useEffect(async () => {
    // console.log("user", user);
    if (typeof user !== "undefined" && user) {
      let userTrustsPromise = await getUserTrusts(user);
      let trusts = await userTrustsPromise;
      // console.log("trusts", trusts);
      setUserTrusts(trusts);
    }
    return;
  }, [user]);

  const items = [
    getItem(<Link to="/"> Home </Link>, "home", <HomeOutlined />),
    getItem(<Link to="/trusts"> Trusts </Link>, "trusts", <LaptopOutlined />, userTrusts),
    // {
    //   key:'2',
    //   icon:<FileOutlined />,
    //   label: 'OnClick',
    //   onClick: async ( ) => {

    //     // console.log('Current user:', props.userSigner.address);
    //     const trust_data = await getUserTrusts(props.userSigner.address);
    //     // console.log('trusts', trust_data);
    //   }
    // },
  ];
  // console.log("items", items);

  // const items = [
  //   {
  //     key:'0',
  //     icon:<HomeOutlined />,
  //     label:(
  //       <Link to="/">
  //         Home
  //       </Link>
  //     ),
  // ]

  return (
    <Menu theme="dark" defaultSelectedKeys={["1"]} mode="inline" items={items} />
    // {/* <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">

    //   <Menu.Item key="/overview" icon={<FileOutlined/>} >
    //     <Link to="/overview">Overview</Link>
    //   </Menu.Item>
    //   <Menu.SubMenu title="Grantor" key="1" icon={<UserOutlined/>}>
    //     <Menu.Item key="/grantor/overview">
    //       <Link to="/grantor/overview">Overview</Link>
    //     </Menu.Item>
    //     <Menu.Item key="/grantor/admin">
    //       <Link to="/grantor/admin">Admin</Link>
    //     </Menu.Item>
    //     <Menu.Item key="/grantor/approve">
    //       <Link to="/grantor/approve">Approve</Link>
    //     </Menu.Item>
    //   </Menu.SubMenu>
    //   <Menu.SubMenu title="Trustees"  key="2" icon={<TeamOutlined/>}>
    //     <Menu.Item key="/trustee/overview">
    //       <Link to="/trustee/overview">Overview</Link>
    //     </Menu.Item>
    //     <Menu.Item key="/trustee/administer">
    //       <Link to="/trustee/administer">Admin</Link>
    //     </Menu.Item>
    //   </Menu.SubMenu>
    //   <Menu.SubMenu title="Beneficiaries"  key="3" icon={<OrderedListOutlined/>}>
    //     <Menu.Item key="/beneficiary/overview">
    //       <Link to="/beneficiary/overview">Overview</Link>
    //     </Menu.Item>
    //     <Menu.Item key="/beneficiary/claim">
    //       <Link to="/beneficiary/claim">Admin</Link>
    //     </Menu.Item>
    //   </Menu.SubMenu>
    //   <Menu.Item key="/contracts">
    //     <Link to="/contracts">Debug Contracts</Link>
    //   </Menu.Item>

    // </Menu>   */}
  );
}
