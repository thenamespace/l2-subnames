import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfiguration {
    public mongoConnectionString: string
    public baseRpcWsUrl: string
    public sepoliaRpcWsUrl: string

    constructor(config: ConfigService) {
        this.mongoConnectionString = config.getOrThrow("MONGO_CONNECTION_STRING")
        this.baseRpcWsUrl = config.getOrThrow("BASE_RPC_WS_URL")
        this.sepoliaRpcWsUrl = config.getOrThrow("SEPOLIA_RPC_WS_URL")
    }
}