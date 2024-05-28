import { Controller, Get, Param } from "@nestjs/common";
import { SubnamesService } from "src/subnames/subnames.service";

@Controller("/api/v1/names")
export class NamesController {
  constructor(private subnameService: SubnamesService) {}

  @Get("/subname/:label/:parentName")
  public async getSubname(
    @Param("label") label: string,
    @Param("parentName") parentName: string,
  ) {
    return await this.subnameService.getSubname(label, parentName);
  }
}
