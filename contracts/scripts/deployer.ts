import { task } from "hardhat/config";

task("getAddresses")
  .addParam("deployer")
  .setAction(async (args, hre) => {
    const deployer = await hre.viem.getContractAt(
      "contracts/v2/NamespaceDeployer.sol:NamespaceDeployer",
      args.deployer
    );

    const registry = await deployer.read.registryAddress();
    console.log("Registry", registry);

    const controller = await deployer.read.controllerAddress();
    console.log("Controller", controller);

    const resolver = await deployer.read.resolverAddress();
    console.log("Resolver", resolver);
  });
