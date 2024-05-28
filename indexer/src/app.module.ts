import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppConfiguration } from "./configuration/app-configuration";
import { AppConfigurationModule } from "./configuration/app-configuration.module";
import { NamesController } from "./controllers/names.controller";
import { StoreModule } from "./store/store.module";
import { SubnamesModule } from "./subnames/subnames.module";
import { Web3Module } from "./web3/web3.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"],
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigurationModule],
      useFactory: (config: AppConfiguration) => {
        return {
          uri: config.mongoConnectionString,
        };
      },
      inject: [AppConfiguration],
    }),
    StoreModule,
    Web3Module,
    SubnamesModule,
  ],
  controllers: [NamesController],
})
export class AppModule {}
