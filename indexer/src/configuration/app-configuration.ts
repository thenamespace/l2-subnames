import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AppConfiguration {
  public mongoConnectionString: string;
  public baseRpcWsUrl: string;
  public sepoliaRpcWsUrl: string;
  public localhostRpcWsUrl: string;
  public supportedChains: string[];

  constructor(config: ConfigService) {
    this.mongoConnectionString = config.getOrThrow("MONGO_CONNECTION_STRING");
    this.baseRpcWsUrl = config.getOrThrow("BASE_RPC_WS_URL");
    this.sepoliaRpcWsUrl = config.getOrThrow("SEPOLIA_RPC_WS_URL");
    this.localhostRpcWsUrl = config.getOrThrow("LOCALHOST_RPC_WS_URL");

    const chains: string = config.getOrThrow("SUPPORTED_CHAINS");
    this.supportedChains = chains.split(",");
  }
}
