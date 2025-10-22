// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../lib/forge-std/src/console.sol";

/**
 * @title MultiTokenBountyVault (string bountyId 지원 버전)
 * @notice ETH 및 ERC20(USDC, BNB 등)을 바운티별로 예치하고 동적 비율로 분배하는 컨트랙트
 * @dev 외부에서는 string bountyId 사용, 내부에서는 bytes32 해시로 관리
 */
contract MultiTokenBountyVault is ReentrancyGuard, Ownable {
    enum TokenType { ETH, ERC20 }

    struct Bounty {
        TokenType tokenType;
        address tokenAddress;
        uint256 totalAmount;
        address depositor;
        address solver;
        uint8 solverShare;
        uint8 operatorShare;
        bool distributed;
    }

    // bytes32(bountyId hash) → Bounty
    mapping(bytes32 => Bounty) public bounties;
    address public operator;

    event Deposited(
        string bountyId,
        TokenType tokenType,
        address tokenAddress,
        address indexed depositor,
        uint256 amount,
        uint8 solverShare,
        uint8 operatorShare
    );

    event Distributed(
        string bountyId,
        address indexed solver,
        uint256 solverAmount,
        uint256 operatorAmount
    );

    constructor(address _operator, address _initialOwner) Ownable(_initialOwner) {
        require(_operator != address(0), "Invalid operator");
        operator = _operator;
    }

    /**
     * @dev 내부 헬퍼: 문자열을 bytes32로 변환
     */
    function _toKey(string memory bountyId) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(bountyId));
    }

    /**
     * @dev ETH 예치
     */
    function depositETH(
        string memory bountyId,
        uint8 solverShare,
        uint8 operatorShare
    ) external payable nonReentrant {
        bytes32 key = _toKey(bountyId);
        require(msg.value > 0, "No ETH sent");
        require(bounties[key].totalAmount == 0, "Already deposited");
        require(solverShare + operatorShare == 100, "Invalid ratio");

        bounties[key] = Bounty({
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
     * @dev ERC20 예치
     */
    function depositToken(
        string memory bountyId,
        address token,
        uint256 amount,
        uint8 solverShare,
        uint8 operatorShare
    ) external nonReentrant {
        bytes32 key = _toKey(bountyId);
        require(token != address(0), "Invalid token");
        require(amount > 0, "Invalid amount");
        require(bounties[key].totalAmount == 0, "Already deposited");
        require(solverShare + operatorShare == 100, "Invalid ratio");

        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        require(ok, "Token transfer failed");

        bounties[key] = Bounty({
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

    // /**
    //  * @dev 운영자 분배
    //  */
    // function distribute(string memory bountyId, address solver) external onlyOwner nonReentrant {
    //     bytes32 key = _toKey(bountyId);
    //     Bounty storage bounty = bounties[key];

    //     console.log("bountyId:", bountyId);
    //     console.logBytes32(key);
    //     console.logAddress(solver);

    //     console.log("distributed:", bounty.distributed, !bounty.distributed);
    //     console.log("totalAmount:", bounty.totalAmount, bounty.totalAmount > 0);
    //     console.log("valid Address:", solver, address(0), solver != address(0));

    //     require(!bounty.distributed, "Already distributed");
    //     require(bounty.totalAmount > 0, "No bounty");
    //     require(solver != address(0), "Invalid solver");

    //     uint256 solverAmount = (bounty.totalAmount * bounty.solverShare) / 100;
    //     uint256 operatorAmount = (bounty.totalAmount * bounty.operatorShare) / 100;

    //     bounty.solver = solver;
    //     bounty.distributed = true;

    //     console.log("distributed Addresses:", solver, operator);

    //     if (bounty.tokenType == TokenType.ETH) {
    //         (bool s1, ) = solver.call{value: solverAmount}("");
    //         (bool s2, ) = operator.call{value: operatorAmount}("");
    //         require(s1 && s2, "ETH transfer failed");
    //     } else {
    //         IERC20 token = IERC20(bounty.tokenAddress);
    //         bool s1 = token.transfer(solver, solverAmount);
    //         bool s2 = token.transfer(operator, operatorAmount);
    //         require(s1 && s2, "Token transfer failed");
    //     }

    //     emit Distributed(bountyId, solver, solverAmount, operatorAmount);
    // }

    // 🧩 디버깅용 이벤트들
    event DebugLog(string message);
    event DebugUint(string label, uint256 value);
    event DebugAddress(string label, address value);
    event DebugBytes32(string label, bytes32 value);
    event DebugBool(string label, bool value);

    // 🔧 디버깅 헬퍼들
    function _debug(string memory message) internal {
        emit DebugLog(message);
    }

    function _debugUint(string memory label, uint256 value) internal {
        emit DebugUint(label, value);
    }

    function _debugAddress(string memory label, address value) internal {
        emit DebugAddress(label, value);
    }

    function _debugBytes32(string memory label, bytes32 value) internal {
        emit DebugBytes32(label, value);
    }

    function _debugBool(string memory label, bool value) internal {
        emit DebugBool(label, value);
    }

    // 🧠 디버깅 로깅 추가 버전 distribute()
    function distribute(
        string memory bountyId,
        address solver
    ) external onlyOwner nonReentrant {
        _debug("ENTER distribute()");
        _debugBytes32("bountyKey", _toKey(bountyId));
        _debugAddress("solverParam", solver);

        bytes32 key = _toKey(bountyId);
        Bounty storage bounty = bounties[key];

        // --- 조건 확인 ---
        _debugBool("bounty.distributed", bounty.distributed);
        require(!bounty.distributed, "Already distributed");

        _debugUint("bounty.totalAmount", bounty.totalAmount);
        require(bounty.totalAmount > 0, "No bounty");

        _debugAddress("bounty.tokenAddress", bounty.tokenAddress);
        _debugUint("solverShare", bounty.solverShare);
        _debugUint("operatorShare", bounty.operatorShare);

        require(solver != address(0), "Invalid solver");

        // --- 금액 계산 ---
        uint256 solverAmount = (bounty.totalAmount * bounty.solverShare) / 100;
        uint256 operatorAmount = (bounty.totalAmount * bounty.operatorShare) / 100;

        _debugUint("solverAmount", solverAmount);
        _debugUint("operatorAmount", operatorAmount);

        // --- 상태 변경 ---
        bounty.solver = solver;
        bounty.distributed = true;

        // --- 토큰 분배 ---
        if (bounty.tokenType == TokenType.ETH) {
            _debug("distribute: ETH mode");
            (bool s1, ) = solver.call{value: solverAmount}("");
            (bool s2, ) = operator.call{value: operatorAmount}("");
            _debugBool("s1", s1);
            _debugBool("s2", s2);
            require(s1 && s2, "ETH transfer failed");
        } else {
            _debug("distribute: ERC20 mode");
            IERC20 token = IERC20(bounty.tokenAddress);
            bool s1 = token.transfer(solver, solverAmount);
            bool s2 = token.transfer(operator, operatorAmount);
            _debugBool("s1", s1);
            _debugBool("s2", s2);
            require(s1 && s2, "Token transfer failed");
        }

        // --- 완료 ---
        emit Distributed(bountyId, solver, solverAmount, operatorAmount);
        _debug("EXIT distribute() success [v]");
    }

    /**
     * @dev 운영자 주소 변경
     */
    function setOperator(address newOperator) external onlyOwner {
        require(newOperator != address(0), "Invalid operator");
        operator = newOperator;
    }
}
