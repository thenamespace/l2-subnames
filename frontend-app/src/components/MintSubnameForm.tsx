import {
  Typography,
  Input,
  Button,
  Spinner,
  LeftArrowSVG,
  Toggle,
  Card,
} from "@ensdomains/thorin";
import { useCallback, useState } from "react";
import { normalize } from "viem/ens";
import { useNameRegistry, useWeb3Clients, useWeb3Network } from "../web3";
import { getMintingParameters } from "../api";
import { useAccount } from "wagmi";
import { useNameController } from "../web3/useNameController";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import "./MintSubnameForm.css";
import { Address, Hash, encodeFunctionData, isAddress, namehash} from "viem";
import NAME_RESPOLVER_ABI from "../web3/abi/name-resolver-abi.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import logoImage from "../assets/logo/namespace.png";
import { MintRecordsForm, RecordsUpdateInput } from "./MintRecordsForm";

type MintFormMode = "mint" | "setRecords";

export const MintSubnameForm = ({ parentName }: { parentName: string }) => {
  const [subnameLabel, setSubnameLabel] = useState("");

  const { networkName } = useWeb3Network();
  const { publicClient } = useWeb3Clients();
  const { isSubnameAvailable } = useNameRegistry();
  const { mint } = useNameController();
  const { address } = useAccount();
  const [setAddr, setSetAddr] = useState(false);
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
  //@ts-ignore
  const [mintSuccess, setMintSuccess] = useState(false);
  const { openConnectModal } = useConnectModal();
  const [mode, setMode] = useState<MintFormMode>("mint");

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

    const fllName = `${subnameLabel}.${parentName}`;
    const available = await isSubnameAvailable(fllName);
    setIndicators({ isAvailable: available, isChecking: false });
  };

  const handleMintWithRecords = async (recordsUpdate: RecordsUpdateInput) => {
    const fullSubname = `${subnameLabel}.${parentName}`;
    const node = namehash(fullSubname);

    const { baseAddr, ethAddr, texts } = recordsUpdate;

    const resolverData: Hash[] = [];
    if (baseAddr && isAddress(baseAddr)) {
      resolverData.push(encodeFunctionData({
        abi: NAME_RESPOLVER_ABI,
        functionName: "setAddr",
        args: [node, BigInt(2147492101), baseAddr]
      }))
    }

    if (ethAddr && isAddress(ethAddr)) {
      resolverData.push(
        encodeFunctionData({
          abi: NAME_RESPOLVER_ABI,
          functionName: "setAddr",
           args: [node, BigInt(60), ethAddr]
        })
      );
    }

    if (texts && texts.length > 0) {
      texts.forEach((textRecord) => {
        const textData = encodeFunctionData({
          abi: NAME_RESPOLVER_ABI,
          functionName: "setText",
          args: [node, textRecord.key, textRecord.value],
        });
        resolverData.push(textData);
      });
    }
    handleMint(resolverData);
  };

  const handleMint = async (resolverData: any[] = []) => {
    if (!address) {
      openConnectModal?.();
      return;
    }

    try {
      const _params = await getMintingParameters(
        subnameLabel,
        parentName,
        address as any,
        networkName
      );
      try {
        setMintIndicators({ ...mintIndicators, waitingWallet: true });

        if (resolverData.length === 0) {
          const fllName = `${subnameLabel}.${parentName}`;
          const encodedFunc = getSetAddrFunc(fllName, address as Address);
          _params.parameters.resolverData = [encodedFunc];
        } else {
          _params.parameters.resolverData = resolverData;
        }

        const tx = await mint(_params);
        setMintIndicators({ waitingTx: true, waitingWallet: false });
        await publicClient?.waitForTransactionReceipt({
          hash: tx,
          confirmations: 2,
        });
        setMintSuccess(true);
      } catch (err) {
        console.log(err);
      }
    } catch (err) {
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
  if (mintSuccess) {
    return <SuccessScreen fullName={fullName} />;
  }

  if (mode === "setRecords") {
    return (
      <MintRecordsForm
        onMint={(records) => handleMintWithRecords(records)}
        onBack={() => setMode("mint")}
      />
    );
  }

  return (
    <div className="text-center mint-subname-form">
      <div className="back-icon">
        <Link to="/">
          <LeftArrowSVG />
        </Link>
      </div>
      <Typography>Minting</Typography>
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
          error={isTaken && "Subname is taken"}
          size="large"
          value={subnameLabel}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder="Start typing..."
          label=""
          suffix={indicators.isChecking ? <Spinner /> : null}
        ></Input>
      </div>
      <Card className="p-3 mt-2">
        <div className="d-flex align-items-center justify-content-between w-100">
          <Typography fontVariant="small" color="grey">
            Set address record
          </Typography>
          <Toggle
            size="small"
            checked={setAddr}
            onClick={() => setSetAddr(!setAddr)}
          ></Toggle>
        </div>
      </Card>
      <Button
        loading={mintBtnLoading}
        className="mt-3"
        disabled={isMintBtnDisabled}
        onClick={() => handleMint()}
      >
        {mintBtnLabel}
      </Button>
      {/* {!mintBtnLoading && <Button
        disabled={isMintBtnDisabled}
        onClick={() => setMode("setRecords")}
      >
        Mint with records
      </Button>} */}
    </div>
  );
};

export const SuccessScreen = ({ fullName }: { fullName: string }) => {
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
        <a href={`https://app.ens.domains/${fullName}`}>
          <Button style={{ width: 150 }}>Check on ENS</Button>
        </a>
      </div>
    </div>
  );
};
