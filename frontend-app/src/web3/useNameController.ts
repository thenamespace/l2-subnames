import { MintContextResponse } from "../api/types";
import { useWeb3Clients } from "./use-web3-clients";
import REGISTRY_CONTROLLER_ABI from "./abi/v2/controller.json";
import { Hash, toBytes, toHex } from "viem";
import { useAccount } from "wagmi";
import { getL2Addresses } from "./l2-contract-addresses";
import { L2Network } from "./types";

export const useNameController = () => {
  const { publicClient, walletClient } = useWeb3Clients();
  const { address } = useAccount();

  const mint = async (params: MintContextResponse, network: L2Network): Promise<Hash> => {
    const mintFee = BigInt(params.parameters.fee || 0)
    const mintPrice = BigInt(params.parameters.price || 0)
    const totalPrice = mintFee + mintPrice;
    const { controller } = await getL2Addresses(network)

    //@ts-ignore
    const { request } = await publicClient?.simulateContract({
      abi: REGISTRY_CONTROLLER_ABI,
      functionName: "mint",
      address: controller,
      args: [params.parameters, params.signature, toHex(toBytes("demo-app"))],
      account: address,
      value: totalPrice
    });
    return (await walletClient?.writeContract(request)) as Hash;
  };

  const isNodeAvailable = async (label: string, node: string, network: L2Network): Promise<boolean> => {

    const { controller } = await getL2Addresses(network)
    return await publicClient?.readContract({
      abi: REGISTRY_CONTROLLER_ABI,
      functionName: "isNodeAvailable",
      address: controller,
      args: [label, node]
    }) as boolean
  }

  return {
    mint,
    isNodeAvailable
  };
};
