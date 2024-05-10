import { Card, Typography, Button } from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export const MintFormContainer = () => {
    return <Card>
        <ConnectButton/>
        <Typography>Find your name</Typography>
        <Button>Click</Button>
    </Card>
}