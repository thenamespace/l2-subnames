import { ListedName, MintRequest } from "../types";
import LISTINGS from "./listings.json";

class MintingController {

    public mintSubname = (mintRequest: MintRequest) => {
        const name = this.getListingByName(mintRequest.ensName);
        if (!name) {
            return null;
        }
    }

    public getListedNames = () => {
        return LISTINGS as ListedName[]
    }

    public getListingByName = (name: string): ListedName | undefined => {
        return this.getListedNames().find(i => i.label === name);
    }
}