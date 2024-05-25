import { Controller, Get, Param } from '@nestjs/common';
import { Metadata } from 'src/dto/meta-data.dto';
import { MetadataService } from 'src/metadata/metadata.service';

@Controller('/api/v0.1.0/metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Get('/:tokenId')
  async getMetadata(@Param('tokenId') tokenId: string): Promise<Metadata> {
    return this.metadataService.getMetadata(tokenId);
  }
}
