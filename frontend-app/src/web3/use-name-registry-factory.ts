import abi from "./abi/name-registry-factory.json";
import { useGetAddresses } from "./use-get-addresses";
import { useWeb3Clients } from "./use-web3-clients";

export const useNameRegistryFactory = () => {
  const { walletClient } = useWeb3Clients();
  const { nameRegistryFactory } = useGetAddresses();

  const launchNewName = async (
    listingName: string,
    symbol: string,
    ensName: string,
    baseUri: string,
    signature: string
  ) => {
    await walletClient?.writeContract({
      abi,
      address: nameRegistryFactory,
      functionName: "create",
      args: [listingName, symbol, ensName, baseUri, signature],
      maxFeePerGas: BigInt(6030757777),
    });
  };

  return {
    launchNewName,
  };
};
