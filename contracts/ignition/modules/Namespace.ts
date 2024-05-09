import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const VERIFIER = "0x3E1e131E7e613D260F809E6BBE6Cbf7765EDC77f";
const TREASURY = "0x3E1e131E7e613D260F809E6BBE6Cbf7765EDC77f";
const OWNER_ADDRESS = "0x3E1e131E7e613D260F809E6BBE6Cbf7765EDC77f";

const NamespaceModule = buildModule("NamespaceModule", (m) => {
    const registry = m.contract("NameRegistry", []);
    const controller = m.contract("NameRegistryController",[VERIFIER, TREASURY, registry])

    m.call(registry, "setController", [controller, true])
    m.call(registry, "transferOwnership", [OWNER_ADDRESS])
    m.call(controller, "transferOwnership", [OWNER_ADDRESS])

    const resolver = m.contract("NameResolver", [registry])

    return { registry, controller, resolver };
})


export default NamespaceModule;
