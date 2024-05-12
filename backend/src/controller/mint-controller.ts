import { Controller, Post } from '@nestjs/common';
import { MintingService } from 'src/minting/minting.service';
import { MintRequest, MintResponse } from 'src/dto/types';

@Controller()
export class MintController {
  constructor(private mintService: MintingService) {}

  @Post('/l2/subname/mint')
  public async mint(req: MintRequest): Promise<MintResponse> {
    return this.mintService.verifySubnameMint(
      req.label,
      req.ensName,
      req.owner,
    );
  }
}
