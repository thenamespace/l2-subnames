import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SIGNERS = ["0xEf2c32797724C2572D83Dd69E71c1A821e07FECa"];
const URLS = ["https://multichain-resolver.namespace.tech/resolve/{sender}/{data}.json"]
const OWNER = "0xEf2c32797724C2572D83Dd69E71c1A821e07FECa"

const OffchainResolverModule = buildModule("NamespaceModule", (m) => {
  const offchainResolver = m.contract("OffchainResolver", [SIGNERS, URLS]);

  m.call(offchainResolver, "transferOwnership", [OWNER]);

  return { offchainResolver };
});

export default OffchainResolverModule;