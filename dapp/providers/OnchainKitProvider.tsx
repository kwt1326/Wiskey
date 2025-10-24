import { ReactNode } from "react";
import { WagmiProvider } from 'wagmi';
import { getActiveChain, getWagmiConfig } from "@/lib/onchain";
import { AppConfig, OnchainKitProvider } from "@coinbase/onchainkit";

import "@coinbase/onchainkit/styles.css";

export function OnchainKitProviderWrapper({ children }: { children: ReactNode }) {
  const onchainKitConfig: AppConfig = {
    appearance: {
      mode: "auto",
    },
    wallet: {
      display: "modal",
    },
  };
  
  return (
    <WagmiProvider config={getWagmiConfig()}>
      <OnchainKitProvider
        apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
        chain={getActiveChain()}
        config={onchainKitConfig}
      >
        {children}
      </OnchainKitProvider>
    </WagmiProvider>
  )
}
