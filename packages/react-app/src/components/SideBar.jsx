import { Link } from "react-router-dom";
import { Menu, Layout } from "antd";
import React from "react";
import { 
  LaptopOutlined, 
  NotificationOutlined, 
  UserOutlined,
  DesktopOutlined,
  FileOutlined,
  PieChartOutlined,
  TeamOutlined,
  FieldTimeOutlined,
  RobotFilled,
  RobotOutlined
} from '@ant-design/icons';


// function getItem(label, key, icon, children) {
//   return {
//     key,
//     icon,
//     children,
//     label,

//   };
// }

// const items = [
//   getItem('Overview', '1', <FileOutlined />),
//   getItem('Check-In', '2', <FieldTimeOutlined />),
//   getItem('Grantor', 'sub1', <UserOutlined />, [
//     getItem('Admin', '3'),
//     getItem('Approve Funds', '4'),
//   ]),
//   getItem('Trustees', 'sub2', <TeamOutlined />, [
//     getItem('Overview', '5'), 
//     getItem('Administer', '6')
//   ]),
//   getItem('Beneficiaries', 'sub3', <PieChartOutlined />, [
//     getItem('Overview', '7'), 
//     getItem('Claim', '8')
//   ]),
// ];


const items = [
  {key:'1', icon:<FileOutlined />, label:'Overview',  link:"/" },
]

export default function SideBar() {
  return (
    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
      <Menu.Item key="/" icon={<FileOutlined/>} >
        <Link to="/overview">Overview</Link>
      </Menu.Item>
      <Menu.SubMenu title="Grantor" icon={<UserOutlined/>}>
        <Menu.Item key="/grantor/overview">
          <Link to="/grantor/overview">Overview</Link>
        </Menu.Item>
        <Menu.Item key="/grantor/admin">
          <Link to="/grantor/admin">Admin</Link>
        </Menu.Item>
        <Menu.Item key="/grantor/approve">
          <Link to="/grantor/approve">Approve</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu title="Trustees" icon={<TeamOutlined/>}>
        <Menu.Item key="/trustee/overview">
          <Link to="/trustee/overview">Overview</Link>
        </Menu.Item>
        <Menu.Item key="/trustee/administer">
          <Link to="/trustee/administer">Admin</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu title="Beneficiaries" icon={<RobotFilled/>}>
        <Menu.Item key="/beneficiary/overview">
          <Link to="/beneficiary/overview">Overview</Link>
        </Menu.Item>
        <Menu.Item key="/beneficiary/claim">
          <Link to="/beneficiary/claim">Admin</Link>
        </Menu.Item>
      </Menu.SubMenu>

    </Menu>  
  );
}
