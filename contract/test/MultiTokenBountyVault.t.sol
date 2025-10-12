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
        vm.deal(depositor, 10 ether);
        vault = new MultiTokenBountyVault(operator, address(this)); // ✅ OZ v5 Ownable 생성자 인자
        usdc = new ERC20Mock("MockUSDC", "USDC", depositor, 1_000_000e6);
    }

    function testDepositAndDistributeETH() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(1, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this)); // owner
        uint256 solverBalanceBefore = solver.balance;
        uint256 operatorBalanceBefore = operator.balance;

        vault.distribute(1, solver);

        uint256 solverBalanceAfter = solver.balance;
        uint256 operatorBalanceAfter = operator.balance;

        vm.stopPrank();

        assertEq(solverBalanceAfter - solverBalanceBefore, 0.9 ether);
        assertEq(operatorBalanceAfter - operatorBalanceBefore, 0.1 ether);
    }

    function testDepositAndDistributeERC20() public {
        vm.startPrank(depositor);
        usdc.approve(address(vault), 100e6);
        vault.depositToken(2, address(usdc), 100e6, 95, 5);
        vm.stopPrank();

        vm.startPrank(address(this));
        vault.distribute(2, solver);
        vm.stopPrank();

        assertEq(usdc.balanceOf(solver), 95e6);
        assertEq(usdc.balanceOf(operator), 5e6);
    }
}
