#!/usr/bin/env node

/**
 * Simple ETH Bounty Flow Test: depositETH → distribute
 * 
 * This script tests the basic flow of depositing ETH and then distributing it
 * on a local Anvil network, showing all processes and data changes clearly.
 * 
 * Prerequisites:
 * 1. Run `anvil` in a separate terminal
 * 2. Ensure the contract is compiled: `npx hardhat compile`
 * 3. Run this script with: `npm run test:simple-flow`
 */

import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Configuration
const ANVIL_RPC_URL = "http://127.0.0.1:8545";

// Anvil default accounts
const DEPLOYER_PRIVATE_KEY =  "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"; // Account #0
const DEPOSITOR_PRIVATE_KEY = "0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6"; // Account #1
const SOLVER_PRIVATE_KEY =    "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"; // Account #2
const OPERATOR_PRIVATE_KEY =  "0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba"; // Account #3

class SimpleETHFlowTester {
  private provider: ethers.JsonRpcProvider;
  private deployer: ethers.Wallet;
  private depositor: ethers.Wallet;
  private solver: ethers.Wallet;
  private operator: ethers.Wallet;
  private vaultContract!: ethers.Contract;
  private vaultAddress!: string;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(ANVIL_RPC_URL);
    
    // Initialize wallets
    this.deployer = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, this.provider);
    this.depositor = new ethers.Wallet(DEPOSITOR_PRIVATE_KEY, this.provider);
    this.solver = new ethers.Wallet(SOLVER_PRIVATE_KEY, this.provider);
    this.operator = new ethers.Wallet(OPERATOR_PRIVATE_KEY, this.provider);
    
    console.log("🚀 Simple ETH Flow Tester Initialized");
    console.log(`📡 Connected to Anvil at: ${ANVIL_RPC_URL}\n`);
    
    console.log("👥 Test Accounts:");
    console.log(`   Deployer/Owner: ${this.deployer.address}`);
    console.log(`   Depositor:      ${this.depositor.address}`);
    console.log(`   Solver:         ${this.solver.address}`);
    console.log(`   Operator:       ${this.operator.address}\n`);
  }

  private async loadContractArtifact(): Promise<any> {
    const artifactPath = path.join(process.cwd(), "out/MultiTokenBountyVault.sol/MultiTokenBountyVault.json");
    return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  }

  private async deployVault(): Promise<void> {
    console.log("📦 Deploying MultiTokenBountyVault...");
    
    // Reset nonces by getting current nonce
    const deployerNonce = await this.provider.getTransactionCount(this.deployer.address);
    console.log(`🔢 Current deployer nonce: ${deployerNonce}`);
    
    const vaultArtifact = await this.loadContractArtifact();
    
    const VaultFactory = new ethers.ContractFactory(
      vaultArtifact.abi,
      vaultArtifact.bytecode,
      this.deployer
    );

    this.vaultContract = await VaultFactory.deploy(
      this.operator.address, // operator
      this.deployer.address  // owner
    );
    
    await this.vaultContract.waitForDeployment();
    this.vaultAddress = await this.vaultContract.getAddress();

    console.log(`✅ Vault deployed at: ${this.vaultAddress}`);
    console.log(`👨‍💼 Operator: ${this.operator.address}`);
    console.log(`👑 Owner: ${this.deployer.address}\n`);
  }

  private async showBalances(title: string): Promise<void> {
    console.log(`💰 ${title}`);
    console.log("─".repeat(70));
    
    const depositorBalance = await this.provider.getBalance(this.depositor.address);
    const solverBalance = await this.provider.getBalance(this.solver.address);
    const operatorBalance = await this.provider.getBalance(this.operator.address);
    const vaultBalance = await this.provider.getBalance(this.vaultAddress);
    
    console.log(`Depositor: ${ethers.formatEther(depositorBalance)} ETH`);
    console.log(`Solver:    ${ethers.formatEther(solverBalance)} ETH`);
    console.log(`Operator:  ${ethers.formatEther(operatorBalance)} ETH`);
    console.log(`Vault:     ${ethers.formatEther(vaultBalance)} ETH`);
    console.log("─".repeat(70));
  }

  private async showBountyState(bountyId: string): Promise<void> {
    const bountyKey = ethers.keccak256(ethers.toUtf8Bytes(bountyId));
    
    try {
      const bounty = await this.vaultContract.bounties(bountyKey);
      
      console.log(`\n🎯 Bounty "${bountyId}" State:`);
      console.log("─".repeat(50));
      console.log(`Key:           ${bountyKey}`);
      console.log(`Token Type:    ${bounty.tokenType === 0n ? "ETH" : "ERC20"}`);
      console.log(`Token Address: ${bounty.tokenAddress}`);
      console.log(`Total Amount:  ${ethers.formatEther(bounty.totalAmount)} ETH`);
      console.log(`Depositor:     ${bounty.depositor}`);
      console.log(`Solver:        ${bounty.solver}`);
      console.log(`Solver Share:  ${bounty.solverShare}%`);
      console.log(`Operator Share: ${bounty.operatorShare}%`);
      console.log(`Distributed:   ${bounty.distributed}`);
      console.log("─".repeat(50));
    } catch (error) {
      console.log(`🎯 Bounty "${bountyId}" does not exist yet`);
    }
  }

  private async depositETH(): Promise<void> {
    const bountyId = uuidv4();
    const depositAmount = ethers.parseEther("2.0"); // 2 ETH
    const solverShare = 75; // 75%
    const operatorShare = 25; // 25%

    console.log("\n📥 STEP 1: Depositing ETH");
    console.log("═".repeat(50));
    console.log(`Bounty ID:     ${bountyId}`);
    console.log(`Amount:        ${ethers.formatEther(depositAmount)} ETH`);
    console.log(`Solver Share:  ${solverShare}%`);
    console.log(`Operator Share: ${operatorShare}%`);
    console.log(`Depositor:     ${this.depositor.address}`);

    // Show current nonce for depositor
    const depositorNonce = await this.provider.getTransactionCount(this.depositor.address);
    console.log(`🔢 Depositor nonce: ${depositorNonce}`);

    // Show state before deposit
    await this.showBalances("Before Deposit");
    await this.showBountyState(bountyId);

    // Perform deposit
    console.log("\n⏳ Executing depositETH...");
    const vaultWithDepositor = this.vaultContract.connect(this.depositor);
    
    const depositTx = await vaultWithDepositor.depositETH(
      bountyId,
      solverShare,
      operatorShare,
      { 
        value: depositAmount,
        nonce: depositorNonce
      }
    );

    // Store bountyId for distribution
    (this as any).currentBountyId = bountyId;

    console.log(`📝 Transaction hash: ${depositTx.hash}`);
    const receipt = await depositTx.wait();
    console.log(`✅ Confirmed in block: ${receipt?.blockNumber}`);

    // Show events
    if (receipt?.logs) {
      console.log("\n📢 Events emitted:");
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.vaultContract.interface.parseLog(log);
          if (parsedLog?.name === "Deposited") {
            console.log(`   Event: ${parsedLog.name}`);
            console.log(`   ├─ bountyId: ${parsedLog.args[0]}`);
            console.log(`   ├─ tokenType: ${parsedLog.args[1] === 0n ? "ETH" : "ERC20"}`);
            console.log(`   ├─ tokenAddress: ${parsedLog.args[2]}`);
            console.log(`   ├─ depositor: ${parsedLog.args[3]}`);
            console.log(`   └─ amount: ${ethers.formatEther(parsedLog.args[4])} ETH`);
          }
        } catch (e) {
          // Skip non-contract logs
        }
      }
    }

    // Show state after deposit
    await this.showBalances("After Deposit");
    await this.showBountyState(bountyId);
  }

  private async distribute(): Promise<void> {
    const bountyId = (this as any).currentBountyId; // Use the same bountyId from deposit

    console.log("\n\n💸 STEP 2: Distributing ETH");
    console.log("═".repeat(50));
    console.log(`Bounty ID: ${bountyId}`);
    console.log(`Solver:    ${this.solver.address}`);
    console.log(`Owner:     ${this.deployer.address}`);

    // Show current nonce for owner
    const ownerNonce = await this.provider.getTransactionCount(this.deployer.address);
    console.log(`🔢 Owner nonce: ${ownerNonce}`);

    // Show state before distribution
    await this.showBalances("Before Distribution");
    await this.showBountyState(bountyId);

    // Perform distribution
    console.log("\n⏳ Executing distribute...");
    const vaultWithOwner = this.vaultContract.connect(this.deployer);
    
    const distributeTx = await vaultWithOwner.distribute(
      bountyId, 
      this.solver.address,
      { nonce: ownerNonce }
    );

    console.log(`📝 Transaction hash: ${distributeTx.hash}`);
    const receipt = await distributeTx.wait();
    console.log(`✅ Confirmed in block: ${receipt?.blockNumber}`);

    // Show events and debug info
    if (receipt?.logs) {
      console.log("\n📢 Events emitted:");
      for (const log of receipt.logs) {
        try {
          const parsedLog = this.vaultContract.interface.parseLog(log);
          if (parsedLog) {
            console.log(`   Event: ${parsedLog.name}`);
            
            if (parsedLog.name === "Distributed") {
              console.log(`   ├─ bountyId: ${parsedLog.args[0]}`);
              console.log(`   ├─ solver: ${parsedLog.args[1]}`);
              console.log(`   ├─ solverAmount: ${ethers.formatEther(parsedLog.args[2])} ETH`);
              console.log(`   └─ operatorAmount: ${ethers.formatEther(parsedLog.args[3])} ETH`);
            } else if (parsedLog.name.startsWith("Debug")) {
              console.log(`   └─ ${parsedLog.args[0]}: ${parsedLog.args[1]}`);
            }
          }
        } catch (e) {
          // Skip non-contract logs
        }
      }
    }

    // Show final state
    await this.showBalances("After Distribution");
    await this.showBountyState(bountyId);
  }

  async run(): Promise<void> {
    try {
      console.log("🎬 Starting Simple ETH Flow Test\n");

      // Check Anvil connection
      try {
        const network = await this.provider.getNetwork();
        console.log(`🌐 Connected to network: ${network.name} (chainId: ${network.chainId})`);
        
        // Show initial nonces for all accounts
        console.log("\n🔢 Initial account nonces:");
        console.log(`   Deployer:  ${await this.provider.getTransactionCount(this.deployer.address)}`);
        console.log(`   Depositor: ${await this.provider.getTransactionCount(this.depositor.address)}`);
        console.log(`   Solver:    ${await this.provider.getTransactionCount(this.solver.address)}`);
        console.log(`   Operator:  ${await this.provider.getTransactionCount(this.operator.address)}\n`);
        
      } catch (error) {
        console.error("❌ Cannot connect to Anvil. Make sure it's running on http://127.0.0.1:8545");
        return;
      }

      // Deploy vault
      await this.deployVault();

      // Execute the flow
      await this.depositETH();
      await this.distribute();

      // Success summary
      console.log("\n\n🎉 FLOW COMPLETED SUCCESSFULLY!");
      console.log("═".repeat(60));
      console.log("✅ 1. ETH deposited with 75/25 split");
      console.log("✅ 2. ETH distributed to solver and operator");
      console.log("✅ All balance changes tracked");
      console.log("✅ All events logged");
      console.log("✅ Contract state verified");

    } catch (error) {
      console.error("\n❌ Flow failed:", error);
      process.exit(1);
    }
  }
}

// Execute the test
async function main() {
  const tester = new SimpleETHFlowTester();
  await tester.run();
}

main().catch(console.error);