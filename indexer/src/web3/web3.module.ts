import { Module } from "@nestjs/common";
import { AppConfigurationModule } from "src/configuration/app-configuration.module";

@Module({
    imports: [AppConfigurationModule]
})
export class Web3Module {}