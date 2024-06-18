import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import {
  SUBNAME_NODES_DOMAIN,
  SubnameNodesSchema,
} from "./db/subname-node.schema";
import { SubnameNodeRepository } from "./db/subname-node.repository";
import { MongoStorageService } from "./mongo-storage.service";
import { AppConfigurationModule } from "src/configuration/app-configuration.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        schema: SubnameNodesSchema,
        name: SUBNAME_NODES_DOMAIN,
      },
    ]),
    AppConfigurationModule,
  ],
  providers: [SubnameNodeRepository, MongoStorageService],
  exports: [MongoStorageService],
})
export class StoreModule {}
