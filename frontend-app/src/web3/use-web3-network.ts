import { useAccount } from "wagmi"
import { Web3Network } from "./types"

export const networkIds: Record<string, Web3Network> = {
    
}

interface UseWeb3NetworkResponse {
    networkId: number
    network: Web3Network
    isSupported: boolean
}

export const useWeb3Network = () => {
   
    const { chain } = useAccount();
}