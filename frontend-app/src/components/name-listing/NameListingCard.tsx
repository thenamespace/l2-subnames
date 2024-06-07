/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Card,
  EnsSVG,
  Input,
  Toast,
  Typography,
} from "@ensdomains/thorin";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import axios from "axios";
import { useEffect, useState } from "react";
import { Address } from "viem";
import { useAccount, useSignTypedData } from "wagmi";
import { useWeb3Network } from "../../web3";
import "./NameListingCard.css";

type ListingContext = {
  name: string;
  price: bigint;
  paymentReceiver: Address;
};

type Domain = {
  name: string;
  version: string;
  chainId: number;
};

const types = {
  ListContext: [
    { name: "name", type: "string" },
    { name: "price", type: "uint256" },
    { name: "paymentReceiver", type: "address" },
  ],
};

export const NameListingCard = () => {
  const { address, chainId } = useAccount();
  const [selectedName, setSelectedName] = useState("");
  const [price, setPrice] = useState(BigInt(0));
  const [isError, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isListing, setListing] = useState(false);
  const [listingDone, setListingDone] = useState(false);
  const [domain, setDomain] = useState<Domain>();
  const [message, setMessage] = useState<ListingContext>();
  const [readyToList, setReadyToList] = useState(false);
  const { networkName } = useWeb3Network();
  const {
    data: signature,
    isError: errorSigning,
    isSuccess: signingSucceeded,
    signTypedDataAsync,
  } = useSignTypedData();

  useEffect(() => {
    if (chainId) {
      setDomain({
        name: "Namespace",
        version: "1",
        chainId,
      });
    }
  }, [chainId]);

  useEffect(() => {
    if (signingSucceeded) {
      addListing();
    }
  }, [signingSucceeded]);

  async function onNameChange(evt: any) {
    const name = evt.target.value;
    setSelectedName(name);

    const isFullName =
      name && name.length > 0 ? /.{3,}\.eth$/.test(name) : false;

    if (isFullName) {
      const verified = await axios.get(
        `http://localhost:3000/api/v0.1.0/listings/verify/${name}?lister=${address}`
      );

      const hasOwnerPermission = verified.data.hasOwnerPermission;
      setReadyToList(hasOwnerPermission);

      if (hasOwnerPermission) {
        setMessage({
          name,
          paymentReceiver: address as Address,
          price,
        });
      }
    } else {
      setReadyToList(false);
    }
  }

  function onPriceChange(evt: any) {
    const price = evt.target.value;
    setPrice(BigInt(price));

    if (message) {
      setMessage({ ...message, price });
    }
  }

  function handleError(error: any) {
    setError(true);
    if (error.response?.data) {
      setErrorMsg(error.response.data.message);
    } else if (error.message) {
      setErrorMsg(error.message);
    }
  }

  function handleErrorToastClosed() {
    setError(false);
    setListingDone(false);
  }

  function handleListingDone() {
    setListing(false);
    setListingDone(true);
    setReadyToList(false);
  }

  async function onListName() {
    if (message) {
      await signTypedDataAsync({
        account: address,
        domain,
        types,
        primaryType: "ListContext",
        message,
      });
    }
  }

  function addListing() {
    axios
      .post(
        `http://localhost:3000/api/v0.1.0/listings/${address}`,
        {
          name: selectedName,
          price: price.toString(),
          network: networkName,
          owner: address,
          paymentReceiver: address,
        },
        {
          headers: {
            Authorization: signature,
          },
        }
      )
      .then(handleListingDone);
  }

  return (
    <div>
      <ConnectButton />
      <Card className="name-listing-form">
        <Typography>List your name</Typography>
        <div>
          <div className="listing-input">
            <Input
              label="ENS Name"
              placeholder="Start typing an ENS name.."
              prefix={<EnsSVG />}
              onChange={onNameChange}
              value={selectedName}
              disabled={isListing}
            />
          </div>
          <div className="listing-input">
            <Input
              label=""
              placeholder="Set the price.."
              onChange={onPriceChange}
              value={price?.toString()}
              disabled={isListing}
            />
          </div>
        </div>

        {readyToList && (
          <Button onClick={onListName} disabled={isListing || listingDone}>
            List
          </Button>
        )}

        {listingDone && !isError && (
          <div className="listed-name-confirmation">
            <Typography>{`Congrats! You have successfully listed ${selectedName}`}</Typography>
          </div>
        )}
      </Card>

      <Toast
        open={isError}
        title="Error"
        description="Signup failed due to the error below."
        variant="desktop"
        onClose={handleErrorToastClosed}
        msToShow={3600000}
      >
        <div>
          <Typography>
            <pre className="toast-error-message">
              {errorMsg && errorMsg.length > 0 ? errorMsg : "Transaction error"}
            </pre>
          </Typography>
        </div>
      </Toast>
    </div>
  );
};
