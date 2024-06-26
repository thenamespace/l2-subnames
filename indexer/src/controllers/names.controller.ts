import { Controller, Get, Param } from "@nestjs/common";
import { SubnamesService } from "src/subnames/subnames.service";
import { Network } from "src/web3/types";
import { Hash } from "viem";

@Controller("/api/v1/names")
export class NamesController {
  constructor(private subnameService: SubnamesService) {}

  @Get("/subname/:network/:nodeHash")
  public async getSubname(
    @Param("network") network: Network,
    @Param("nodeHash") nodeHash: Hash,
  ) {
    return await this.subnameService.getSubname(network, nodeHash);
  }
}
