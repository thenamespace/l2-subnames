import { Controller, Get, Param } from '@nestjs/common';
import { Metadata } from 'src/dto/meta-data.dto';
import { MetadataService } from 'src/metadata/metadata.service';

@Controller('/api/v0.1.0/metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Get('/:chain/:tokenId')
  async getTokenMetadata(
    @Param('chain') chain: number,
    @Param('tokenId') tokenId: string,
  ): Promise<Metadata> {
    return this.metadataService.getTokenMetadata(chain, tokenId);
  }

  @Get('/:chain/:label/:parentName')
  async getLabelMetadata(
    @Param('chain') chain: number,
    @Param('label') label: string,
    @Param('parentName') parentName: string,
  ): Promise<Metadata> {
    return this.metadataService.getLabelMetadata(chain, label, parentName);
  }
}
