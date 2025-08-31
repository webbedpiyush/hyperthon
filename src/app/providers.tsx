"use client";

import dynamic from "next/dynamic";
import { SessionProvider } from "next-auth/react";

const WagmiProvider = dynamic(
  () => import("~/components/providers/WagmiProvider"),
  {
    ssr: false,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WagmiProvider>{children}</WagmiProvider>
    </SessionProvider>
  );
}
