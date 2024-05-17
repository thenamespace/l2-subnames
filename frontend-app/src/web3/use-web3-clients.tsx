import { useAccount, usePublicClient, useWalletClient } from "wagmi";

const DEFAULT_NETWORK_ID = 1;

export const useWeb3Clients = () => {
  const { chain } = useAccount();
  const chainId = chain?.id || DEFAULT_NETWORK_ID;
  const { data: walletClient } = useWalletClient({ chainId: chainId });
  const publicClient = usePublicClient({ chainId: chainId });

  return {
    walletClient,
    publicClient,
  };
};
