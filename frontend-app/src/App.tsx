import { WalletConnect, ThorinDesign } from "./components";
import { MintFormContainer } from "./components/mint-form/MintFormContainer";
import { NameSelectorPage } from "./pages/NameSelectorPage";

function App() {

  return (
    <WalletConnect>
      <ThorinDesign>
         <NameSelectorPage/>
      </ThorinDesign>
    </WalletConnect>
  );
}


export default App;