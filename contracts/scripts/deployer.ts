import { task } from "hardhat/config";

task("getAddresses")
  .addParam("deployer")
  .setAction(async (args, hre) => {
    const deployer = await hre.viem.getContractAt(
      "contracts/v2/NamespaceDeployer.sol:NamespaceDeployer",
      args.deployer
    );

    const factory = await deployer.read.factoryAddress();
    console.log("Factory", factory);

    const controller = await deployer.read.controllerAddress();
    console.log("Controller", controller);

    const resolver = await deployer.read.resolverAddress();
    console.log("Resolver", resolver);
  });

// sepolia
// Factory 0x06ab6E2888698863429984e73068bc36975FCC65
// Controller 0xF43a2BcF22E60c7c2c2CB9C0722eFd5bda25C65a
// Resolver 0x7426090CDC024e99a10aC5754ca72f360306E007

// localhost
// Factory 0xD4CDFC67d30320F0d063E388Fab204c6692d797f
// Controller 0xFa47f74919Fe432B7e4dB77D4ff05637729D7632
// Resolver 0x90Ffc4e37E1C1a88F4d3F5b082769F1E1EB1ff42
