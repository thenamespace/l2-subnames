import axios from "axios";
import { Listing, MintContextResponse } from "./types";
import { Address } from "viem";

const api = import.meta.env.VITE_BACKEND_API;

export const getListings = (name: string): Promise<Listing[]> => {
    return axios.get<Listing[]>(`${api}/api/v0.1.0/listings/${name}`).then(res => res.data);
}

export const getMintingParameters = (subnameLabel: string, parentEnsName: string, owner: Address) => {
    return axios.post<MintContextResponse>(`${api}/api/v0.1.0/mint`, {
        label: subnameLabel,
        ensName: parentEnsName,
        owner: owner,
    }).then(res => res.data);
}