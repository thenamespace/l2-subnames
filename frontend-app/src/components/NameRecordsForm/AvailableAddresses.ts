import { AvailableAddressRecord } from "./Types"

// ETH, BTC, SOL, ARB, OP, BASE, MATIC, AVAX, CELO, FTM, NEAR, ZORA
export const availableAddresses: Record<string, AvailableAddressRecord> = {
    "ETH": { 
        coinType: 60,
        isValid: () => { return true},
        chainName: "ETH"
    },
    "BTC": { 
        coinType: 0,
        isValid: () => { return true},
        chainName: "BTC"
    },
    "BASE": { 
        coinType: 2147492101,
        isValid: () => { return true},
        chainName: "BASE"
    },
    "SOL": { 
        coinType: 501,
        isValid: () => { return true},
        chainName: "SOL"
    },
    "ARB": { 
        coinType: 2147525809,
        isValid: () => { return true},
        chainName: "ARB"
    },
    "OP": { 
        coinType: 2147483658,
        isValid: () => { return true},
        chainName: "OP"
    },
    "ZORA": { 
        coinType: 2155261425,
        isValid: () => { return true},
        chainName: "ZORA"
    },
    "MATIC": {
        coinType: 2155261425,
        isValid: () => { return true},
        chainName: "MATIC"
    }
}

export const getAvailableAddrByCoin = (coinType: number):AvailableAddressRecord | undefined => {
    for (const addr of Object.keys(availableAddresses)) {
        const current = availableAddresses[addr];
        if (current.coinType === coinType) {
            return current;
        }
    }
}