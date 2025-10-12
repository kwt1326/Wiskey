// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "../lib/forge-std/src/Test.sol";
import "../src/MultiTokenBountyVault.sol";
import "../src/mocks/ERC20Mock.sol";

/**
 * @title MultiTokenBountyVault Comprehensive Test
 * @notice Base L2 + ETH + ERC20 + Edge Cases 테스트
 */
contract MultiTokenBountyVaultTest is Test {
    MultiTokenBountyVault vault;
    ERC20Mock usdc;
    address operator = address(1);
    address depositor = address(2);
    address solver = address(3);

    function setUp() public {
        // 기본 세팅
        vm.deal(depositor, 100 ether);
        vm.deal(operator, 10 ether);
        vault = new MultiTokenBountyVault(operator, address(this));
        usdc = new ERC20Mock("MockUSDC", "USDC", depositor, 1_000_000e6);
    }

    /* -------------------------------
        ✅ 1. Base 체인 ETH 예치
    ------------------------------- */
    function testBaseChainDepositETH() public {
        // Base 네트워크도 msg.value 기반 예치 구조 동일
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(1001, 90, 10);
        vm.stopPrank();

        (MultiTokenBountyVault.TokenType tokenType, address tokenAddr, uint256 total,,,) =
            _getPartialBounty(1001);
        assertEq(uint256(tokenType), uint256(MultiTokenBountyVault.TokenType.ETH));
        assertEq(tokenAddr, address(0));
        assertEq(total, 1 ether);
    }

    /* -------------------------------
        ✅ 2. Base 체인 분배 로직
    ------------------------------- */
    function testBaseChainDistributeETH() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 2 ether}(1002, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this)); // owner
        uint256 solverBefore = solver.balance;
        uint256 operatorBefore = operator.balance;

        vault.distribute(1002, solver);

        assertEq(solver.balance - solverBefore, 1.8 ether);
        assertEq(operator.balance - operatorBefore, 0.2 ether);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 3. 예치 금액 0 → revert
    ------------------------------- */
    function testRevertIfDepositZero() public {
        vm.startPrank(depositor);
        vm.expectRevert("No ETH sent");
        vault.depositETH{value: 0}(2001, 90, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 4. solver 주소 0x0 → revert
    ------------------------------- */
    function testRevertIfInvalidSolver() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(2002, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this));
        vm.expectRevert("Invalid solver");
        vault.distribute(2002, address(0));
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 5. 이미 분배된 바운티 재분배 → revert
    ------------------------------- */
    function testRevertIfAlreadyDistributed() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(2003, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this));
        vault.distribute(2003, solver);
        vm.expectRevert("Already distributed");
        vault.distribute(2003, solver);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 6. solver:operator 비율 100 초과 → revert
    ------------------------------- */
    function testRevertIfInvalidRatio() public {
        vm.startPrank(depositor);
        vm.expectRevert("Invalid ratio");
        vault.depositETH{value: 1 ether}(2004, 110, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 7. ERC20 deposit without approve → revert
    ------------------------------- */
    function testRevertIfERC20WithoutApprove() public {
        vm.startPrank(depositor);
        vm.expectRevert(); // transferFrom 실패
        vault.depositToken(3001, address(usdc), 100e6, 90, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 8. ERC20 분배 정상 동작
    ------------------------------- */
    function testERC20DepositAndDistribute() public {
        vm.startPrank(depositor);
        usdc.approve(address(vault), 100e6);
        vault.depositToken(3002, address(usdc), 100e6, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this));
        vault.distribute(3002, solver);
        vm.stopPrank();

        assertEq(usdc.balanceOf(solver), 90e6);
        assertEq(usdc.balanceOf(operator), 10e6);
    }

    /* -------------------------------
        ✅ 9. 중복 예치 → revert
    ------------------------------- */
    function testRevertIfDoubleDeposit() public {
        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(4001, 90, 10);
        vm.expectRevert("Already deposited");
        vault.depositETH{value: 1 ether}(4001, 90, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 10. 다른 예치자 간 충돌 없는지
    ------------------------------- */
    function testMultipleDepositorsIndependent() public {
        address depositor2 = address(9);
        vm.deal(depositor2, 10 ether);

        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(5001, 90, 10);
        vm.stopPrank();

        vm.startPrank(depositor2);
        vault.depositETH{value: 2 ether}(5002, 95, 5);
        vm.stopPrank();

        (,, uint256 total1,,,) = _getPartialBounty(5001);
        (,, uint256 total2,,,) = _getPartialBounty(5002);

        assertEq(total1, 1 ether);
        assertEq(total2, 2 ether);
    }

    /* -------------------------------
        Helper
    ------------------------------- */
    function _getPartialBounty(uint256 id)
        internal
        view
        returns (
            MultiTokenBountyVault.TokenType tokenType,
            address tokenAddr,
            uint256 total,
            address depositor_,
            address solver_,
            bool distributed
        )
    {
        (tokenType, tokenAddr, total, depositor_, solver_, , , distributed) = vault.bounties(id);
    }
}
