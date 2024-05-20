import { Injectable } from "@nestjs/common";
import { Web3Clients } from "../clients";

@Injectable()
export class RegistryListener {

  constructor(private readonly clients: Web3Clients) {}

  private initialize() {
    const publicClient = this.clients.getClient("sepolia");

    publicClient.getLogs();
  }

  private listen = () => {};
}
