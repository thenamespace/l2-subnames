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
import { useEffect, useState } from "react";

interface Listing {
  name: string;
}

export const MintFormContainer = () => {
  const [listings, setListings] = useState<Listing[]>();

  useEffect(() => {
    getListings();
  }, []);

  function getListings() {
    axios
      .get("/l2/listings")
      .then((resp) => setListings(resp.data))
      .catch((err) => {
        console.log(err.response.data.error[0].message);
      });
  }

  function searchNames(evt: any) {
    axios
      .get(`/l2/listings/${evt.target.value}`)
      .then((resp) => console.log(evt.target.value))
      .catch((err) => {
        console.log(err.response.data.error[0].message);
      });
  }

  return (
    <Card>
      <ConnectButton />
      <Typography>Find your name</Typography>
      <div>
        <Input
          icon={<MagnifyingGlassSimpleSVG />}
          label="ENS Name"
          placeholder="0xA0Cf…251e"
          prefix={<EnsSVG />}
          onChange={searchNames}
        />
        <Input
          icon={<MagnifyingGlassSimpleSVG />}
          label="Label"
          placeholder="0xA0Cf…251e"
          prefix={<EnsSVG />}
        />
      </div>
      <Button>Click</Button>
    </Card>
  );
};
