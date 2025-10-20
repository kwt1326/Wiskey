// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "../lib/forge-std/src/Script.sol";
import {MultiTokenBountyVault} from "../src/MultiTokenBountyVault.sol";

/**
 * @title DeployMultiTokenBountyVault
 * @notice Foundry deployment script for MultiTokenBountyVault contract
 * 
 * Usage examples:
 * 
 * Local deployment:
 * forge script script/DeployMultiTokenBountyVault.s.sol:DeployMultiTokenBountyVault \
 *   --rpc-url http://localhost:8545 \
 *   --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 \
 *   --broadcast \
 *   --sig "run(address,address)" 0x000000000000000000000000000000000000dEaD 0x000000000000000000000000000000000000dEaD
 * 
 * Base Sepolia deployment:
 * forge script script/DeployMultiTokenBountyVault.s.sol:DeployMultiTokenBountyVault \
 *   --rpc-url $BASE_SEPOLIA_RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify \
 *   --etherscan-api-key $BASESCAN_API_KEY \
 *   --sig "run(address,address)" $OPERATOR_ADDRESS $OWNER_ADDRESS
 * 
 * Environment variables deployment:
 * forge script script/DeployMultiTokenBountyVault.s.sol:DeployMultiTokenBountyVault \
 *   --rpc-url $RPC_URL \
 *   --private-key $PRIVATE_KEY \
 *   --broadcast \
 *   --verify \
 *   --sig "runWithEnvVars()"
 */
contract DeployMultiTokenBountyVault is Script {
    
    /**
     * @dev Deploy with explicit parameters
     * @param operatorAddress Address that will act as the operator
     * @param ownerAddress Address that will own the contract (use 0x0 for deployer)
     */
    function run(address operatorAddress, address ownerAddress) external {
        // Validate parameters
        require(operatorAddress != address(0), "Invalid operator address");
        
        // Use deployer as owner if ownerAddress is zero
        if (ownerAddress == address(0)) {
            ownerAddress = msg.sender;
        }
        
        console.log("Deploying MultiTokenBountyVault with:");
        console.log("Operator Address:", operatorAddress);
        console.log("Owner Address:", ownerAddress);
        console.log("Deployer:", msg.sender);
        
        vm.startBroadcast();
        
        // Deploy the contract
        MultiTokenBountyVault vault = new MultiTokenBountyVault(
            operatorAddress,
            ownerAddress
        );
        
        vm.stopBroadcast();
        
        console.log("MultiTokenBountyVault deployed at:", address(vault));
        console.log("Deployment successful!");
        
        // Log contract details for verification
        console.log("Contract operator:", vault.operator());
        console.log("Contract owner:", vault.owner());
    }
    
    // /**
    //  * @dev Deploy using environment variables
    //  * Expects OPERATOR_ADDRESS and optionally OWNER_ADDRESS env vars
    //  */
    // function runWithEnvVars() external {
    //     address operatorAddress = vm.envAddress("OPERATOR_ADDRESS");
        
    //     // Try to get owner address from env, fallback to zero address (will use deployer)
    //     address ownerAddress;
    //     try vm.envAddress("OWNER_ADDRESS") returns (address addr) {
    //         ownerAddress = addr;
    //     } catch {
    //         ownerAddress = address(0); // Will use deployer as owner
    //     }
        
    //     run(operatorAddress, ownerAddress);
    // }
    
    // /**
    //  * @dev Simple deployment using deployer as both operator and owner
    //  * Useful for testing and development
    //  */
    // function runSimple() external {
    //     address deployer = msg.sender;
    //     run(deployer, deployer);
    // }
}
