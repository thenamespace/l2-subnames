export type Network = "sepolia" | "base" | "optimism" | "arbitrum";

export interface ListedName {
    label: string
    namehash: string
    price: number
    network: Network
    owner: string
}

export interface MintRequest {
    label: string
    ensName: string
    owner: string
}

export interface MintResponse {
    signature: string
    parameters: {
        label: string
        parentNode: string
        owner: string
        resolver: string
        price: string
        fee: string
        paymentReceiver: string
    }
}