import { Module } from "@nestjs/common";
import { Web3Clients } from "./web3-clients";

@Module({
    exports: [Web3Clients],
    providers: [Web3Clients]
})
export class Web3Module {}