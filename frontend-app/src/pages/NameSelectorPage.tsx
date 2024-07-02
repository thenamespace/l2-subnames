import { useEffect, useState } from "react";
import { ScreenContainer } from "../components";
import { Button, Card, Typography } from "@ensdomains/thorin";
import { ListedNameCard } from "../components/select-names/ListedNameCard";
import "./NameSelectorPage.css";
import { Link } from "react-router-dom";
import { NameListing, getListingsV2 } from "../api/listings-v2";
import { L2Listings } from "../api/types";

export const NameSelectorPage = () => {
  const [listedNames, setListedNames] = useState<{
    isFetching: boolean;
    items: NameListing[];
  }>({
    isFetching: true,
    items: [],
  });
  const [selectedName, setSelectedName] = useState<NameListing | null>(null);

  useEffect(() => {
    getListingsV2().then((res) => {
      // this mess is a temp fix until we migrate all to V2
      const allListings = [...res.items];
      const listingMap: Record<string, boolean> = {};
      allListings.forEach((l) => {
        listingMap[l.fullName] = true;
      });
      L2Listings.forEach((listing) => {
        if (!listingMap[listing.fullName]) {
          allListings.push(listing);
        }
      });
      setListedNames({ items: allListings, isFetching: false });
    });
  }, []);

  if (listedNames.isFetching) {
    return <ScreenContainer isLoading={true} />;
  }

  return (
    <ScreenContainer>
      <div className="name-selector-page">
        <Card className="name-page-card">
          <div>
            <Typography fontVariant="extraLarge">Select name</Typography>
            <Typography fontVariant="small" color="grey">
              Select under which name you want to mint subnames
            </Typography>
          </div>
          <div className="row no-gutters">
            {listedNames.items.map((i) => (
              <div
                onClick={() => setSelectedName(i)}
                className="col col-lg-6 card-container p-1"
                key={i.fullName}
              >
                <ListedNameCard
                  active={selectedName?.fullName === i.fullName}
                  name={i.fullName}
                  network={i.tokenNetwork}
                />
              </div>
            ))}
          </div>
          {selectedName && (
            <Link to={`/mint/${selectedName.fullName}`}>
              <Button className="mt-4">Next</Button>
            </Link>
          )}
        </Card>
      </div>
    </ScreenContainer>
  );
};
