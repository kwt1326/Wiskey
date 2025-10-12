import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

/**
 * MultiTokenBountyVault 배포 모듈 (Hardhat 3.x / Ignition v3 호환)
 * 
 * deploy example:
 * 
 * pnpm run deploy:baseSepolia ./ignition/modules/MultiTokenBountyVault.ts \
  --parameters.operatorAddress 0x000000000000000000000000000000000000dEaD \
  --parameters.ownerAddress 0x000000000000000000000000000000000000dEaD
 */
export default buildModule("MultiTokenBountyVault", (m) => {
  
  // 🧩 파라미터 정의
  const operatorAddress = m.getParameter("operatorAddress");
  const ownerAddress = m.getParameter("ownerAddress"); // optional

  console.log("Addresses: ", operatorAddress, ownerAddress)

  // 🏗️ 컨트랙트 배포
  // - Hardhat이 현재 네트워크의 첫 번째 signer를 배포자로 자동 사용
  const vault = m.contract("MultiTokenBountyVault", [
    operatorAddress,
    ownerAddress ?? "0x0000000000000000000000000000000000000000",
  ]);

  return { vault };
});
