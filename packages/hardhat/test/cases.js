async function deployFixture() {
  const [
    InitialTrustee,
    Grantor2,
    SuccessorTrustee1,
    SuccessorTrustee2,
    Beneficiary1,
    Beneficiary2,
  ] = await ethers.getSigners();

  const Name = "Trust Steve Living Trust";
  const InitialTrusteeAddress = InitialTrustee.address;
  const CheckInPeriod = 2;
  const Grantors = [InitialTrustee.address, Grantor2.address];
  const Distribution = "perStirpes";
  const SuccessorTrustees = [
    SuccessorTrustee1.address,
    SuccessorTrustee2.address,
  ];
  const SuccessorTrusteePositions = [1, 2];
  const SuccessorTrusteePeriod = 2;
  const Beneficiary = [Beneficiary1.address, Beneficiary2.address];
  const Shares = [75, 25];

  let argz = [
    Name,
    InitialTrusteeAddress,
    CheckInPeriod,
    Grantors,
    Distribution,
    SuccessorTrustees,
    SuccessorTrusteePositions,
    SuccessorTrusteePeriod,
    Beneficiary,
    Shares,
  ];

  const SimpleT = await ethers.getContractFactory("SimpleT");
  const simpleT = await SimpleT.deploy(...argz);

  const wallets = {
    InitialTrustee: InitialTrustee,
    Grantor2: Grantor2,
    SuccessorTrustee1: SuccessorTrustee1,
    SuccessorTrustee2: SuccessorTrustee2,
    Beneficiary1: Beneficiary1,
    Beneficiary2: Beneficiary2,
  };

  return { wallets, simpleT };
}

export default deployFixture;
