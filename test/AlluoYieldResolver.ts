import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseEther } from "ethers/lib/utils";
import { ethers, network } from "hardhat";
import { before } from "mocha";
import { AlluoYieldResolver } from "../typechain";

describe("Alluo Yield Resolver Tests", function () {
  let gnosis: SignerWithAddress;
  let signers: SignerWithAddress[];
  let resolver: AlluoYieldResolver;

  async function getImpersonatedSigner(
    address: string
  ): Promise<SignerWithAddress> {
    await ethers.provider.send("hardhat_impersonateAccount", [address]);

    return await ethers.getSigner(address);
  }

  before(async () => {
    await network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            enabled: true,
            jsonRpcUrl: process.env.MAINNET_FORKING_URL as string,
            //you can fork from last block by commenting next line
            blockNumber: 15825177,
          },
        },
      ],
    });

    signers = await ethers.getSigners();
  });

  beforeEach(async () => {
    let gnosis = await getImpersonatedSigner(
      "0x1F020A4943EB57cd3b2213A66b355CB662Ea43C3"
    );
    await signers[0].sendTransaction({
      to: gnosis.address,
      value: parseEther("100"),
    });

    let maxGas = 15 * 10 ** 9;
    let stakeTime = 86400;
    let farmTime = 86400 * 7;
    const alluoVault = [
      "0x2D182Fc86Cd4C38D9FE94566251A6aF1A85F784b",
      "0x7417e7d4369090FC49C43789116efC34c52b2D98",
      "0xcB9e36cD1A0eD9c98Db76d1619e649A7a032F271",
    ];
    const alluoPool = ["0x470e486acA0e215C925ddcc3A9D446735AabB714"];

    let AlluoYieldResolverFactory = await ethers.getContractFactory(
      "AlluoYieldResolver"
    );
    resolver = await AlluoYieldResolverFactory.deploy(
      maxGas,
      stakeTime,
      farmTime,
      alluoVault,
      alluoPool,
      gnosis.address
    );
  });

  describe("Daily Staking tests", function () {
    it("Verify conditions and pass", async function () {
      // const tx1 = await resolver.stakingChecker();
      // console.log(tx1);
    });

    it("Verify conditions and fail", async function () {});

    it("stakeFunds ... timestamp", async function () {});

    it("stakeFunds ... balance", async function () {});
  });

  describe("Weekly Farming tests", function () {
    it("Verify conditions and pass", async function () {
      const farmingChecker1 = await resolver.farmingChecker();
      expect(farmingChecker1.canExec).equal(true);
    });

    it("Verify conditions and fail", async function () {});

    it("farmFunds ... timestamp", async function () {
      let gnosis = await getImpersonatedSigner(
        "0x1F020A4943EB57cd3b2213A66b355CB662Ea43C3"
      );

      const pool = await ethers.getContractAt(
        "AlluoVaultPool",
        "0x470e486acA0e215C925ddcc3A9D446735AabB714"
      );
      const txGrantRole = await pool
        .connect(gnosis)
        .grantRole(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          resolver.address
        );
      console.log("txGrantRole= ", txGrantRole);

      const tx1farmingChecker = await resolver.farmingChecker();
      expect(tx1farmingChecker.canExec).equal(true);

      const txFarm = await resolver.connect(gnosis).farmFunds(0);
      console.log(txFarm);
    });
  });
});
