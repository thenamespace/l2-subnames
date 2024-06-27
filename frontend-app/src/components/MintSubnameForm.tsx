import {
  Typography,
  Input,
  Button,
  Spinner,
  LeftArrowSVG,
} from "@ensdomains/thorin";
import { useCallback, useEffect, useState } from "react";
import { normalize } from "viem/ens";
import { Web3Network, useWeb3Clients } from "../web3";
import { getMintingParameters, getTokenForListing } from "../api";
import { useAccount } from "wagmi";
import { useNameController } from "../web3/useNameController";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import { Address, Hash, encodeFunctionData, isAddress, namehash } from "viem";
import NAME_RESPOLVER_ABI from "../web3/abi/name-resolver-abi.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import logoImage from "../assets/logo/namespace.png";
import { SetRecordsForm } from "./MintRecordsForm";
import { toast } from "react-toastify";
import { NameRecords } from "./NameRecordsForm";
import "./MintSubnameForm.css";
import { EnsNameToken } from "../api/types";

const enum MintProcess {
  SelectSubname = 1,
  SelectRecords = 2,
  Mint = 3,
  MintSuccess = 4,
}

export const MintSubnameForm = ({ parentName, tokenNetwork }: { parentName: string, tokenNetwork: Web3Network }) => {
  const [subnameLabel, setSubnameLabel] = useState("");

  const [nameRecords, setNameRecords] = useState<NameRecords>({
    addresses: [],
    texts: [],
  });
  const { address } = useAccount();
  const [addrAdded] = useState<Record<string, boolean>>({});
  //@ts-ignore
  const [nameToken, setNameToken] = useState<EnsNameToken>();

  useEffect(() => {
    // we want to add eth address record by default
    // but only once, if user removes it we don't want to add it again
    getTokenForListing(parentName, tokenNetwork).then(res => {
      setNameToken(res);
    })
  }, [address, nameRecords, addrAdded]);

  const { publicClient } = useWeb3Clients();
  const { mint, isNodeAvailable } = useNameController();
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

    const parentNode = namehash(parentName);
    const available = await isNodeAvailable(subnameLabel, parentNode, tokenNetwork as any);
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
      const parentLabel = parentName.split(".")[0];
      const _params = await getMintingParameters(
        subnameLabel,
        parentLabel,
        address as any,
        tokenNetwork
      );

  
      try {
        const fllName = `${subnameLabel}.${parentName}`;
        const resolverData = convertRecordsToData(fllName);
        setMintIndicators({ ...mintIndicators, waitingWallet: true });

        if (resolverData.length === 0) {
          const encodedFunc = getSetAddrFunc(fllName, address as Address);
          _params.parameters.resolverData = [encodedFunc];
        } else {
          _params.parameters.resolverData = resolverData;
        }

        //@ts-ignore
        const tx = await mint(_params, tokenNetwork);
        setMintIndicators({ waitingTx: true, waitingWallet: false });
        await publicClient?.waitForTransactionReceipt({
          hash: tx,
          confirmations: 2,
        });
        setMode(MintProcess.MintSuccess);
      } catch (err: any) {
        console.log(err)
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

  const fullName = `${subnameLabel}.${parentName}`;
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
          <Typography style={{textAlign:"left"}} fontVariant="extraLarge">Minting</Typography>
          <img src={logoImage} width="80px" className="mb-3"></img>
          <Typography fontVariant="small" color="grey">You are about to mint</Typography>
          <Typography fontVariant="largeBold" className="mt-1">
            <Typography fontVariant="extraLargeBold" color="blue" asProp="span">
              {subnameLabel}
            </Typography>
            {`.${parentName}`}
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
      <div className="back-icon">
        <Link to="/">
          <LeftArrowSVG />
        </Link>
      </div>
      <Typography fontVariant="large">Find perfect Subname</Typography>
      <Typography fontVariant="largeBold" className="mt-1">
        <Typography
          style={{ marginRight: -5 }}
          fontVariant="largeBold"
          color="blue"
          asProp="span"
        >
          {subnameLabel.length > 0 ? subnameLabel : "{yourName}"}{" "}
        </Typography>
        {`.${parentName}`}
      </Typography>
      <div className="mt-3 text-align-left" style={{ textAlign: "left" }}>
        <Typography fontVariant="small" color="grey">
          Your subname
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
        <Button
          colorStyle="blueGradient"
          disabled={isMintBtnDisabled}
          onClick={() => handleSetRecords()}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

const SuccessScreen = ({ fullName }: { fullName: string }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-4">
      <img src={logoImage} width="80px"></img>
      <Typography className="mt-4">You have successfully minted</Typography>
      <Typography fontVariant="largeBold" color="blue">
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
