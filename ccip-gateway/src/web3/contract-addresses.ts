import { getL2ChainContracts } from "namespace-sdk";
import { SupportedNetwork } from "src/types";
import { Address } from "viem";
import { getOffchainResolverForL2Network } from "namespace-sdk/dist/web3";

export type SupportedNetworkContracts = Record<SupportedNetwork, Address>

const offchainResolvers: SupportedNetworkContracts = {
    base: getOffchainResolverForL2Network("base"),
    sepolia: "0xaa34Ba91cF6Cf642a6bfC76707Ca877E185d3774",
    baseSepolia: getOffchainResolverForL2Network("baseSepolia")
}

const nameResolvers: SupportedNetworkContracts = {
    base: "0x0aBD0a6A1A98D7BD5D9909A3F1d7EE0B74587d70",
    sepolia: "0xd16B488f8c722E38582Df3Ebc2a68D03EDF3ae62",
    baseSepolia: "0x0"
} 

export const getNameResolverAddr = (network: SupportedNetwork) => {
    return nameResolvers[network]
}

export const getNameResolverAddrV2 = (network: SupportedNetwork) => {
    //@ts-ignore
    return getL2ChainContracts(network).resolver;
}

export const getNetworkForOffchainResolver = (address: Address): SupportedNetwork => {
    for (const network of Object.keys(offchainResolvers)) {
        if (equalsIgnoreCase(offchainResolvers[network], address)) {
            return network as SupportedNetwork;
        }
    }
    throw new Error("Network not found for offchain resolver address " + address);
}

const equalsIgnoreCase = (a: string, b: string) => {
    if (!a || !b) {
        return false;
    }
    return a.toLocaleLowerCase() === b.toLocaleLowerCase();
}