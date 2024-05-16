/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  EnsSVG,
  Input,
  MagnifyingGlassSimpleSVG,
  Typography,
} from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useState } from "react";

interface Listing {
  name: string;
}

interface ListingOption {
  value: string;
  label: string;
}

export const MintFormContainer = () => {
  const [listings, setListings] = useState<ListingOption[]>([]);
  const [showListings, setShowlistings] = useState(false);
  const [selectedName, setSelectedName] = useState<string>();
  const [showLabel, setShowLabel] = useState(false);

  function searchNames(evt: any) {
    const name = evt.target.value;
    setSelectedName(name);
    setShowLabel(false);

    if (name === "") {
      setShowlistings(false);
      return;
    }

    axios
      .get(`/l2/listings/${name}`)
      .then((resp) => updateListings(resp.data as Listing[]))
      .catch((err) => {
        console.log(err.response.data.error[0].message);
      });
  }

  function updateListings(listings: Listing[]) {
    const updated = listings.map((l) => {
      return { value: l.name, label: l.name };
    });

    setListings(updated);
    setShowlistings(updated?.length > 0);
  }

  function selectListing(name: string) {
    setShowlistings(false);
    setSelectedName(name);
    setShowLabel(true);
  }

  return (
    <Card>
      <ConnectButton />
      <Typography>Find your name</Typography>
      <div>
        <Input
          label="ENS Name"
          placeholder="0xA0Cf…251e"
          prefix={<EnsSVG />}
          onChange={searchNames}
          value={selectedName}
        />

        {showListings && (
          <Card>
            {listings.map((l) => {
              return (
                <ul>
                  <li
                    key={l.label}
                    className="name-listing"
                    onClick={() => selectListing(l.label)}
                  >
                    {l.label}
                  </li>
                </ul>
              );
            })}
          </Card>
        )}

        {showLabel && (
          <Input
            icon={<MagnifyingGlassSimpleSVG />}
            label="Label"
            placeholder="0xA0Cf…251e"
            suffix={selectedName}
          />
        )}
      </div>
      <Button>Click</Button>
    </Card>
  );
};
