import { useAccount, useDisconnect } from "wagmi"
import { NetworkSelector } from "./NetworkSelector"
import "./TopNavigation.css"
import { Profile, Dropdown, } from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import { useWeb3Clients } from "../web3";

export const TopNavigation = () => {

    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const { publicClient } = useWeb3Clients();
    const [ensProfile, setProfile] = useState<{
        avatar?: string
        name?: string
    }>({})

    useEffect(() => {

        if (!address) {
            return;
        }

        const fetchProfile = async () => {
            const ensName = await publicClient?.getEnsName({ address: address })
            let avatar;
            if (ensName) {
                avatar = await publicClient?.getEnsText({ key: "avatar", name: ensName })
            }
            setProfile({
                avatar: avatar || undefined,
                name: ensName || undefined
            })
        }
        fetchProfile()
    }, [address])

    if (!isConnected || !address) {
        return null;
    }

    return <div className="top-navigation">
        <NetworkSelector />
        <Dropdown
            label="asdf"
            items={[
                {
                    label: 'Disconnect',
                    onClick: () => disconnect(),
                    color: 'red',
                },
            ]}>
            <Profile 
                address={address as any} 
                avatar={ensProfile.avatar} 
                ensName={ensProfile.name} />
        </Dropdown>

    </div>
}