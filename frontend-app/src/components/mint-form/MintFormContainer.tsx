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
import { useEffect, useState } from "react";

interface Listing {
  name: string;
}

export const MintFormContainer = () => {
  const [listings, setListings] = useState<Listing[]>();

  useEffect(() => {
    getListings();
  });

  function getListings() {
    axios
      .get("http://localhost:3000/l2/listings")
      .then((resp) => setListings(resp.data))
      .catch((err) => {
        console.log(err.response.data.error[0].message);
      });
  }

  return (
    <Card>
      <ConnectButton />
      <Typography>Find your name</Typography>
      <Input
        icon={<MagnifyingGlassSimpleSVG />}
        label="ENS Name"
        placeholder="0xA0Cf…251e"
        prefix={<EnsSVG />}
      />
      <Button>Click</Button>
    </Card>
  );
};
