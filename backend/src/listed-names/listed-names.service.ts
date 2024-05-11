import { Injectable } from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import listings from 'src/listed-names/listings.json';

@Injectable()
export class ListedNamesService {
  public async getNameListing(name: string): Promise<NameListing> {
    return listings.find((l) => l.name === name) as NameListing;
  }
}
