import { createPublicClient, http } from "viem";
import { sepolia, base} from "viem/chains";
import { Network } from "../types";

const sepoliaClient = createPublicClient({
    transport: http(),
    chain: sepolia
})

const baseClient = createPublicClient({
    transport: http(),
    chain: base
})

export const getPublicClient = (network: Network) => {
    if (network === "sepolia") {
        return sepoliaClient;
    }
    return baseClient;
}