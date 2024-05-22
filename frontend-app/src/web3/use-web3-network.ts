import { useAccount } from "wagmi"

export const useWeb3Network = () => {
   
    const { chain } = useAccount();

    return chain;
}