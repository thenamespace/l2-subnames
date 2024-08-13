import { Injectable, OnModuleInit } from "@nestjs/common";
import { create } from "domain";
import { AppProperties } from "src/configuration/app-properties";
import { SupportedNetwork } from "src/types";
import { PublicClient, createPublicClient, http } from "viem";
import { base, baseSepolia, sepolia } from "viem/chains";

@Injectable()
export class Web3Clients implements OnModuleInit {
    
    private clients: Record<SupportedNetwork, PublicClient>

    constructor(private readonly config: AppProperties) {}
    
    onModuleInit() {
        const sepoliaClient = createPublicClient({
            transport: this.config.sepoliaRPC ? http(this.config.sepoliaRPC) : http(),
            chain: sepolia
        })
        const baseClient = createPublicClient({
            transport: this.config.baseRPC ? http(this.config.baseRPC) : http(),
            chain: base
        })
        const baseSepoliaClient = createPublicClient({
            transport: this.config.baseSepoliaRPC ? http(this.config.baseSepoliaRPC) : http(),
            chain: baseSepolia
        })
        this.clients = {
            base: baseClient,
            sepolia: sepoliaClient,
            baseSepolia: baseSepoliaClient
        }
    }

    public getClient(network: SupportedNetwork) {
        return this.clients[network];
    }
}