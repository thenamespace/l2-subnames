import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SUBNAME_NODE_DOMAIN, SubnameNodeSchema } from "./db/subname-node.schema";
import { SubnameNodeRepository } from "./db/subname-node.repository";
import { MongoStorageService } from "./mongo-storage.service";

@Module({
    imports: [
        MongooseModule.forFeature([
          {
            schema: SubnameNodeSchema,
            name: SUBNAME_NODE_DOMAIN,
          },
        ]),
      ],
    providers: [SubnameNodeRepository, MongoStorageService],
    exports: [MongoStorageService]
})
export class StoreModule {}