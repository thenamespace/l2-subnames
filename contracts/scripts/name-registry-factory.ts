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

const types = {
  RegistryContext: [
    { name: "listingName", type: "string" },
    { name: "symbol", type: "string" },
    { name: "ensName", type: "string" },
    { name: "baseUri", type: "string" },
  ],
};

/**
yarn hardhat createName \
--listing-name namespace \
--ens-name namespace \
--symbol namespace \
--uri namespace \
--chain-id 1337 \
--deployer 0x4fefb2d4c6483777290f6e7e1957e36297f1124a \
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

    const message = {
      listingName: args.listingName,
      symbol: args.symbol,
      ensName: args.ensName,
      baseUri: args.uri,
    };

    const signature = await owner.signTypedData({
      domain,
      types,
      message,
      primaryType: "RegistryContext",
    });

    const tx = await factory.write.create([
      args.listingName,
      args.symbol,
      args.ensName,
      args.uri,
      signature,
    ]);

    console.log(tx);
  });
