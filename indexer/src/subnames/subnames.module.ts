import { Module } from "@nestjs/common";
import { StoreModule } from "src/store/store.module";
import { SubnamesService } from "./subnames.service";

@Module({
  providers: [SubnamesService],
  exports: [SubnamesService],
  imports: [StoreModule],
})
export class SubnamesModule {}
