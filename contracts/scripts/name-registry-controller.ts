import { time } from "@nomicfoundation/hardhat-network-helpers";
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
  MintContext: [
    { name: "label", type: "string" },
    { name: "parentLabel", type: "string" },
    { name: "resolver", type: "address" },
    { name: "owner", type: "address" },
    { name: "price", type: "uint256" },
    { name: "fee", type: "uint256" },
    { name: "paymentReceiver", type: "address" },
  ],
};

/**
yarn hardhat mintSubname \
--label 123 \
--parent-label namespace \
--resolver 0x8FADE66B79cC9f707aB26799354482EB93a5B7dD \
--owner 0xEf2c32797724C2572D83Dd69E71c1A821e07FECa \
--payment-receiver 0xEf2c32797724C2572D83Dd69E71c1A821e07FECa \
--deployer 0x4fefb2d4c6483777290f6e7e1957e36297f1124a \
--chain-id 1337 \
--network localhost
 */
task("mintSubname")
  .addParam("label")
  .addParam("parentLabel")
  .addParam("resolver")
  .addParam("owner")
  .addParam("paymentReceiver")
  .addParam("deployer")
  .addParam("chainId")
  .setAction(async (args, hre) => {
    const [owner] = await hre.viem.getWalletClients();

    console.log(owner.account.address);

    const deployer = await hre.viem.getContractAt(
      "NamespaceDeployer",
      args.deployer
    );

    const controllerAddress = await deployer.read.controllerAddress();
    const controller = await hre.viem.getContractAt(
      "contracts/v2/NameRegistryController.sol:NameRegistryController",
      controllerAddress
    );

    console.log("controllerAddress", controllerAddress);

    const blockTime = await time.latest();

    const message = {
      label: args.label,
      parentLabel: args.parentLabel,
      resolver: args.resolver,
      owner: args.owner,
      price: BigInt(10000),
      fee: BigInt(0),
      paymentReceiver: args.paymentReceiver,
    };

    const domain: Domain = {
      name: "Namespace",
      version: "1",
      chainId: args.chainId,
      verifyingContract: controller.address,
    };

    const signature = await owner.signTypedData({
      domain,
      types,
      message,
      primaryType: "MintContext",
    });

    const mintContext = {
      ...message,
      resolverData: [] as Hash[],
    };

    const minted = await controller.write.mint([mintContext, signature], {
      value: message.price,
    });

    console.log("minted ->", minted);
  });
