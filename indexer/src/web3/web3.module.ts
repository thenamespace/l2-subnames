import { Module } from "@nestjs/common";
import { AppConfigurationModule } from "src/configuration/app-configuration.module";
import { ControllerListener } from "./listeners/controller.listener";
import { Web3Clients } from "./clients";
import { StoreModule } from "src/store/store.module";

@Module({
  imports: [AppConfigurationModule, StoreModule],
  providers: [Web3Clients, ControllerListener],
})
export class Web3Module {}
