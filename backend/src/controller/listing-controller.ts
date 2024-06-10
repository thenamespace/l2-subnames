import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import { ListedNamesService } from 'src/listed-names/listed-names.service';
import { Address, Hash } from 'viem';

@Controller('/api/v0.1.0/listings')
export class ListingController {
  constructor(private listing: ListedNamesService) {}

  @Get()
  public async getListings() {
    return this.listing.getListings();
  }

  @Get('/:name')
  public async getListing(@Param('name') name: string) {
    return this.listing.getNameListing(name);
  }

  @Get('/validate/:name')
  public async validateNameListing(
    @Param('name') name: string,
    @Query('lister') lister: Address,
  ): Promise<{ hasOwnerPermission: boolean }> {
    return await this.listing.validateNameListing(name, lister);
  }

  @Post('/:lister')
  public async addListing(
    @Param('lister') lister: Address,
    @Body() listing: NameListing,
    @Headers('Authorization') signature: Hash,
  ) {
    return this.listing.addListing(lister, signature, listing);
  }
}
