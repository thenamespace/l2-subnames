import { SupportedNetwork } from "src/types";
import { Address } from "viem";


export type SupportedNetworkContracts = Record<SupportedNetwork, Address>

const nameResolvers: SupportedNetworkContracts = {
    base: "0xeFCC3a6459D9fc52DF09deAc45fA18472C37226c",
    sepolia: "0x0385E115c0D092Fc3D95eC56379BFDae8365c028"
}

const offchainResolvers: SupportedNetworkContracts = {
    base: "0xaE04a09CF2c408803AC7718e3dE22ac346a05B58",
    sepolia: "0xaa34Ba91cF6Cf642a6bfC76707Ca877E185d3774"
}

const nameResolversV2: SupportedNetworkContracts = {
    base: "0x8A4697A504467D65cdb913c371d3Ea06eDB1728E",
    sepolia: "0xd16B488f8c722E38582Df3Ebc2a68D03EDF3ae62"
} 

export const getNameResolverAddr = (network: SupportedNetwork) => {
    return nameResolvers[network]
}

export const getNameResolverAddrV2 = (network: SupportedNetwork) => {
    return nameResolversV2[network];
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
    return a.toLocaleLowerCase() === b.toLocaleLowerCase();
}