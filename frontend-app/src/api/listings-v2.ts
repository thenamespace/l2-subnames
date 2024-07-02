import { Address, Hash, namehash } from "viem";
import { Web3Network } from "../web3";
import axios from "axios";

const api = import.meta.env.VITE_NAMESPACE_API;
export interface Listing {
  name: string;
  network: Web3Network;
}

export interface ListingOption {
  value: string;
  label: string;
}

export interface MintContext {
  label: string;
  parentLabel: string;
  resolver: Address;
  owner: Address;
  price: string;
  fee: string;
  paymentReceiver: Address;
  resolverData: Hash[];
}

export interface MintContextResponse {
  parameters: MintContext;
  signature: string;
}


export interface NameListing {
   label: string
   fullName: string
   tokenNetwork: Web3Network
   version?: number
}

export interface EnsNameToken {
  isDeployed: boolean
  deployment?: {
    tokenAddress: string
  }
}

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

export const getMintingParametersV2 = (
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

  return axios
    .post<MintContextResponse>(`${api}/api/v1/mint/l2`, req)
    .then((res) => res.data);
};