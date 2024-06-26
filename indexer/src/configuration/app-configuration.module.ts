import { Module } from "@nestjs/common";
import { AppConfiguration } from "./app-configuration";

@Module({
  providers: [AppConfiguration],
  exports: [AppConfiguration],
})
export class AppConfigurationModule {}
