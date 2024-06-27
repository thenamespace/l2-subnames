import axios from "axios";
import {
  EnsNameToken,
  MintContextResponse,
  NameListing,
} from "./types";
import { Address, namehash } from "viem";
import { Web3Network } from "../web3";

const api = import.meta.env.VITE_BACKEND_API;

export const getListingsV2 = async () => {
  return axios
    .get<{ items: NameListing[] }>(
      `${api}/api/v1/listings/all?network=mainnet&listingType=l2`
    )
    .then((res) => res.data);
};

export const getTokenForListing = (ensName: string, listingNetwork: string) => {
  return axios
    .get<EnsNameToken>(
      `${api}/api/v1/l2/token/${ensName}/network/${listingNetwork}`
    )
    .then((res) => {
        console.log(res.data, "RES DADA HERE!!")
       return res.data;
    });
};

export const getSingleListing = (name: string): Promise<NameListing> => {
  return axios
    .get<NameListing>(
      `${api}/api/v1/listings/single?namehash=${namehash(
        name
      )}&network=mainnet`
    )
    .then((res) => res.data);
};

export const getMintingParameters = (
  subnameLabel: string,
  parentLabel: string,
  owner: Address,
  tokenNetwork: Web3Network
) => {

    const req = {
        label: subnameLabel,
        parentLabel,
        owner,
        mainNetwork: "mainnet",
        tokenNetwork,
    }

    console.log(req, "REQUEST!!")

  return axios
    .post<MintContextResponse>(`${api}/api/v1/mint/l2`, req)
    .then((res) => res.data);
};
