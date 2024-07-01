import { namehash, zeroAddress } from "viem";
import NAME_REGISTRY_ABI from "./abi/name-registry.json";
import { useGetAddresses } from "./use-get-addresses";
import { usePublicClient } from "wagmi";

export const useNameRegistry = (chainId: number) => {

    const publicClient = usePublicClient({chainId: chainId})
    const { nameRegistry } = useGetAddresses(chainId)

    const isSubnameAvailable = async (fullSubname:string) => {
        const node = namehash(fullSubname);
        const ownerAddress = await publicClient?.readContract({
            abi: NAME_REGISTRY_ABI,
            address: nameRegistry,
            functionName: "ownerOf",
            args: [BigInt(node)]
        })

        return ownerAddress === zeroAddress;
    }

    return {
        isSubnameAvailable
    }

}