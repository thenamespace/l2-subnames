import { useAccount } from "wagmi";
import { WalletConnect, ThorinDesign, ScreenContainer } from "./components";
import { MintFormContainer } from "./components/mint-form/MintFormContainer";
import { ConnectPage } from "./pages/ConnectPage";
import { ProfilePage } from "./pages/ProfilePage";

function App() {

  return (
    <WalletConnect>
      <ThorinDesign>
         <AppContext/>
      </ThorinDesign>
    </WalletConnect>
  );
}

function AppContext() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return <ConnectPage/>
  }

  return <ProfilePage/>
}

export default App;
