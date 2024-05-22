import { SupportedNetwork } from "src/types";
import { Address } from "viem";


export type SupportedNetworkContracs = Record<SupportedNetwork, Address>

const nameResolvers: SupportedNetworkContracs = {
    base: "0x0",
    sepolia: "0x0385E115c0D092Fc3D95eC56379BFDae8365c028"
}

const offchainResolvers: SupportedNetworkContracs = {
    base: "0x0",
    sepolia: "0xA3635655267D48906809E40CA8bdC79e4e0D22c2"
}

export const getNameResolverAddr = (network: SupportedNetwork) => {
    return nameResolvers[network]
}

export const getNetworkForOffchainResolver = (address: Address): SupportedNetwork => {
    for (const network of Object.keys(offchainResolvers)) {
        if (offchainResolvers[network] === address ) {
            return network as SupportedNetwork;
        }
    }
    throw new Error("Network not found for offchain resolver address " + address);
}