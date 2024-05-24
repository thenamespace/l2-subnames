import { useParams } from "react-router-dom"
import { ChangeMintNetwork, MintSubnameForm, ScreenContainer } from "../components";
import { Card } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import "./MintPage.css";
import { getSingleListing } from "../api";
import { Listing } from "../api/types";
import { useNameRegistry, useWeb3Network } from "../web3";
import { normalize } from "viem/ens";

export const MintPage = () => {

    const { parentName } = useParams();
    const [setSubnameLabel] = useState("");
    const [listing, setListing] = useState<{
        isFetching: boolean
        item?: Listing
    }>({
        isFetching: true,
    })
    const { isSubnameAvailable } = useNameRegistry();
    const { networkName } = useWeb3Network();

    useEffect(() => {

        getSingleListing(parentName as string).then(res => {
            setListing({
                isFetching: false,
                item: res
            })
        })
    }, [])

    if (listing.isFetching || !listing.item) {
        return <ScreenContainer isLoading={true} />
    }

    const isProperNetwork = listing.item.network === networkName;

    return <ScreenContainer>
        <div className="mint-page">
            <Card className="mint-page-container">
                {!isProperNetwork && <ChangeMintNetwork requiredNetwork={listing.item.network} />}
                {isProperNetwork && <MintSubnameForm parentName={parentName as string} />}
            </Card>
        </div>
    </ScreenContainer>
}