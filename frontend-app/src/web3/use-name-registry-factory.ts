/* eslint-disable no-unsafe-optional-chaining */
import { Address, Hash } from "viem";
import abi from "./abi/name-registry-factory.json";
import { useGetAddresses } from "./use-get-addresses";
import { useWeb3Clients } from "./use-web3-clients";

export const useNameRegistryFactory = () => {
  const { publicClient, walletClient } = useWeb3Clients();
  const { nameRegistryFactory } = useGetAddresses();

  const launchNewName = async (
    listingName: string,
    symbol: string,
    parentLabel: string,
    baseUri: string,
    owner: Address,
    resolver: Address,
    parentControl = BigInt(0),
    listingType = BigInt(0),
    signature: string
  ) => {
    const mintContext = {
      listingName,
      symbol,
      parentLabel,
      baseUri,
      owner,
      resolver,
      parentControl,
      listingType,
    };

    const { request } = await publicClient?.simulateContract({
      abi,
      address: nameRegistryFactory,
      functionName: "create",
      args: [mintContext, signature],
      maxFeePerGas: BigInt(6030757777),
    });

    return (await walletClient?.writeContract(request)) as Hash;
  };

  return {
    launchNewName,
  };
};
