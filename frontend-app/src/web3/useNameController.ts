import { MintContextResponse } from "../api/types";
import { useWeb3Clients } from "./use-web3-clients";
import REGISTRY_CONTROLLER_ABI from "./abi/name-registry-controller.json";
import { useGetAddresses } from "./use-get-addresses";
import { Hash } from "viem";
import { useAccount } from "wagmi";

export const useNameController = () => {
  const { publicClient, walletClient } = useWeb3Clients();
  const { nameRegistryController } = useGetAddresses();
  const { address } = useAccount();

  const mint = async (params: MintContextResponse): Promise<Hash> => {
    console.log(params)
    console.log(publicClient?.chain);
    console.log(nameRegistryController)
    //@ts-ignore
    const { request } = await publicClient?.simulateContract({
      abi: REGISTRY_CONTROLLER_ABI,
      functionName: "mint",
      address: nameRegistryController,
      args: [params.parameters, params.signature],
      account: address,
    });
    return (await walletClient?.writeContract(request)) as Hash;
  };

  return {
    mint,
  };
};
