import { ReactNode, useMemo } from "react";
import { base } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import "@coinbase/onchainkit/styles.css";

// wagmi config
import { http, createConfig, WagmiProvider } from 'wagmi';
import { defineChain } from 'viem';

export const anvil = defineChain({
  id: 31337,
  name: 'Anvil Local',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
});

export const config = createConfig({
  chains: [anvil], // include Base/mainnet if you also use them
  transports: {
    [anvil.id]: http('http://127.0.0.1:8545'),
    // optionally add base/baseSepolia here
  },
});

export function OnchainKitProviderWrapper({ children }: { children: ReactNode }) {
  const chain = useMemo(
    () => process.env.NEXT_PUBLIC_ENVIRONMENT === 'local' ? anvil : base,
    [process.env.NEXT_PUBLIC_ENVIRONMENT]
  )

  return (
    <WagmiProvider config={config}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={chain}
        config={{
          appearance: {
            mode: "auto",
          },
          wallet: {
            display: "modal",
          },
        }}
      >
        {children}
      </OnchainKitProvider>
    </WagmiProvider>
  )
}