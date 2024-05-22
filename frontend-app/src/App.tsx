import { WalletConnect, ThorinDesign } from "./components";
import { MintFormContainer } from "./components/mint-form/MintFormContainer";

function App() {

  return (
    <WalletConnect>
      <ThorinDesign>
         <div>
           <MintFormContainer/>
         </div>
      </ThorinDesign>
    </WalletConnect>
  );
}


export default App;