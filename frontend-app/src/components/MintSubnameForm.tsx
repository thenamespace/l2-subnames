import {
  Typography,
  Input,
  Button,
  Spinner,
  LeftArrowSVG,
} from "@ensdomains/thorin";
import { useCallback, useEffect, useState } from "react";
import { normalize } from "viem/ens";
import { getChainId, useNameRegistry } from "../web3";
import { getMintingParameters, mintSponsored } from "../api";
import { useAccount, usePublicClient } from "wagmi";
import { useNameController } from "../web3/useNameController";
import { debounce } from "lodash";
import { Link, Navigate } from "react-router-dom";
import { Address, Hash, encodeFunctionData, isAddress, namehash } from "viem";
import NAME_RESPOLVER_ABI from "../web3/abi/name-resolver-abi.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { SetRecordsForm } from "./MintRecordsForm";
import { toast } from "react-toastify";
import { NameRecords } from "./NameRecordsForm";
import "./MintSubnameForm.css";
import { Listing } from "../api/types";
import calmNinjaImg from "../assets/logo/calm-ninja.png";
import happyNinjaImg from "../assets/logo/happy-ninja.png";

const enum MintProcess {
  SelectSubname = 1,
  SelectRecords = 2,
  Mint = 3,
  MintSuccess = 4,
}

