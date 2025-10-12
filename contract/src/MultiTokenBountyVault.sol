// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MultiTokenBountyVault
 * @notice ETH 및 ERC20(USDC, BNB 등)을 바운티별로 예치하고 동적 비율로 분배하는 컨트랙트
 */
contract MultiTokenBountyVault is ReentrancyGuard, Ownable {
    enum TokenType { ETH, ERC20 }

    struct Bounty {
        TokenType tokenType;
        address tokenAddress;   // ERC20 주소 (ETH는 address(0))
        uint256 totalAmount;
        address depositor;
        address solver;
        uint8 solverShare;
        uint8 operatorShare;
        bool distributed;
    }

    mapping(uint256 => Bounty) public bounties;
    address public operator; // 운영자 지갑

    event Deposited(
        uint256 indexed bountyId,
        TokenType tokenType,
        address tokenAddress,
        address indexed depositor,
        uint256 amount,
        uint8 solverShare,
        uint8 operatorShare
    );

    event Distributed(
        uint256 indexed bountyId,
        address indexed solver,
        uint256 solverAmount,
        uint256 operatorAmount
    );

    constructor(address _operator) {
        require(_operator != address(0), "Invalid operator");
        operator = _operator;
    }

    /**
     * @dev ETH 예치 (무기한 보관)
     */
    function depositETH(
        uint256 bountyId,
        uint8 solverShare,
        uint8 operatorShare
    ) external payable nonReentrant {
        require(msg.value > 0, "No ETH sent");
        require(bounties[bountyId].totalAmount == 0, "Already deposited");
        require(solverShare + operatorShare == 100, "Invalid ratio");

        bounties[bountyId] = Bounty({
            tokenType: TokenType.ETH,
            tokenAddress: address(0),
            totalAmount: msg.value,
            depositor: msg.sender,
            solver: address(0),
            solverShare: solverShare,
            operatorShare: operatorShare,
            distributed: false
        });

        emit Deposited(bountyId, TokenType.ETH, address(0), msg.sender, msg.value, solverShare, operatorShare);
    }

    /**
     * @dev ERC20 (예: USDC, BNB Chain의 토큰) 예치
     */
    function depositToken(
        uint256 bountyId,
        address token,
        uint256 amount,
        uint8 solverShare,
        uint8 operatorShare
    ) external nonReentrant {
        require(token != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");
        require(bounties[bountyId].totalAmount == 0, "Already deposited");
        require(solverShare + operatorShare == 100, "Invalid ratio");

        IERC20(token).transferFrom(msg.sender, address(this), amount);

        bounties[bountyId] = Bounty({
            tokenType: TokenType.ERC20,
            tokenAddress: token,
            totalAmount: amount,
            depositor: msg.sender,
            solver: address(0),
            solverShare: solverShare,
            operatorShare: operatorShare,
            distributed: false
        });

        emit Deposited(bountyId, TokenType.ERC20, token, msg.sender, amount, solverShare, operatorShare);
    }

    /**
     * @dev 운영자가 언제든 분배를 트리거 가능
     */
    function distribute(uint256 bountyId, address solver) external onlyOwner nonReentrant {
        Bounty storage bounty = bounties[bountyId];
        require(!bounty.distributed, "Already distributed");
        require(bounty.totalAmount > 0, "No bounty");
        require(solver != address(0), "Invalid solver");

        uint256 solverAmount = (bounty.totalAmount * bounty.solverShare) / 100;
        uint256 operatorAmount = (bounty.totalAmount * bounty.operatorShare) / 100;

        bounty.solver = solver;
        bounty.distributed = true;

        if (bounty.tokenType == TokenType.ETH) {
            (bool s1, ) = solver.call{value: solverAmount}("");
            (bool s2, ) = operator.call{value: operatorAmount}("");
            require(s1 && s2, "ETH transfer failed");
        } else {
            IERC20 token = IERC20(bounty.tokenAddress);
            require(token.transfer(solver, solverAmount), "Solver transfer failed");
            require(token.transfer(operator, operatorAmount), "Operator transfer failed");
        }

        emit Distributed(bountyId, solver, solverAmount, operatorAmount);
    }

    /**
     * @dev 운영자 주소 변경
     */
    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator");
        operator = newOperator;
    }
}
