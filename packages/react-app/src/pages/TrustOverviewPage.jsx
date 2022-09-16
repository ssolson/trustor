import { GrantorTable, TrusteeTable, BeneficiaryTable } from "../components";

export default function TrustOverviewPage({ readContracts }) {
  return (
    <div>
      <div style={{ padding: 25, marginTop: 50, width: 400, margin: "auto" }} />
      <h1> GRANTORS </h1>
      <GrantorTable readContracts={readContracts} />
      <h1> TRUSTEES </h1>
      <TrusteeTable readContracts={readContracts} />
      <h1> BENEFICIARIES </h1>
      <BeneficiaryTable readContracts={readContracts} />
    </div>
  );
}
