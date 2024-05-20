import { Module } from "@nestjs/common";
import { AppConfiguration } from "./app-configuration";

@Module({
    exports: [AppConfiguration]
})
export class AppConfigurationModule {}