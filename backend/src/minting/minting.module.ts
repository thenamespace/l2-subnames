import { Module } from '@nestjs/common';
import { MintingService } from './minting.service';

@Module({
  providers: [MintingService]
})
export class MintingModule {}
