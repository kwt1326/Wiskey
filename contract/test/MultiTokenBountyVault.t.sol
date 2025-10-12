// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "../lib/forge-std/src/Test.sol";
import "../src/MultiTokenBountyVault.sol";
import "../src/mocks/ERC20Mock.sol";

contract MultiTokenBountyVaultTest is Test {
    MultiTokenBountyVault vault;
    ERC20Mock usdc;
    address operator = address(1);
    address depositor = address(2);
    address solver = address(3);

    function setUp() public {
        vm.deal(depositor, 10 ether); // depositor에게 10 ETH 지급
        vault = new MultiTokenBountyVault(operator);
        usdc = new ERC20Mock("MockUSDC", "USDC", depositor, 1_000_000e6);
    }

    function testDepositAndDistributeETH() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(1, 90, 10);
        vm.stopPrank();

        // operator가 분배
        vm.startPrank(operator);
        uint256 solverBalanceBefore = solver.balance;
        uint256 operatorBalanceBefore = operator.balance;

        vault.distribute(1, solver);

        uint256 solverBalanceAfter = solver.balance;
        uint256 operatorBalanceAfter = operator.balance;
        vm.stopPrank();

        assertEq(solverBalanceAfter - solverBalanceBefore, 0.9 ether);
        assertEq(operatorBalanceAfter - operatorBalanceBefore, 0.1 ether);

        (,,,,,uint8 solverShare,,bool distributed) = vault.bounties(1);
        assertEq(solverShare, 90);
        assertTrue(distributed);
    }

    function testDepositAndDistributeERC20() public {
        vm.startPrank(depositor);
        usdc.approve(address(vault), 100e6);
        vault.depositToken(2, address(usdc), 100e6, 95, 5);
        vm.stopPrank();

        vm.startPrank(operator);
        vault.distribute(2, solver);
        vm.stopPrank();

        assertEq(usdc.balanceOf(solver), 95e6);
        assertEq(usdc.balanceOf(operator), 5e6);
    }

    function testRevertOnInvalidRatio() public {
        vm.startPrank(depositor);
        vm.expectRevert("Invalid ratio");
        vault.depositETH{value: 1 ether}(3, 70, 40);
        vm.stopPrank();
    }

    function testRevertOnDoubleDeposit() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(4, 90, 10);
        vm.expectRevert("Already deposited");
        vault.depositETH{value: 1 ether}(4, 90, 10);
        vm.stopPrank();
    }

    function testRevertIfNonOwnerDistributes() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(5, 90, 10);
        vm.stopPrank();

        vm.startPrank(depositor);
        vm.expectRevert();
        vault.distribute(5, solver);
        vm.stopPrank();
    }
}
