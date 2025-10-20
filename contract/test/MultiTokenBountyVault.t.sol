// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "../lib/forge-std/src/Test.sol";
import "../src/MultiTokenBountyVault.sol";
import "../src/mocks/ERC20Mock.sol";

/**
 * @title MultiTokenBountyVault Comprehensive Test (string bountyId 버전)
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
        string memory bountyId = "bounty-1001";

        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(bountyId, 90, 10);
        vm.stopPrank();

        bytes32 key = keccak256(abi.encodePacked(bountyId));
        (
            MultiTokenBountyVault.TokenType tokenType,
            address tokenAddr,
            uint256 total,
            ,
            ,
            ,
            ,
            bool distributed
        ) = vault.bounties(key);

        assertEq(uint256(tokenType), uint256(MultiTokenBountyVault.TokenType.ETH));
        assertEq(tokenAddr, address(0));
        assertEq(total, 1 ether);
        assertEq(distributed, false);
    }

    /* -------------------------------
        ✅ 2. Base 체인 분배 로직
    ------------------------------- */
    function testBaseChainDistributeETH() public {
        string memory bountyId = "bounty-1002";

        vm.startPrank(depositor);
        vault.depositETH{value: 2 ether}(bountyId, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this)); // owner
        uint256 solverBefore = solver.balance;
        uint256 operatorBefore = operator.balance;

        vault.distribute(bountyId, solver);

        assertEq(solver.balance - solverBefore, 1.8 ether);
        assertEq(operator.balance - operatorBefore, 0.2 ether);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 3. 예치 금액 0 → revert
    ------------------------------- */
    function testRevertIfDepositZero() public {
        string memory bountyId = "bounty-2001";

        vm.startPrank(depositor);
        vm.expectRevert("No ETH sent");
        vault.depositETH{value: 0}(bountyId, 90, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 4. solver 주소 0x0 → revert
    ------------------------------- */
    function testRevertIfInvalidSolver() public {
        string memory bountyId = "bounty-2002";

        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(bountyId, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this));
        vm.expectRevert("Invalid solver");
        vault.distribute(bountyId, address(0));
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 5. 이미 분배된 바운티 재분배 → revert
    ------------------------------- */
    function testRevertIfAlreadyDistributed() public {
        string memory bountyId = "bounty-2003";

        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(bountyId, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this));
        vault.distribute(bountyId, solver);
        vm.expectRevert("Already distributed");
        vault.distribute(bountyId, solver);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 6. solver:operator 비율 100 초과 → revert
    ------------------------------- */
    function testRevertIfInvalidRatio() public {
        string memory bountyId = "bounty-2004";

        vm.startPrank(depositor);
        vm.expectRevert("Invalid ratio");
        vault.depositETH{value: 1 ether}(bountyId, 110, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 7. ERC20 deposit without approve → revert
    ------------------------------- */
    function testRevertIfERC20WithoutApprove() public {
        string memory bountyId = "bounty-3001";

        vm.startPrank(depositor);
        vm.expectRevert(); // transferFrom 실패
        vault.depositToken(bountyId, address(usdc), 100e6, 90, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 8. ERC20 분배 정상 동작
    ------------------------------- */
    function testERC20DepositAndDistribute() public {
        string memory bountyId = "bounty-3002";

        vm.startPrank(depositor);
        usdc.approve(address(vault), 100e6);
        vault.depositToken(bountyId, address(usdc), 100e6, 90, 10);
        vm.stopPrank();

        vm.startPrank(address(this));
        vault.distribute(bountyId, solver);
        vm.stopPrank();

        assertEq(usdc.balanceOf(solver), 90e6);
        assertEq(usdc.balanceOf(operator), 10e6);
    }

    /* -------------------------------
        ✅ 9. 중복 예치 → revert
    ------------------------------- */
    function testRevertIfDoubleDeposit() public {
        string memory bountyId = "bounty-4001";

        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(bountyId, 90, 10);
        vm.expectRevert("Already deposited");
        vault.depositETH{value: 1 ether}(bountyId, 90, 10);
        vm.stopPrank();
    }

    /* -------------------------------
        ✅ 10. 다른 예치자 간 충돌 없는지
    ------------------------------- */
    function testMultipleDepositorsIndependent() public {
        string memory bountyId1 = "bounty-5001";
        string memory bountyId2 = "bounty-5002";

        address depositor2 = address(9);
        vm.deal(depositor2, 10 ether);

        vm.startPrank(depositor);
        vault.depositETH{value: 1 ether}(bountyId1, 90, 10);
        vm.stopPrank();

        vm.startPrank(depositor2);
        vault.depositETH{value: 2 ether}(bountyId2, 95, 5);
        vm.stopPrank();

        bytes32 key1 = keccak256(abi.encodePacked(bountyId1));
        bytes32 key2 = keccak256(abi.encodePacked(bountyId2));

        (, , uint256 total1, , , , , ) = vault.bounties(key1);
        (, , uint256 total2, , , , , ) = vault.bounties(key2);

        assertEq(total1, 1 ether);
        assertEq(total2, 2 ether);
    }
}
