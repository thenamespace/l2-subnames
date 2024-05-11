import { Module } from '@nestjs/common';
import { ListedNamesService } from './listed-names.service';

@Module({
  providers: [ListedNamesService],
})
export class ListedNamesModule {}
