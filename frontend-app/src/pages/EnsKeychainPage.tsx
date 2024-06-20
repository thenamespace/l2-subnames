import { Card } from "@ensdomains/thorin";
import { ScreenContainer } from "../components";
import "./EnsKeychainPage.css";
import { EnsKeychainForm } from "../components/EnsKeychainForm";

const BG_IMAGE = "https://namespace.fra1.cdn.digitaloceanspaces.com/misc/keychains.png"

export const EnsKeychainPage = () => {

  return (
    <ScreenContainer bg={BG_IMAGE}>
        <div className="ens-keychain-page">
            <Card className="p-3 content">
             <EnsKeychainForm/>
            </Card>
        </div>
    </ScreenContainer>
  );
};
