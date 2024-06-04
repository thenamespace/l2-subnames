import { Injectable, OnModuleInit } from "@nestjs/common";
import { AppConfig } from "src/config/app-config.service";
import { MintContext } from "src/dto/mint-context.dto";
import { PublicClient, WalletClient, createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";
import CONTORLLER_ABI from "./controller-abi.json";
import { getContracts } from "src/web3/contracts/contract-addresses";

@Injectable()
export class SponsoredBaseMinter implements OnModuleInit {

    private publicClient: PublicClient
    private walletClient: WalletClient

    constructor(private readonly config: AppConfig) {}

    onModuleInit() {
        const walletAcc = privateKeyToAccount(this.config.sponsorWallet as any)
        const publicClient = createPublicClient({
            transport: this.config.baseRpc ? http(this.config.baseRpc) : http(),
            chain: base as any
        })
        
        const walletClient = createWalletClient({
            transport: this.config.baseRpc ? http(this.config.baseRpc) : http(),
            account: walletAcc,
            chain: base as any
        })
        this.publicClient = publicClient as any;
        this.walletClient = walletClient;
    }

    private async execute(params: MintContext, sig: string) {
        const { request } = await this.publicClient.simulateContract({
            abi: CONTORLLER_ABI,
            address: getContracts("base").controller,
            functionName: "mint",
            args: [params, sig]
        })
        return await this.walletClient.writeContract(request);
    }


    public async sponsorMint(params: MintContext, sig: string) {
        try {
            const tx = await this.execute(params, sig);
            console.log(`Succssfully minted ${params.label}.${params.parentLabel}.eth tx ${tx}`)
            return tx;
        } catch(err) {
            console.error(`Error while minting ${params.label}.${params.parentLabel}.eth`)
            console.error(err)
        }
    }
}