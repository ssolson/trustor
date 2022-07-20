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
  RobotOutlined,
  HomeOutlined,
  DiffOutlined,
  FormOutlined,
  OrderedListOutlined,
  CopyOutlined,
} from '@ant-design/icons';


const items = [
  {key:'1', icon:<FileOutlined />, label:'Overview',  link:"/" },
]

export default function SideBar() {
  return (
    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
      <Menu.Item key="/" icon={<HomeOutlined/>}>
        <Link to="/">Home</Link>
      </Menu.Item>
      
      <Menu.SubMenu title="Trust"  key="0" icon={<DiffOutlined/>}>
      <Menu.Item key="/trust/new" icon={<FormOutlined/>}>
          <Link to="/trust/new">New Trust</Link>
        </Menu.Item>
        <Menu.Item key="/trust" icon={<CopyOutlined/>}>
          <Link to="/trust">Your Trust</Link>
        </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item key="/overview" icon={<FileOutlined/>} >
        <Link to="/overview">Overview</Link>
      </Menu.Item>
      <Menu.SubMenu title="Grantor" key="1" icon={<UserOutlined/>}>
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
      <Menu.SubMenu title="Trustees"  key="2" icon={<TeamOutlined/>}>
        <Menu.Item key="/trustee/overview">
          <Link to="/trustee/overview">Overview</Link>
        </Menu.Item>
        <Menu.Item key="/trustee/administer">
          <Link to="/trustee/administer">Admin</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.SubMenu title="Beneficiaries"  key="3" icon={<OrderedListOutlined/>}>
        <Menu.Item key="/beneficiary/overview">
          <Link to="/beneficiary/overview">Overview</Link>
        </Menu.Item>
        <Menu.Item key="/beneficiary/claim">
          <Link to="/beneficiary/claim">Admin</Link>
        </Menu.Item>
      </Menu.SubMenu>
      <Menu.Item key="/contracts">
        <Link to="/contracts">Debug Contracts</Link>
      </Menu.Item>

    </Menu>  
  );
}
