import { namehash, zeroAddress } from "viem";
import NAME_REGISTRY_ABI from "./abi/name-registry.json";
import { useWeb3Clients } from "./use-web3-clients";
import { useGetAddresses } from "./use-get-addresses";

export const useNameRegistry = () => {

    const { publicClient } = useWeb3Clients();
    const { nameRegistry } = useGetAddresses()

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