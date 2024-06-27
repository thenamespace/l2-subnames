import { useNavigate, useParams } from "react-router-dom";
import {
  ChangeMintNetwork,
  MintSubnameForm,
  ScreenContainer,
} from "../components";
import { Card} from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import "./MintPage.css";
import { getSingleListing } from "../api";
import { NameListing } from "../api/types";
import { useWeb3Network } from "../web3";
import { toast } from "react-toastify";

export const MintPage = () => {
  const { parentName } = useParams();
  const [listing, setListing] = useState<{
    isFetching: boolean;
    item?: NameListing;
  }>({
    isFetching: true,
  });
  const { networkName } = useWeb3Network();
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

  const isProperNetwork = listing.item.tokenNetwork === networkName;

  return (
    <ScreenContainer>
      <div className="mint-page">
        <Card className="mint-page-container">
          <>
            {!isProperNetwork && (
              <ChangeMintNetwork requiredNetwork={listing.item.tokenNetwork} />
            )}
            {isProperNetwork && (
              <MintSubnameForm tokenNetwork={listing.item.tokenNetwork} parentName={parentName as string} />
            )}
          </>
        </Card>
      </div>
    </ScreenContainer>
  );
};