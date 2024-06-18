import { Controller, Get, Param } from "@nestjs/common";
import { SubnamesService } from "src/subnames/subnames.service";
import { Network } from "src/web3/types";

@Controller("/api/v1/names")
export class NamesController {
  constructor(private subnameService: SubnamesService) {}

  @Get("/subname/:network/:label/:parentName")
  public async getSubname(
    @Param("network") network: Network,
    @Param("label") label: string,
    @Param("parentName") parentName: string,
  ) {
    return await this.subnameService.getSubname(network, label, parentName);
  }
}
