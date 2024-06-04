import { useNavigate, useParams } from "react-router-dom";
import {
  MintSubnameForm,
  ScreenContainer,
} from "../components";
import { Card } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import "./MintPage.css";
import { getSingleListing } from "../api";
import { Listing } from "../api/types";
import { toast } from "react-toastify";
import namespaceLogo from "../assets/logo/namespace.png";
import baseLogo from "../assets/logo/base.svg";
import ensLogo from "../assets/logo/ens.png";
import "./MintPageSponsored.css";

const defaultAvatarImg = "https://namespace.fra1.cdn.digitaloceanspaces.com/misc/basedsummer.png";

export const MintPageSponsored = () => {
  const { parentName } = useParams();
  const [listing, setListing] = useState<{
    isFetching: boolean;
    item?: Listing;
  }>({
    isFetching: true,
  });
  const navigate = useNavigate()

  useEffect(() => {
    getSingleListing(parentName as string).then((res) => {
      setListing({
        isFetching: false,
        item: res,
      });
    }).catch(err => {
      console.error(err);
      toast(parentName + " not found", { type: "warning" })
      navigate("/")
    });
  }, []);

  if (listing.isFetching || !listing.item) {
    return <ScreenContainer isLoading={true} />;
  }


  return (
    <ScreenContainer>
      <div className="mint-page d-flex flex-column">
        <Card className="mint-page-container">
            <MintSubnameForm listing={listing.item} basedSummer={true} defaultAvatar={defaultAvatarImg}/>
        <div className="d-flex flex-row justify-content-center align-items-center mt-2">
            <img src={namespaceLogo} width="20px" className="me-2"></img>
            <img src={ensLogo} width="20px" className="me-2"></img>
            <img src={baseLogo} width="20px"></img>
        </div>
        </Card>
      </div>
    </ScreenContainer>
  );
};