import { AppRouter } from "./AppRouter";
import { WalletConnect, ThorinDesign } from "./components";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {

  return (
    <WalletConnect>
      <ThorinDesign>
         <AppRouter/>
      </ThorinDesign>
    </WalletConnect>
  );
}


export default App;