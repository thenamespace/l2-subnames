import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppProperties {

    public rpcUrl: string
    public signerWallet: string

    constructor(private readonly configService: ConfigService) {
        this.rpcUrl = this.configService.getOrThrow("RPC_URL");
        this.signerWallet = this.configService.getOrThrow("SIGNER_WALLET");

    }
}