export const MintSubnameForm = ({
  listing,
  basedSummer,
  defaultAvatar,
}: {
  listing: Listing;
  basedSummer?: boolean;
  defaultAvatar?: string;
}) => {
  const [subnameLabel, setSubnameLabel] = useState("");

  const [nameRecords, setNameRecords] = useState<NameRecords>({
    addresses: [],
    texts: [],
  });
  const { address } = useAccount();
  const [addrAdded, setAddrAdded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // we want to add eth address record by default
    // but only once, if user removes it we don't want to add it again
    if (address) {
      if (
        nameRecords.addresses.find((addr) => addr.coinType === 60) ||
        addrAdded[address]
      ) {
        return;
      } else {
        setNameRecords({
          ...nameRecords,
          addresses: [
            ...nameRecords.addresses,
            { coinType: 60, value: address },
          ],
        });
        setAddrAdded({ ...addrAdded, [address]: true });
      }
    }
  }, [address, nameRecords, addrAdded]);

  // const { networkName: currentNetwork } = useWeb3Network();
  const listingChainId = getChainId(listing.network);
  const publicClient = usePublicClient({chainId: listingChainId})
  const networkName = listing.network;
  const { isSubnameAvailable } = useNameRegistry(listingChainId);
  const { mint } = useNameController();
  const [mintIndicators, setMintIndicators] = useState<{
    waitingWallet: boolean;
    waitingTx: boolean;
  }>({
    waitingTx: false,
    waitingWallet: false,
  });
  const [indicators, setIndicators] = useState<{
    isChecking: boolean;
    isAvailable: boolean;
  }>({
    isAvailable: false,
    isChecking: false,
  });

  const { openConnectModal } = useConnectModal();
  const [mode, setMode] = useState<MintProcess>(MintProcess.SelectSubname);

  if (listing.name === "gotbased.eth" && !window.location.pathname.includes("based-summer")) {
    return <Navigate to="/based-summer/gotbased.eth"></Navigate>
  }

  const handleLabelChange = (value: string) => {
    const _value = value.toLocaleLowerCase();

    if (_value.includes(".")) {
      return;
    }
    try {
      normalize(_value);
    } catch (err) {
      // invalid value
      return;
    }
    setSubnameLabel(_value);

    setIndicators({ ...indicators, isChecking: true });
    debouncedCheckAvailable(_value);
  };

  const debouncedCheckAvailable = useCallback(
    debounce((subnameLabel: string) => {
      checkAvailable(subnameLabel);
    }, 300),
    []
  );

  const checkAvailable = async (subnameLabel: string) => {
    if (subnameLabel.length === 0) {
      setIndicators({ isAvailable: false, isChecking: false });
      return;
    }

    const fllName = `${subnameLabel}.${listing.name}`;
    const available = await isSubnameAvailable(fllName);
    setIndicators({ isAvailable: available, isChecking: false });
  };

  const convertRecordsToData = (fullSubname: string) => {
    const node = namehash(fullSubname);
    const { texts, addresses } = nameRecords;
    const data: Hash[] = [];
    if (addresses.length > 0) {
      addresses.forEach((addr) => {
        // todo check values for different chains
        if (!isAddress(addr.value)) {
          return;
        }
        const coinType = BigInt(addr.coinType);

        data.push(
          encodeFunctionData({
            abi: NAME_RESPOLVER_ABI,
            args: [node, coinType, addr.value],
            functionName: "setAddr",
          })
        );
      });
    }

    if (texts.length > 0) {
      texts.forEach((text) => {
        if (!text.value || text.value.length === 0) {
          return;
        }

        data.push(
          encodeFunctionData({
            abi: NAME_RESPOLVER_ABI,
            args: [node, text.key, text.value],
            functionName: "setText",
          })
        );
      });
    }

    if (defaultAvatar && defaultAvatar.length) {
      data.push(
        encodeFunctionData({
          abi: NAME_RESPOLVER_ABI,
          args: [node, "avatar", defaultAvatar],
          functionName: "setText",
        })
      );
    }

    return data;
  };

  const handleSetRecords = async () => {
    if (!address) {
      openConnectModal?.();
      return;
    }
    setMode(MintProcess.SelectRecords);
  };

  const handleMint = async () => {
    if (!address) {
      openConnectModal?.();
      return;
    }

    try {
      const _params = await getMintingParameters(
        subnameLabel,
        listing.name,
        address as any,
        networkName
      );

      try {
        const fllName = `${subnameLabel}.${listing.name}`;
        const resolverData = convertRecordsToData(fllName);

        if (resolverData.length === 0) {
          const encodedFunc = getSetAddrFunc(fllName, address as Address);
          _params.parameters.resolverData = [encodedFunc];
        } else {
          _params.parameters.resolverData = resolverData;
        }

        let tx;
        if (basedSummer) {
          setMintIndicators({ ...mintIndicators, waitingTx: true });
            tx = await _mintSponsored(resolverData);
        } else {
          setMintIndicators({ ...mintIndicators, waitingWallet: true });
          tx = await mint(_params);
        }

        setMintIndicators({ waitingTx: true, waitingWallet: false });
        await publicClient?.waitForTransactionReceipt({
          hash: tx,
          confirmations: 2,
        });
        setMode(MintProcess.MintSuccess);
      } catch (err: any) {
        if (err.details && err.details.includes("insufficient funds for gas")) {
          toast("Insufficient ETH balance.", { type: "warning" });
        } else if (err.details && err.details.includes("User denied")) {
          // do nothing, signature denied
        } else {
          toast("Error ocurred. Check console for more info", {
            type: "error",
          });
        }
      }
    } catch (err: any) {
      console.error(err);
      toast("Error ocurred. Check console for more info", { type: "error" });
    } finally {
      setMintIndicators({ waitingTx: false, waitingWallet: false });
    }
  };

  const _mintSponsored = async (resolverData: Hash[]) => {
    return await mintSponsored(
      subnameLabel,
      listing.name,
      address as any,
      networkName,
      resolverData
    );
  };

  const getSetAddrFunc = (fullName: string, wallet: Address) => {
    return encodeFunctionData({
      abi: NAME_RESPOLVER_ABI,
      functionName: "setAddr",
      args: [namehash(fullName), wallet],
    });
  };

  const handleNameRecordsSaved = (value: NameRecords) => {
    setNameRecords(value);
  };

  const isTaken =
    !indicators.isChecking &&
    !indicators.isAvailable &&
    subnameLabel.length > 0;

  const mintBtnLoading =
    mintIndicators.waitingTx || mintIndicators.waitingWallet;
  const isMintBtnDisabled =
    subnameLabel.length === 0 ||
    indicators.isChecking ||
    !indicators.isAvailable ||
    mintBtnLoading;

  let mintBtnLabel = "Mint";
  if (mintIndicators.waitingTx) {
    mintBtnLabel = "Waiting for tx";
  } else if (mintIndicators.waitingWallet) {
    mintBtnLabel = "Waiting for wallet";
  }

  const fullName = `${subnameLabel}.${listing.name}`;
  if (mode === MintProcess.MintSuccess) {
    return <SuccessScreen fullName={fullName} />;
  }

  if (mode === MintProcess.SelectRecords) {
    return (
      <SetRecordsForm
        nameRecords={nameRecords}
        setNameRecords={(v) => {
          handleNameRecordsSaved(v);
        }}
        onRecordsSelected={() => setMode(MintProcess.Mint)}
        onBack={() => setMode(MintProcess.SelectSubname)}
      />
    );
  }

  if (mode === MintProcess.Mint) {
    return (
      <div>
        <div className="mb-3 text-center">
          <img src={calmNinjaImg} width="100px" className="mb-3"></img>
          <Typography>
            You are about to mint
          </Typography>
          <Typography fontVariant="extraLargeBold" className="mt-1">
            <Typography fontVariant="extraLargeBold" color="blue" asProp="span">
              {subnameLabel}
            </Typography>
            {`.${listing.name}`}
          </Typography>
        </div>
        <div className="d-flex">
          {!mintBtnLoading && (
            <Button
              className="me-2"
              colorStyle="blueSecondary"
              onClick={() => setMode(MintProcess.SelectRecords)}
            >
              Back
            </Button>
          )}
          <Button
            onClick={() => handleMint()}
            loading={mintBtnLoading}
            disabled={isMintBtnDisabled}
          >
            {mintBtnLabel}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center mint-subname-form">
      {!basedSummer && (
        <>
          <div className="back-icon">
            <Link to="/">
              <LeftArrowSVG />
            </Link>
          </div>
          <Typography fontVariant="large">Find perfect Subname</Typography>
        </>
      )}
      {basedSummer && <>
        <div className="d-flex justify-content-center flex-column align-items-center">
             <Typography color="grey">☀️ Onchain Summer ☀️</Typography>
             <Typography fontVariant="extraLargeBold" color="blue" className="title">GotBased.eth yet?</Typography>
        </div>
      </>}
      <div className="mt-3 text-align-left" style={{ textAlign: "left" }}>
        <Typography fontVariant="small" color="grey">
          <Typography asProp="span" color="blue">{subnameLabel.length > 0 ? subnameLabel : "{yourName}"}</Typography>.{listing.name}
        </Typography>
        <Input
          error={isTaken && `Name ${fullName} is already taken`}
          size="large"
          value={subnameLabel}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="Start typing..."
          label=""
          suffix={indicators.isChecking ? <Spinner /> : null}
        ></Input>
      </div>
      <div className="mt-3 d-flex">
        <Button disabled={isMintBtnDisabled} onClick={() => handleSetRecords()}>
          Next
        </Button>
      </div>
    </div>
  );
};

const SuccessScreen = ({ fullName }: { fullName: string }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-4">
      <img src={happyNinjaImg} width="80px"></img>
      <Typography className="mt-4 mb-2" fontVariant="extraLargeBold">Congratulations</Typography>
      <Typography className="mb-2">You have successfully minted</Typography>
      <Typography fontVariant="extraLargeBold" color="blue">
        {fullName}
      </Typography>
      <div className="d-flex mt-3">
        <Link to="/">
          <Button
            colorStyle="accentSecondary"
            className="me-2"
            style={{ width: 150 }}
          >
            Back
          </Button>
        </Link>
        <a href={`https://app.ens.domains/${fullName}`} target="_blank">
          <Button style={{ width: 150 }}>Check on ENS</Button>
        </a>
      </div>
    </div>
  );
};
