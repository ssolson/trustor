import { Button, Card } from "antd";

import { GrantorTable } from "../components";

export default function GrantorApprovePage(props) {
  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />
      <h1> GRANTORS </h1>
      <GrantorTable readContracts={props.readContracts} />
      <Card title="Release Right, Title, and Interest">
        <div className="site-input-group-wrapper">
          <Button
            type={"primary"}
            onClick={async () => {
              const result = props.tx(props.writeContracts.SimpleT.assignAssetsToTrust());
            }}
            // disabled={!tokenSellAmount.valid} IsGrantor && Active=False
          >
            Assign Assets To Trust
          </Button>
        </div>
      </Card>
    </div>
  );
}

// export default FavoritesPage;
