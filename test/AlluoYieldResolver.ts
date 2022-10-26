import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { before } from "mocha";
import { AlluoYieldResolver, IERC20MetadataUpgradeable } from "../typechain";

describe("Alluo Yield Resolver Tests", function() {
    let signers: SignerWithAddress[];
    let crv: IERC20MetadataUpgradeable; 
    let cvx: IERC20MetadataUpgradeable;
    let weth: IERC20MetadataUpgradeable;
    let cvxEth : IERC20MetadataUpgradeable;
    let rewardToken :IERC20MetadataUpgradeable;
    let alluoYieldResolver: AlluoYieldResolver;

    before(async () => {
        
        await network.provider.request({
            method: "hardhat_reset",
            params: [{
                forking: {
                    enabled: true,
                    jsonRpcUrl: process.env.MAINNET_FORKING_URL as string,
                    //you can fork from last block by commenting next line
                    //blockNumber: 15825177,
                },
            },],
        });
        
        signers = await ethers.getSigners();
        crv = await ethers.getContractAt("IERC20MetadataUpgradeable", "0xD533a949740bb3306d119CC777fa900bA034cd52");
        cvx = await ethers.getContractAt("IERC20MetadataUpgradeable", "0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B");
        weth = await ethers.getContractAt("IERC20MetadataUpgradeable", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2")
        cvxEth =  await ethers.getContractAt("IERC20MetadataUpgradeable", "0x3A283D9c08E8b55966afb64C515f5143cf907611");
        rewardToken = await ethers.getContractAt("IERC20MetadataUpgradeable", "0x3A283D9c08E8b55966afb64C515f5143cf907611");
    });

    beforeEach(async () => {
    // farmFunds have an access control  -> onlyRole(DEFAULT_ADMIN_ROLE)
    // gelato resolver needs to use admin address - > gnosis
    // to grant role to contract

        let gnosis = "0x1F020A4943EB57cd3b2213A66b355CB662Ea43C3";

        let maxGas = 15 * 10**9;
        let stakeTime = 86400;
        let farmTime = 86400 * 7;
        const alluoVault = ["0x2D182Fc86Cd4C38D9FE94566251A6aF1A85F784b", "0x7417e7d4369090FC49C43789116efC34c52b2D98", "0xcB9e36cD1A0eD9c98Db76d1619e649A7a032F271"];
        const alluoPool = ["0x470e486acA0e215C925ddcc3A9D446735AabB714"];

        let AlluoYieldResolverFactory = await ethers.getContractFactory("AlluoYieldResolver");
        alluoYieldResolver = await AlluoYieldResolverFactory.deploy(
            maxGas,
            stakeTime,
            farmTime,
            alluoVault,
            alluoPool,
            signers[0].address
        );
    });

    describe("Deployment tests", function() {
    // ToDo: Remove these tests, created with the purpose of exploring contract
        it("Return Hello World", async function() {
            expect(await alluoYieldResolver.getHelloWorld()).equal("Hello World");
        })

        it("Should update Stake time", async function () {
            expect(await alluoYieldResolver.stakeTime()).equal(86400);
            await alluoYieldResolver.setStakeTime(10);
            expect(await alluoYieldResolver.stakeTime()).equal(10);
        })
    })

    describe("Daily Staking tests", function() {
        
        it("Verify conditions and pass", async function() {
            const tx1 = await alluoYieldResolver.stakingChecker()
            console.log(tx1);
        })

        it("Verify conditions and fail", async function() {
        })

        it("stakeFunds ... timestamp", async function() {
        })

        it("stakeFunds ... balance", async function() {
        })
    })

    describe("Weekly Farming tests", function() {
        
        it("Verify conditions and pass", async function() {
        })

        it("Verify conditions and fail", async function() {
        })

        it("farmFunds ... timestamp", async function() {
        })
    })
})
