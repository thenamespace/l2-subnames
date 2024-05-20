import { Controller, Get } from "@nestjs/common";

@Controller("/api/v1/names")
export class NamesController {
  
  @Get()
  public async getNames() {}
}
