const { use, expect } = require("chai");
const { ethers } = require("hardhat");
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");

const DEFAULT_ADMIN_ROLE =
  "0x0000000000000000000000000000000000000000000000000000000000000000";
const ROLE = ethers.utils.id("ROLE");
const OTHER_ROLE = ethers.utils.id("OTHER_ROLE");

const ROLE2 = ethers.utils.id("GRANTOR_ROLE");
const OTHER_ROLE2 = ethers.utils.id("INITIAL_TRUSTEE_ROLE");

// ERC 1155
const firstTokenId = 68;
const secondTokenId = 69;
const unknownTokenId = 70;

const firstAmount = 1000;
const secondAmount = 2000;
const RECEIVER_SINGLE_MAGIC_VALUE = "0xf23a6e61";
const RECEIVER_BATCH_MAGIC_VALUE = "0xbc197c81";
const ZERO_ADDRESS = ethers.constants.AddressZero;

describe("🚩 🏵 ERC 1155 🤖", async function () {
  async function deployFixture() {
    const [
      admin,
      Grantor2,
      SuccessorTrustee1,
      SuccessorTrustee2,
      Beneficiary1,
      Beneficiary2,
    ] = await ethers.getSigners();

    // const LoadedStaticRouter = await ethers.getContractFactory("Router");
    const LoadedStaticRouter = await ethers.getContractFactory(
      "ERC1155Exposed"
    );
    const router = await LoadedStaticRouter.connect(admin).deploy();
    await router.deployed();

    const routerAddress = router.address;

    const Name = "Trust Steve Living Trust";
    const InitialTrusteeAddress = admin.address;
    const CheckInPeriod = 2;
    const Grantors = [admin.address, Grantor2.address];
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

    const Initialize = await ethers.getContractFactory("Initialize");
    const initialize = await Initialize.attach(routerAddress);
    await initialize.initializeInitializableModule(...argz);

    return { routerAddress };
  }
  async function deployFixtureMint() {
    const { routerAddress } = await loadFixture(deployFixture);

    const ERC1155 = await ethers.getContractFactory("ERC1155");
    const erc1155 = await ERC1155.attach(routerAddress);

    const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
    const exERC1155 = await ExERC1155.attach(routerAddress);

    const [
      minter,
      firstTokenHolder,
      secondTokenHolder,
      multiTokenHolder,
      recipient,
      proxy,
    ] = await ethers.getSigners();

    await exERC1155.X_mint(
      multiTokenHolder.address,
      firstTokenId,
      firstAmount,
      "0x"
    );
    await exERC1155.X_mint(
      multiTokenHolder.address,
      secondTokenId,
      secondAmount,
      "0x"
    );

    return { routerAddress };
  }
  describe("like an ERC1155", function () {
    describe("balanceOf", function () {
      it("reverts when queried about the zero address", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        await expect(
          erc1155.balanceOf(ZERO_ADDRESS, firstTokenId)
        ).to.be.revertedWith("ERC1155: address zero is not a valid owner");
      });

      context("when accounts don't own tokens", function () {
        it("returns zero for given addresses", async function () {
          const { routerAddress } = await loadFixture(deployFixture);

          const ERC1155 = await ethers.getContractFactory("ERC1155");
          const erc1155 = await ERC1155.attach(routerAddress);

          const [
            minter,
            firstTokenHolder,
            secondTokenHolder,
            multiTokenHolder,
            recipient,
          ] = await ethers.getSigners();

          expect(
            await erc1155.balanceOf(firstTokenHolder.address, firstTokenId)
          ).to.equal(0);

          expect(
            await erc1155.balanceOf(secondTokenHolder.address, secondTokenId)
          ).to.equal(0);

          expect(
            await erc1155.balanceOf(firstTokenHolder.address, unknownTokenId)
          ).to.equal(0);
        });
      });

      context("when accounts own some tokens", function () {
        it("returns the amount of tokens owned by the given addresses", async function () {
          const { routerAddress } = await loadFixture(deployFixture);

          const ERC1155 = await ethers.getContractFactory("ERC1155");
          const erc1155 = await ERC1155.attach(routerAddress);
          const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
          const exERC1155 = await ExERC1155.attach(routerAddress);

          const [
            minter,
            firstTokenHolder,
            secondTokenHolder,
            multiTokenHolder,
            recipient,
          ] = await ethers.getSigners();

          await exERC1155.X_mint(
            firstTokenHolder.address,
            firstTokenId,
            firstAmount,
            "0x"
          );
          await exERC1155.X_mint(
            secondTokenHolder.address,
            secondTokenId,
            secondAmount,
            "0x"
          );

          expect(
            await erc1155.balanceOf(firstTokenHolder.address, firstTokenId)
          ).to.equal(firstAmount);

          expect(
            await erc1155.balanceOf(secondTokenHolder.address, secondTokenId)
          ).to.equal(secondAmount);

          expect(
            await erc1155.balanceOf(firstTokenHolder.address, unknownTokenId)
          ).to.equal(0);
        });
      });
    });

    describe("balanceOfBatch", function () {
      it("reverts when input arrays don't match up", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155.balanceOfBatch(
            [
              firstTokenHolder.address,
              secondTokenHolder.address,
              firstTokenHolder.address,
              secondTokenHolder.address,
            ],
            [firstTokenId, secondTokenId, unknownTokenId]
          )
        ).to.be.revertedWith("ERC1155: accounts and ids length mismatch");

        await expect(
          erc1155.balanceOfBatch(
            [firstTokenHolder.address, secondTokenHolder.address],
            [firstTokenId, secondTokenId, unknownTokenId]
          )
        ).to.be.revertedWith("ERC1155: accounts and ids length mismatch");
      });

      it("reverts when one of the addresses is the zero address", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155.balanceOfBatch(
            [firstTokenHolder.address, secondTokenHolder.address, ZERO_ADDRESS],
            [firstTokenId, secondTokenId, unknownTokenId]
          ),
          "ERC1155: address zero is not a valid owner"
        );
      });

      context("when accounts don't own tokens", function () {
        it("returns zeros for each account", async function () {
          const { routerAddress } = await loadFixture(deployFixture);

          const ERC1155 = await ethers.getContractFactory("ERC1155");
          const erc1155 = await ERC1155.attach(routerAddress);

          const [
            minter,
            firstTokenHolder,
            secondTokenHolder,
            multiTokenHolder,
            recipient,
          ] = await ethers.getSigners();

          const result = await erc1155.balanceOfBatch(
            [
              firstTokenHolder.address,
              secondTokenHolder.address,
              firstTokenHolder.address,
            ],
            [firstTokenId, secondTokenId, unknownTokenId]
          );
          expect(result).to.be.an("array");
          expect(result[0]).to.equal(0);
          expect(result[1]).to.equal(0);
          expect(result[2]).to.equal(0);
        });
      });

      context("when accounts own some tokens", function () {
        it("returns amounts owned by each account in order passed", async function () {
          const { routerAddress } = await loadFixture(deployFixture);

          const ERC1155 = await ethers.getContractFactory("ERC1155");
          const erc1155 = await ERC1155.attach(routerAddress);
          const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
          const exERC1155 = await ExERC1155.attach(routerAddress);

          const [
            minter,
            firstTokenHolder,
            secondTokenHolder,
            multiTokenHolder,
            recipient,
          ] = await ethers.getSigners();

          await exERC1155.X_mint(
            firstTokenHolder.address,
            firstTokenId,
            firstAmount,
            "0x"
          );
          await exERC1155.X_mint(
            secondTokenHolder.address,
            secondTokenId,
            secondAmount,
            "0x"
          );

          const result = await erc1155.balanceOfBatch(
            [
              secondTokenHolder.address,
              firstTokenHolder.address,
              firstTokenHolder.address,
            ],
            [secondTokenId, firstTokenId, unknownTokenId]
          );
          expect(result).to.be.an("array");
          expect(result[0]).to.equal(secondAmount);
          expect(result[1]).to.equal(firstAmount);
          expect(result[2]).to.equal(0);
        });

        it("returns multiple times the balance of the same address when asked", async function () {
          const { routerAddress } = await loadFixture(deployFixture);

          const ERC1155 = await ethers.getContractFactory("ERC1155");
          const erc1155 = await ERC1155.attach(routerAddress);
          const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
          const exERC1155 = await ExERC1155.attach(routerAddress);

          const [
            minter,
            firstTokenHolder,
            secondTokenHolder,
            multiTokenHolder,
            recipient,
          ] = await ethers.getSigners();

          await exERC1155.X_mint(
            firstTokenHolder.address,
            firstTokenId,
            firstAmount,
            "0x"
          );
          await exERC1155.X_mint(
            secondTokenHolder.address,
            secondTokenId,
            secondAmount,
            "0x"
          );

          const result = await erc1155.balanceOfBatch(
            [
              firstTokenHolder.address,
              secondTokenHolder.address,
              firstTokenHolder.address,
            ],
            [firstTokenId, secondTokenId, firstTokenId]
          );
          expect(result).to.be.an("array");
          expect(result[0]).to.equal(result[2]);
          expect(result[0]).to.equal(firstAmount);
          expect(result[1]).to.equal(secondAmount);
          expect(result[2]).to.equal(firstAmount);
        });
      });
    });

    describe("setApprovalForAll", function () {
      it("sets approval status which can be queried via isApprovedForAll", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);
        const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
        const exERC1155 = await ExERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
          proxy,
        ] = await ethers.getSigners();

        let receipt = await erc1155
          .connect(multiTokenHolder)
          .setApprovalForAll(proxy.address, true);

        expect(
          await erc1155.isApprovedForAll(
            multiTokenHolder.address,
            proxy.address
          )
        ).to.be.equal(true);
      });

      it("emits an ApprovalForAll log", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
          proxy,
        ] = await ethers.getSigners();

        let receipt = await erc1155
          .connect(multiTokenHolder)
          .setApprovalForAll(proxy.address, true);

        await expect(receipt)
          .to.emit(erc1155, "ApprovalForAll")
          .withArgs(multiTokenHolder.address, proxy.address, true);
      });

      it("can unset approval for an operator", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
          proxy,
        ] = await ethers.getSigners();

        let receipt = await erc1155
          .connect(multiTokenHolder)
          .setApprovalForAll(proxy.address, true);

        await erc1155
          .connect(multiTokenHolder)
          .setApprovalForAll(proxy.address, false);
        expect(
          await erc1155.isApprovedForAll(
            multiTokenHolder.address,
            proxy.address
          )
        ).to.be.false;
      });

      it("reverts if attempting to approve self as an operator", async function () {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
          proxy,
        ] = await ethers.getSigners();

        let receipt = await erc1155
          .connect(multiTokenHolder)
          .setApprovalForAll(proxy.address, true);

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .setApprovalForAll(multiTokenHolder.address, true)
        ).to.be.revertedWith("ERC1155: setting approval status for self");
      });
    });

    describe("safeTransferFrom", function () {
      async function deployFixture2() {
        const { routerAddress } = await loadFixture(deployFixture);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);
        const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
        const exERC1155 = await ExERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await exERC1155.X_mint(
          firstTokenHolder.address,
          firstTokenId,
          firstAmount,
          "0x"
        );
        await exERC1155.X_mint(
          secondTokenHolder.address,
          secondTokenId,
          secondAmount,
          "0x"
        );

        return { routerAddress };
      }

      it("reverts when transferring more than balance", async function () {
        const { routerAddress } = await loadFixture(deployFixture2);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .safeTransferFrom(
              multiTokenHolder.address,
              recipient.address,
              firstTokenId,
              firstAmount + 1,
              "0x"
            )
        ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
      });

      it("reverts when transferring to zero address", async function () {
        const { routerAddress } = await loadFixture(deployFixture2);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .safeTransferFrom(
              multiTokenHolder.address,
              ZERO_ADDRESS,
              firstTokenId,
              firstAmount,
              "0x"
            )
        ).to.be.revertedWith("ERC1155: transfer to the zero address");
      });

      async function deployFixture3() {
        const { routerAddress } = await loadFixture(deployFixtureMint);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
          proxy,
        ] = await ethers.getSigners();

        const from = multiTokenHolder.address;
        const toWhom = recipient.address;

        const transferLogs = await erc1155
          .connect(multiTokenHolder)
          .safeTransferFrom(
            multiTokenHolder.address,
            recipient.address,
            firstTokenId,
            firstAmount,
            "0x"
          );

        let newBalance = await erc1155.balanceOf(from, firstTokenId);
        expect(newBalance).to.equal(0);

        newBalance = await erc1155.balanceOf(toWhom, firstTokenId);
        expect(newBalance).to.equal(firstAmount);

        expect(transferLogs)
          .to.emit(erc1155, "TransferSingle")
          .withArgs(
            multiTokenHolder.address,
            from,
            toWhom,
            firstTokenId,
            firstAmount
          );

        return { routerAddress };
      }

      context("when called by the multiTokenHolder", async function () {
        it("preserves existing balances which are not transferred by multiTokenHolder", async function () {
          const { routerAddress } = await loadFixture(deployFixture3);

          const ERC1155 = await ethers.getContractFactory("ERC1155");
          const erc1155 = await ERC1155.attach(routerAddress);

          const [
            minter,
            firstTokenHolder,
            secondTokenHolder,
            multiTokenHolder,
            recipient,
          ] = await ethers.getSigners();

          const balance1 = await erc1155.balanceOf(
            multiTokenHolder.address,
            secondTokenId
          );
          expect(balance1).to.equal(secondAmount);

          const balance2 = await erc1155.balanceOf(
            recipient.address,
            secondTokenId
          );
          expect(balance2).to.equal(0);
        });
      });

      context(
        "when called by an operator on behalf of the multiTokenHolder",
        function () {
          context(
            "when operator is not approved by multiTokenHolder",
            function () {
              async function deployFixture4() {
                const { routerAddress } = await loadFixture(deployFixture3);

                const ERC1155 = await ethers.getContractFactory("ERC1155");
                const erc1155 = await ERC1155.attach(routerAddress);

                const [
                  minter,
                  firstTokenHolder,
                  secondTokenHolder,
                  multiTokenHolder,
                  recipient,
                  proxy,
                ] = await ethers.getSigners();

                await erc1155
                  .connect(multiTokenHolder)
                  .setApprovalForAll(proxy.address, false);

                return { routerAddress };
              }

              it("reverts", async function () {
                const { routerAddress } = await loadFixture(deployFixture4);

                const ERC1155 = await ethers.getContractFactory("ERC1155");
                const erc1155 = await ERC1155.attach(routerAddress);

                const [
                  minter,
                  firstTokenHolder,
                  secondTokenHolder,
                  multiTokenHolder,
                  recipient,
                  proxy,
                ] = await ethers.getSigners();

                await expect(
                  erc1155
                    .connect(proxy)
                    .safeTransferFrom(
                      multiTokenHolder.address,
                      recipient.address,
                      firstTokenId,
                      firstAmount,
                      "0x"
                    )
                ).to.be.revertedWith(
                  "ERC1155: caller is not token owner or approved"
                );
              });
            }
          );

          context("when operator is approved by multiTokenHolder", function () {
            async function deployFixture5() {
              const { routerAddress } = await loadFixture(deployFixture3);

              const ERC1155 = await ethers.getContractFactory("ERC1155");
              const erc1155 = await ERC1155.attach(routerAddress);

              const [
                minter,
                firstTokenHolder,
                secondTokenHolder,
                multiTokenHolder,
                recipient,
                proxy,
              ] = await ethers.getSigners();

              await erc1155
                .connect(multiTokenHolder)
                .setApprovalForAll(proxy.address, true);

              return { routerAddress };
            }

            it("preserves operator's balances not involved in the transfer", async function () {
              const { routerAddress } = await loadFixture(deployFixture5);

              const ERC1155 = await ethers.getContractFactory("ERC1155");
              const erc1155 = await ERC1155.attach(routerAddress);

              const [
                minter,
                firstTokenHolder,
                secondTokenHolder,
                multiTokenHolder,
                recipient,
                proxy,
              ] = await ethers.getSigners();

              const balance1 = await erc1155.balanceOf(
                proxy.address,
                firstTokenId
              );
              expect(balance1).to.equal("0");

              const balance2 = await erc1155.balanceOf(
                proxy.address,
                secondTokenId
              );
              expect(balance2).to.equal("0");
            });
          });
        }
      );

      context("when sending to a valid receiver", function () {
        context("without data", function () {
          it("does not revert", async function () {
            const { routerAddress } = await loadFixture(deployFixtureMint);

            const ERC1155 = await ethers.getContractFactory("ERC1155");
            const erc1155 = await ERC1155.attach(routerAddress);

            const [
              minter,
              firstTokenHolder,
              secondTokenHolder,
              multiTokenHolder,
              recipient,
              proxy,
            ] = await ethers.getSigners();

            await expect(
              await erc1155
                .connect(multiTokenHolder)
                .safeTransferFrom(
                  multiTokenHolder.address,
                  routerAddress,
                  firstTokenId,
                  firstAmount,
                  "0x"
                )
            ).to.be.ok;
          });
        });

        context("with data", function () {
          it("does not revert", async function () {
            const data = "0xf00dd00d";

            const { routerAddress } = await loadFixture(deployFixtureMint);

            const ERC1155 = await ethers.getContractFactory("ERC1155");
            const erc1155 = await ERC1155.attach(routerAddress);

            const [
              minter,
              firstTokenHolder,
              secondTokenHolder,
              multiTokenHolder,
              recipient,
              proxy,
            ] = await ethers.getSigners();

            await expect(
              await erc1155
                .connect(multiTokenHolder)
                .safeTransferFrom(
                  multiTokenHolder.address,
                  routerAddress,
                  firstTokenId,
                  firstAmount,
                  data
                )
            ).to.be.ok;
          });
        });
      });
    });

    describe("safeBatchTransferFrom", function () {
      it("reverts when transferring amount more than any of balances", async function () {
        const { routerAddress } = await loadFixture(deployFixtureMint);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);
        const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
        const exERC1155 = await ExERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .safeBatchTransferFrom(
              multiTokenHolder.address,
              recipient.address,
              [firstTokenId, secondTokenId],
              [firstAmount, secondAmount + 1],
              "0x"
            )
        ).to.be.revertedWith("ERC1155: insufficient balance for transfer");
      });

      it("reverts when ids array length doesn't match amounts array length", async function () {
        const { routerAddress } = await loadFixture(deployFixtureMint);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);
        const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
        const exERC1155 = await ExERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .safeBatchTransferFrom(
              multiTokenHolder.address,
              recipient.address,
              [firstTokenId],
              [firstAmount, secondAmount],
              "0x"
            )
        ).to.be.revertedWith("ERC1155: ids and amounts length mismatch");

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .safeBatchTransferFrom(
              multiTokenHolder.address,
              recipient.address,
              [firstTokenId, secondTokenId],
              [firstAmount],
              "0x"
            )
        ).to.be.revertedWith("ERC1155: ids and amounts length mismatch");
      });

      it("reverts when transferring to zero address", async function () {
        const { routerAddress } = await loadFixture(deployFixtureMint);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);
        const ExERC1155 = await ethers.getContractFactory("ERC1155Exposed");
        const exERC1155 = await ExERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
        ] = await ethers.getSigners();

        await expect(
          erc1155
            .connect(multiTokenHolder)
            .safeBatchTransferFrom(
              multiTokenHolder.address,
              ZERO_ADDRESS,
              [firstTokenId, secondTokenId],
              [firstAmount, secondAmount],
              "0x"
            )
        ).to.be.revertedWith("ERC1155: transfer to the zero address");
      });

      it("when called by the multiTokenHolder", async function () {
        const { routerAddress } = await loadFixture(deployFixtureMint);

        const ERC1155 = await ethers.getContractFactory("ERC1155");
        const erc1155 = await ERC1155.attach(routerAddress);

        const [
          minter,
          firstTokenHolder,
          secondTokenHolder,
          multiTokenHolder,
          recipient,
          proxy,
        ] = await ethers.getSigners();

        const from = multiTokenHolder.address;
        const toWhom = recipient.address;

        const ids = [firstTokenId, secondTokenId];
        const values = [firstAmount, secondAmount];
        const transferLogs = await erc1155
          .connect(multiTokenHolder)
          .safeBatchTransferFrom(
            multiTokenHolder.address,
            recipient.address,
            ids,
            values,
            "0x"
          );

        let newBalances = await erc1155.balanceOfBatch(
          new Array(ids.length).fill(from),
          ids
        );
        for (const newBalance of newBalances) {
          expect(newBalance).to.equal(0);
        }

        newBalances = await erc1155.balanceOfBatch(
          new Array(ids.length).fill(toWhom),
          ids
        );
        for (let i = 0; i < newBalances.length; i++) {
          expect(newBalances[i]).to.equal(values[i]);
        }

        expect(transferLogs).to.emit(erc1155, "TransferBatch").withArgs(
          multiTokenHolder.address,
          from,
          toWhom
          // ids,
          // values,
        );

        return { routerAddress };
      });

      context(
        "when called by an operator on behalf of the multiTokenHolder",
        function () {
          context(
            "when operator is not approved by multiTokenHolder",
            function () {
              it("reverts", async function () {
                const { routerAddress } = await loadFixture(deployFixtureMint);

                const ERC1155 = await ethers.getContractFactory("ERC1155");
                const erc1155 = await ERC1155.attach(routerAddress);

                const [
                  minter,
                  firstTokenHolder,
                  secondTokenHolder,
                  multiTokenHolder,
                  recipient,
                  proxy,
                ] = await ethers.getSigners();

                await erc1155
                  .connect(multiTokenHolder)
                  .setApprovalForAll(proxy.address, false);

                expect(
                  erc1155
                    .connect(proxy)
                    .safeBatchTransferFrom(
                      multiTokenHolder.address,
                      recipient.address,
                      [firstTokenId, secondTokenId],
                      [firstAmount, secondAmount],
                      "0x"
                    )
                ).to.be.revertedWith(
                  "ERC1155: caller is not token owner or approved"
                );
              });
            }
          );

          context("when operator is approved by multiTokenHolder", function () {
            it("Does not revert", async function () {
              const { routerAddress } = await loadFixture(deployFixtureMint);

              const ERC1155 = await ethers.getContractFactory("ERC1155");
              const erc1155 = await ERC1155.attach(routerAddress);

              const [
                minter,
                firstTokenHolder,
                secondTokenHolder,
                multiTokenHolder,
                recipient,
                proxy,
              ] = await ethers.getSigners();

              await erc1155
                .connect(multiTokenHolder)
                .setApprovalForAll(proxy.address, true);

              expect(
                erc1155
                  .connect(proxy)
                  .safeBatchTransferFrom(
                    multiTokenHolder.address,
                    recipient.address,
                    [firstTokenId, secondTokenId],
                    [firstAmount, secondAmount],
                    "0x"
                  )
              )
                .to.emit(erc1155, "TransferBatch")
                .withArgs(
                  proxy.address,
                  multiTokenHolder.address,
                  [firstTokenId, secondTokenId],
                  [firstAmount, secondAmount]
                );
            });

            it("preserves operator's balances not involved in the transfer", async function () {
              const { routerAddress } = await loadFixture(deployFixtureMint);

              const ERC1155 = await ethers.getContractFactory("ERC1155");
              const erc1155 = await ERC1155.attach(routerAddress);

              const [
                minter,
                firstTokenHolder,
                secondTokenHolder,
                multiTokenHolder,
                recipient,
                proxy,
              ] = await ethers.getSigners();

              await erc1155
                .connect(multiTokenHolder)
                .setApprovalForAll(proxy.address, true);

              erc1155
                .connect(proxy)
                .safeBatchTransferFrom(
                  multiTokenHolder.address,
                  recipient.address,
                  [firstTokenId, secondTokenId],
                  [firstAmount, secondAmount],
                  "0x"
                );

              const balance1 = await erc1155.balanceOf(
                proxy.address,
                firstTokenId
              );
              expect(balance1).to.equal(0);
              const balance2 = await erc1155.balanceOf(
                proxy.address,
                secondTokenId
              );
              expect(balance2).to.equal(0);
            });
          });
        }
      );

      context("when sending to a valid receiver", function () {
        context("without data", function () {
          it("Does not revert", async function () {
            const { routerAddress } = await loadFixture(deployFixtureMint);

            const ERC1155 = await ethers.getContractFactory("ERC1155");
            const erc1155 = await ERC1155.attach(routerAddress);

            const [
              minter,
              firstTokenHolder,
              secondTokenHolder,
              multiTokenHolder,
              recipient,
              proxy,
            ] = await ethers.getSigners();

            await expect(
              erc1155
                .connect(multiTokenHolder)
                .safeBatchTransferFrom(
                  multiTokenHolder.address,
                  routerAddress,
                  [firstTokenId, secondTokenId],
                  [firstAmount, secondAmount],
                  "0x"
                )
            ).not.to.be.reverted;
          });
        });

        context("with data", function () {
          it("Does not revert", async function () {
            const data = "0xf00dd00d";
            const { routerAddress } = await loadFixture(deployFixtureMint);

            const ERC1155 = await ethers.getContractFactory("ERC1155");
            const erc1155 = await ERC1155.attach(routerAddress);

            const [
              minter,
              firstTokenHolder,
              secondTokenHolder,
              multiTokenHolder,
              recipient,
              proxy,
            ] = await ethers.getSigners();

            await expect(
              erc1155
                .connect(multiTokenHolder)
                .safeBatchTransferFrom(
                  multiTokenHolder.address,
                  routerAddress,
                  [firstTokenId, secondTokenId],
                  [firstAmount, secondAmount],
                  data
                )
            ).not.to.be.reverted;
          });
        });
      });
    });

    //   shouldSupportInterfaces(['ERC165', 'ERC1155']);
  });
});
