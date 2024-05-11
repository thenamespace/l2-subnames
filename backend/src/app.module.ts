import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ListedNamesModule } from './listed-names/listed-names.module';
import { MintingModule } from './minting/minting.module';

@Module({
  imports: [ListedNamesModule, MintingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
