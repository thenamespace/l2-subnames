import { Module } from '@nestjs/common';
import { AppConfigModule } from 'src/config/config.module';
import { MetadataService } from './metadata.service';

@Module({
  providers: [MetadataService],
  exports: [MetadataService],
  imports: [AppConfigModule],
})
export class MetadataModule {}
