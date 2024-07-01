import {
  Controller,
  Get,
  Injectable,
  Logger,
  OnModuleInit,
  Param,
} from '@nestjs/common';
import {namehash, parseAbiItem,toHex } from 'viem';
import { RpcClient } from './rpc-client';
import { getContracts } from './contracts/contract-addresses';

const DEFAULT_IMAGE = "https://namespace.fra1.cdn.digitaloceanspaces.com/misc/basedsummer.png";
const NameMintedAbi = parseAbiItem(
    'event NameMinted(string label,string parentLabel,bytes32 subnameNode,bytes32 parentNode,address owner,uint256 price,uint256 fee,address paymentReceiver)',
  )

@Injectable()
export class MetadataService implements OnModuleInit {
  private cache: Record<string, { name: string; description: string, image: string }> = {};

  constructor(private readonly clients: RpcClient) {}

  async onModuleInit() {
    const { controller, resolver } = getContracts('base');
    const client = this.clients.getPublicClient('base');
    const logs = await client.getLogs({
      address: controller,
      event: NameMintedAbi,
      fromBlock: BigInt(12353354 - 1000),
    });

    const _tempCache = {};
    for (const log of logs) {
      const { label, parentLabel } = log.args;
      const fullName = `${label}.${parentLabel}.eth`;
      const hash = namehash(fullName);
      let avatar = '';

      try {
        avatar = await client.readContract({
          abi: [parseAbiItem('function text(bytes32,string) returns(string)')],
          address: resolver,
          args: [hash, 'avatar'],
          functionName: 'text',
        });
      } catch (err) {
        console.error(err, "ERROR FETCHING AVATAR");
      }
      _tempCache[hash] = {
        name: fullName,
        description: "Based subname!",
        image: avatar || DEFAULT_IMAGE,
      }
    }
    this.cache = _tempCache;

    try {
        client.watchContractEvent({
            abi:[NameMintedAbi],
            eventName: "NameMinted",
            address: controller,
            pollingInterval: 50000,
            onLogs: async (receivedLogs) => {
                for (const log of receivedLogs) {
                    const { label, parentLabel } = log.args;
                    const fullName = `${label}.${parentLabel}.eth`;
                    const hash = namehash(fullName);
                    let avatar = '';
              
                    try {
                      avatar = await client.readContract({
                        abi: [parseAbiItem('function text(bytes32,string) returns(string)')],
                        address: resolver,
                        args: [hash, 'avatar'],
                        functionName: 'text',
                      });
                    } catch (err) {
                      console.error(err, "ERROR FETCHING AVATAR");
                    }
                    
                   this.cache[hash] = {
                    name: fullName,
                    description: "Based subname!",
                    image: avatar || DEFAULT_IMAGE,
                  }
                  }
            }
        })
    } catch(err) {
        Logger.error("ERROR WHILE SUBSCRIBING", err)
    }
  }


  public async resolve(token: string, network: string) {
    const namehash = toHex(BigInt(token))
    if (network === "base") {
        return this.cache[namehash]
    }
    return {
        name: "Based subname",
        image: DEFAULT_IMAGE
    }
  }
}

@Controller('/ens')
export class TempMetadataController {
  constructor(private readonly metadataService: MetadataService) {}

  @Get('/:network/:tokenId')
  public async resolve(
    @Param('network') network: string,
    @Param('tokenId') token: string,
  ) {
    return this.metadataService.resolve(token, network);
  }
}
