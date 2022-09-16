import { GrantorTable } from "../components";

export default function GrantorOverviewPage({ readContracts }) {
  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />
      <h1> GRANTORS </h1>
      <GrantorTable readContracts={readContracts} />
    </div>
  );
}

// export default FavoritesPage;
