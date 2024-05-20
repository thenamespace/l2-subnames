import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AppConfigurationModule } from "./configuration/app-configuration.module";
import { AppConfiguration } from "./configuration/app-configuration";
import { ConfigModule } from "@nestjs/config";
import { StoreModule } from "./store/store.module";
import { Web3Module } from "./web3/web3.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env"]
    }),
    MongooseModule.forRootAsync({
      imports: [AppConfigurationModule],
      useFactory: (config: AppConfiguration) => {
        return {
          uri: config.mongoConnectionString
        }
      },
      inject: [AppConfiguration]
    }), 
    StoreModule, 
    Web3Module
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
