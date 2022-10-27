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

  async function skipDays(d: number) {
    ethers.provider.send("evm_increaseTime", [d * 86400]);
    ethers.provider.send("evm_mine", []);
  }

  async function grantRoleToPool() {
    const pool = await ethers.getContractAt(
      "AlluoVaultPool",
      "0x470e486acA0e215C925ddcc3A9D446735AabB714"
    );

    await pool
      .connect(gnosis)
      .grantRole(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        resolver.address
      );

    console.log(
      "AlluoVaultPool assigned DEFAULT_ADMIN_ROLE to Resolver address"
    );
  }

  async function getTxFromExecPayload(txCheckerPayload: string) {
    const data = txCheckerPayload;
    const tx = {
      from: signers[0].address,
      to: resolver.address,
      data: data,
    };
    return tx;
  }

  before(async () => {
    signers = await ethers.getSigners();
    
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
  });

  beforeEach(async () => {
    gnosis = await getImpersonatedSigner(
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

    await resolver
      .connect(gnosis)
      .grantRole(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        signers[0].address
      );
  });

  describe("Daily Staking tests", function () {
    it("Verify conditions and pass", async function () {});

    it("Verify conditions and fail", async function () {});

    it("stakeFunds ... timestamp", async function () {});

    it("stakeFunds ... balance", async function () {});
  });

  describe("Weekly Farming tests", function () {
    it("Verify Checker conditions and return true", async function () {
      // grant DEFAULT_ADMIN_ROLE of vaultPool to Resolver contract
      await grantRoleToPool();

      // verify Checker conditions returns true
      const tx1checker = await resolver.farmingChecker();
      expect(tx1checker.canExec).equal(true);

      // stake rewards
      const data = tx1checker.execPayload;
      const tx = await getTxFromExecPayload(data);
      await signers[0].sendTransaction(tx);
    });

    it("Verify Checker conditions and fail on gas", async function () {
      // verify Checker conditions returns true
      const tx1checker = await resolver.farmingChecker();
      expect(tx1checker.canExec).equal(true);

      // set maxGas bellow chainlinkFastGas
      await resolver.connect(gnosis).setMaxGas(1);

      // verify Checker conditions returns false
      const tx2checker = await resolver.farmingChecker();
      expect(tx2checker.canExec).equal(false);
    });

    it("Farm funds and verify that checker conditions will fail by 7 days", async function () {
      // grant DEFAULT_ADMIN_ROLE of vaultPool to Resolver contract
      await grantRoleToPool();

      // verify Checker conditions returns true
      const tx1checker = await resolver.farmingChecker();
      expect(tx1checker.canExec).equal(true);

      // stake rewards
      const data = tx1checker.execPayload;
      const tx = await getTxFromExecPayload(data);
      await signers[0].sendTransaction(tx);

      // wait 6 days verify that checker conditions returns false
      await skipDays(6);
      const tx2checker = await resolver.farmingChecker();
      expect(tx2checker.canExec).equal(false);

      // wait 7 days and verify again that Checker conditions returns true
      await skipDays(7);
      const tx3checker = await resolver.farmingChecker();
      expect(tx3checker.canExec).equal(true);
    });
  });
});
