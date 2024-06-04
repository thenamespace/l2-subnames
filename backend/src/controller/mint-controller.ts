import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { MintingService } from 'src/minting/minting.service';
import { MintRequest, MintResponse } from 'src/dto/types';
import { SponsoredBaseMinter } from 'src/minting/sponsored-minter';

@Controller("/api/v0.1.0/mint")
export class MintController {
  constructor(private mintService: MintingService, private sponsoredMinter: SponsoredBaseMinter) {}

  @Post()
  public async mint(@Body() req: MintRequest): Promise<MintResponse> {
    return this.mintService.verifySubnameMint(req);
  }

  @Post("/sponsored")
  public async mintSponsored(@Body() req: MintRequest): Promise<string> {

    if (req.network !== "base") {
      throw new BadRequestException("Unsupported network");
    }

    const { parameters, signature } = await this.mintService.verifySubnameMint(req);
    parameters.resolverData = req.resolverData;
    
    return await this.sponsoredMinter.sponsorMint(parameters, signature);

  }
}
