import { Injectable } from '@nestjs/common';
import { NameListing } from 'src/dto/name-listing.dto';
import listings from 'src/listed-names/listings.json';

@Injectable()
export class ListedNamesService {
  public async getListings(): Promise<NameListing[]> {
    return listings as NameListing[];
  }

  public async getNameListing(name: string): Promise<NameListing> {
    return listings.find((l) => l.name === name) as NameListing;
  }

  public async searchForName(word: string): Promise<NameListing[]> {
    return listings.filter((l) => l.name.includes(word)) as NameListing[];
  }
}
