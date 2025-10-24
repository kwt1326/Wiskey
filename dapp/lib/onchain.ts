import { createConfig, http } from "wagmi";
import { anvil, baseSepolia } from "wagmi/chains";

const localConfig = createConfig({
      chains: [anvil],
      transports: {
        [anvil.id]: http("http://127.0.0.1:8545"),
      },
    });

const devConfig = createConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
    },
  });

export const getActiveChain = () => process.env.NEXT_PUBLIC_ENVIRONMENT === "local" ? anvil : baseSepolia;
export const getWagmiConfig = () => process.env.NEXT_PUBLIC_ENVIRONMENT === "local" ? localConfig : devConfig;
