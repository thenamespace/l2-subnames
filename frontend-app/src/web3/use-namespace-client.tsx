import { useWalletClient } from "wagmi"
import { createNamespaceClient } from "namespace-sdk";

export const useNamespaceClient = (chainId: number) => {

    const { data: signer } = useWalletClient({chainId})
    const nsClient = createNamespaceClient({
        chainId: chainId,
        mintSource: "l2-subnames",
    })
    
    return {
        signer,
        namespaceClient: nsClient
    }
}