import { Module } from "@nestjs/common";
import { AppConfigurationModule } from "src/configuration/app-configuration.module";
import { StoreModule } from "src/store/store.module";
import { Web3Clients } from "./clients";
import { ControllerListener } from "./listeners/controller.listener";
import { ResolverListener } from "./listeners/resolver.listener";

@Module({
  imports: [AppConfigurationModule, StoreModule],
  providers: [Web3Clients, ControllerListener, ResolverListener],
})
export class Web3Module {}
