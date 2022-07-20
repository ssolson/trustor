
import React from "react";
import {  
  Col, 
  Row,
} from "antd";
import { 
  Contract, 
  Ramp, 
  GasGauge,
  Faucet 
} from "../components";


export default function DebugContractsPage(props) {
  const faucetAvailable = props.localProvider && props.localProvider.connection && 
    props.targetNetwork.name.indexOf("local") !== -1;
  return (
    <div>
      <Contract
          name="SimpleT"
          signer={props.userSigner}
          provider={props.localProvider}
          address={props.address}
          blockExplorer={props.blockExplorer}
          contractConfig={props.contractConfig}
        />
      <div style={{ position: "fixed", textAlign: "left", left: 100, bottom: 20, padding: 10 }}>
        <Row align="middle" gutter={[3, 3]}>
          <Col span={12}>
            <Ramp price={props.price} address={props.address} networks={props.NETWORKS} />
          </Col>

          <Col span={12} style={{ textAlign: "center", opacity: 0.8 }}>
            <GasGauge gasPrice={props.gasPrice} />
          </Col>
        </Row>

        <Row align="middle" gutter={[4, 4]}>
          <Col span={24}>
            {
              faucetAvailable ? (
                <Faucet 
                  localProvider={props.localProvider} 
                  price={props.price} 
                  ensProvider={props.mainnetProvider} 
                />
              ) : ("")
            }
          </Col>
        </Row>
      </div>
    </div>
  )
}
