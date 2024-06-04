import { useNavigate, useParams } from "react-router-dom";
import {
  MintSubnameForm,
  ScreenContainer,
} from "../components";
import { Card} from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import "./MintPage.css";
import { getSingleListing } from "../api";
import { Listing } from "../api/types";
import { toast } from "react-toastify";

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
      <div className="mint-page">
        <Card className="mint-page-container">
            <MintSubnameForm listing={listing.item} sponsored={true}/>
        </Card>
      </div>
    </ScreenContainer>
  );
};