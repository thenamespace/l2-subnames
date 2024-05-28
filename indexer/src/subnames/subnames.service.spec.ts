import { Test, TestingModule } from "@nestjs/testing";
import { SubnamesService } from "./subnames.service";

describe("SubnamesService", () => {
  let service: SubnamesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubnamesService],
    }).compile();

    service = module.get<SubnamesService>(SubnamesService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
