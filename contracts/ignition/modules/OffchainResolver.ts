import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SIGNERS = ["0xf4684693F4C78616C6a1391524280fC47C898DBe"];
const URLS = ["https://multichain-ccip-gateway.namespace.tech/resolve/{sender}/{data}.json", "https://multichain-ccip-gateway2.namespace.tech/resolve/{sender}/{data}.json"]
const OWNER = "0x3E1e131E7e613D260F809E6BBE6Cbf7765EDC77f"

const OffchainResolverModule = buildModule("NamespaceModule", (m) => {
  const offchainResolver = m.contract("OffchainResolver", [URLS, SIGNERS]);

  m.call(offchainResolver, "transferOwnership", [OWNER]);

  return { offchainResolver };
});

export default OffchainResolverModule;