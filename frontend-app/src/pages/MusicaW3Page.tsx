import { Navigate } from "react-router-dom";
import { MintSubnameForm, ScreenContainer } from "../components";
import { Card, Typography } from "@ensdomains/thorin";
import "./MintPage.css";
import { L2Listings } from "../api/types";
import namespaceLogo from "../assets/logo/namespace.png";
import baseLogo from "../assets/logo/base.svg";
import ensLogo from "../assets/logo/ens.png";
import musicaw3logo from "../assets/logo/musicaw3logo.png";
import musicaBg from "../assets/musica-bg.png";

const defaultAvatarImg =
  "https://namespace.fra1.cdn.digitaloceanspaces.com/misc/musicaw3logo.png";
const ensName = "musicaw3.eth";

const listing = L2Listings.find(l => l.fullName === ensName);

export const MusicaW3Page = () => {

  if (!listing) {
    return <Navigate to="/"></Navigate>
  }

  return (
    <ScreenContainer bg={musicaBg}>
      <div className="mint-page d-flex flex-column">
        <div className="text-center mb-4">
          <img className="mb-2" src={musicaw3logo} width="140px"></img>
          <Typography style={{ color: "black" }} fontVariant="largeBold">
            Música W3 Presenta
          </Typography>
          <Typography style={{ color: "black" }} fontVariant="largeBold">
            Música Onchain
          </Typography>
        </div>
        <Card className="mint-page-container">
          <MintSubnameForm
            version={2}
            listing={listing}
            sponsoredMint={true}
            formVariation="musica"
            defaultAvatar={defaultAvatarImg}
          />
          <div className="d-flex flex-row justify-content-center align-items-center mt-2">
            <a href="https://namespace.tech" target="_blank">
              <img src={namespaceLogo} width="20px" className="me-2"></img>
            </a>
            <a href="https://ens.domains" target="_blank">
              <img src={ensLogo} width="20px" className="me-2"></img>
            </a>
            <a href="https://www.base.org/" target="_blank">
              <img src={baseLogo} width="20px"></img>
            </a>
          </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};
