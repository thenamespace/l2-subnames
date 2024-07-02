import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ChangeMintNetwork,
  MintSubnameForm,
  ScreenContainer,
} from "../components";
import { Card } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import "./MintPage.css";
import { NameListing, getSingleListing } from "../api/listings-v2";
import { L2Listings } from "../api/types";
import { useWeb3Network } from "../web3";
import { toast } from "react-toastify";

export const MintPage = () => {
  const { parentName } = useParams();
  const [listing, setListing] = useState<{
    isFetching: boolean;
    item?: NameListing;
    version: number;
  }>({
    isFetching: true,
    version: 1,
  });
  const { networkName } = useWeb3Network();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    getSingleListing(parentName as string)
      .then((res) => {
        console.log(res, "RES!!")
        setListing({
          isFetching: false,
          item: res,
          version: 2,
        });
      })
      .catch(() => {
        const oldListing = L2Listings.find((l) => l.fullName === parentName);
        if (oldListing) {
          setListing({
            isFetching: false,
            item: oldListing,
            version: 1,
          });
        } else {
          toast(parentName + " not found", { type: "warning" });
          navigate("/");
        }
      });
  }, []);

  if (location.pathname.includes("/mint/enskeychain")) {
    return <Navigate to="/enskeychain"></Navigate>;
  }

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
            {isProperNetwork && <MintSubnameForm listing={listing.item} version={listing.version} />}
          </>
        </Card>
      </div>
    </ScreenContainer>
  );
};
