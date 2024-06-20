import { config as dotEnvConfig } from "dotenv";
import { task } from "hardhat/config";
import { Hash } from "viem";

dotEnvConfig();

type Domain = {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: Hash;
};

// const types = {
//   RegistryContext: [
//     { name: "listingName", type: "string" },
//     { name: "symbol", type: "string" },
//     { name: "ensName", type: "string" },
//     { name: "baseUri", type: "string" },
//   ],
// };

/**
yarn hardhat createName \
--listing-name 101010 \
--ens-name 101010 \
--symbol 101010 \
--uri http://localhost:3000/api/v0.1.0/metadata/11155111/ \
--chain-id 1337 \
--deployer 0x4343db796b79cfee8b461db06c48169e94fd3ee3 \
--network localhost
 */
task("createName")
  .addParam("listingName")
  .addParam("symbol")
  .addParam("ensName")
  .addParam("uri")
  .addParam("chainId")
  .addParam("deployer")
  .setAction(async (args, hre) => {
    const [owner] = await hre.viem.getWalletClients();

    console.log(await owner.getAddresses());

    const deployer = await hre.viem.getContractAt(
      "contracts/v2/NamespaceDeployer.sol:NamespaceDeployer",
      args.deployer
    );

    const factoryAddress = await deployer.read.factoryAddress();
    const factory = await hre.viem.getContractAt(
      "NameRegistryFactory",
      factoryAddress
    );

    const domain: Domain = {
      name: "Namespace",
      version: "1",
      chainId: args.chainId,
      verifyingContract: factory.address,
    };

    const types = {
      RegistryContext: [
        { name: "listingName", type: "string" },
        { name: "symbol", type: "string" },
        { name: "ensName", type: "string" },
        { name: "baseUri", type: "string" },
        { name: "owner", type: "address" },
        { name: "resolver", type: "address" },
        { name: "listingType", type: "uint256" },
      ],
    };

    const resolverAddress = await deployer.read.resolverAddress();

    const message = {
      listingName: args.listingName as string,
      symbol: args.symbol as string,
      ensName: args.ensName as string,
      baseUri: args.uri as string,
      owner: owner.account.address,
      resolver: resolverAddress,
    };

    const signature = await owner.signTypedData({
      domain,
      types,
      message,
      primaryType: "RegistryContext",
    });

    const tx = await factory.write.create([message, signature]);

    console.log(tx);
  });
