import { Controller, Get, Param } from '@nestjs/common';
import { ListedNamesService } from 'src/listed-names/listed-names.service';

@Controller('/l2/listings')
export class ListingController {
  constructor(private listing: ListedNamesService) {}

  @Get()
  public async getListings() {
    return this.listing.getListings();
  }

  @Get('/:label/:domain')
  public async getListing(@Param() label: string, @Param() domain: string) {
    return this.listing.getNameListing(`${label}.${domain}`);
  }

  @Get('/:word')
  public async searchForName(@Param('word') word: string) {
    return this.listing.searchForName(word);
  }
}
