// import { Header } from "antd";
import {  Link } from "react-router-dom";
import { Menu, Layout } from "antd";
import React from "react";
const { Header } = Layout;
// displays a page header

export default function LocalHeader() {
  return (
    <Header style={{ position: 'fixed', zIndex: 1, width: '100%', }}>
    <Menu theme="dark" mode="horizontal">
      <Menu.Item key="/">
        <Link to="/">Home</Link>
      </Menu.Item>
      <Menu.Item key="/simple-trust">
        <Link to="/simple-trust">Your Trust</Link>
      </Menu.Item>
      <Menu.Item key="/contracts">
        <Link to="contracts">Debug Contracts</Link>
      </Menu.Item>
    </Menu>
  </Header>
  );
}
