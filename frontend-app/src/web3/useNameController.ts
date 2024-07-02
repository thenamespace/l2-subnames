import { MintContextResponse } from "../api/types";
import { useWeb3Clients } from "./use-web3-clients";
import REGISTRY_CONTROLLER_ABI from "./abi/name-registry-controller.json";
import CONTROLLER_ABI_V2 from "./abi/controller-v2.json";
import { useGetAddresses } from "./use-get-addresses";
import { Hash, toBytes, toHex, zeroAddress } from "viem";
import { useAccount } from "wagmi";

export const useNameController = () => {
  const { publicClient, walletClient } = useWeb3Clients();
  const { nameRegistryController, controllerV2 } = useGetAddresses();
  const { address } = useAccount();

  const mint = async (params: MintContextResponse): Promise<Hash> => {
    const mintFee = BigInt(params.parameters.fee || 0);
    const mintPrice = BigInt(params.parameters.price || 0);
    //@ts-ignore
    const { request } = await publicClient?.simulateContract({
      abi: REGISTRY_CONTROLLER_ABI,
      functionName: "mint",
      address: nameRegistryController,
      args: [params.parameters, params.signature],
      account: address,
      value: mintFee + mintPrice,
    });
    return (await walletClient?.writeContract(request)) as Hash;
  };

  const mintV2 = async (params: MintContextResponse): Promise<Hash> => {
    if (!walletClient || !publicClient) {
      return zeroAddress;
    }

    const { request } = await publicClient.simulateContract({
      abi: CONTROLLER_ABI_V2,
      address: controllerV2,
      account: address,
      functionName: "mint",
      args: [params.parameters, params.signature, toHex(toBytes("hello"))],
    });
    return await walletClient.writeContract(request);
  };

  const inNodeAvailableV2 = async (
    label: string,
    parentNode: string
  ): Promise<boolean> => {
    if (!publicClient) {
      return false;
    }

    const available = await publicClient.readContract({
      abi: CONTROLLER_ABI_V2,
      address: controllerV2,
      functionName: "isNodeAvailable",
      args: [label, parentNode],
    }) as boolean

    return available;
  };

  return {
    mint,
    mintV2,
    inNodeAvailableV2,
  };
};
