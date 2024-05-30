import {
  Typography,
  Input,
  Button,
  Spinner,
  LeftArrowSVG,
  Toggle,
  Card,
} from "@ensdomains/thorin";
import { useCallback, useMemo, useState } from "react";
import { normalize } from "viem/ens";
import { useNameRegistry, useWeb3Clients, useWeb3Network } from "../web3";
import { getMintingParameters } from "../api";
import { useAccount } from "wagmi";
import { useNameController } from "../web3/useNameController";
import { debounce } from "lodash";
import { Link } from "react-router-dom";
import "./MintSubnameForm.css";
import { Address, Hash, encodeFunctionData, isAddress, namehash } from "viem";
import NAME_RESPOLVER_ABI from "../web3/abi/name-resolver-abi.json";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import logoImage from "../assets/logo/namespace.png";
import { SetRecordsForm } from "./MintRecordsForm";
import { toast } from "react-toastify";
import { NameRecords, getAvailableAddrByCoin } from "./NameRecordsForm";

type MintFormMode = "mint" | "setRecords";

export const MintSubnameForm = ({ parentName }: { parentName: string }) => {
  const [subnameLabel, setSubnameLabel] = useState("");

  const [nameRecords, setNameRecords] = useState<NameRecords>({
    addresses: [],
    texts: [],
  });
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
    setMode("setRecords");
  };

  const { selectedTexts, selectedAddr } = useMemo(() => {
    let _texts = "";
    let _addr = "";

    const { texts, addresses } = nameRecords;
    texts.forEach((t) => {
      if (t.value.length > 0) {
        _texts += t.key + ", ";
      }
    });
    addresses.forEach((addr) => {
      if (isAddress(addr.value)) {
        const addrData = getAvailableAddrByCoin(addr.coinType);
        if (addrData) {
          _addr += addrData.chainName + ", ";
        }
      }
    });
    return { selectedTexts: _texts, selectedAddr: _addr };
  }, [nameRecords]);

  const handleMint = async () => {
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
        const fllName = `${subnameLabel}.${parentName}`;
        const resolverData = convertRecordsToData(fllName);
        setMintIndicators({ ...mintIndicators, waitingWallet: true });

        if (resolverData.length === 0) {
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
      } catch (err: any) {
        console.log(err, "DETAILS");
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

    const hasETHAddr = value.addresses.find(addr => addr.coinType === 60);
    if (hasETHAddr) {
      setSetAddr(true);
    } else {
      setSetAddr(false);
    }

    setNameRecords(value);
  }

  const onSetAddrChanged = () => {
    if (!setAddr) {
      setSetAddr(true);
      setNameRecords({
        ...nameRecords,
        addresses: [...nameRecords.addresses, { coinType: 60, value: address as string}]
      })
    } else {
      setSetAddr(false);
      setNameRecords({
        ...nameRecords,
        addresses: nameRecords.addresses.filter(arr => arr.coinType !== 60)
      })
    }
  }

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
      <SetRecordsForm
        nameRecords={nameRecords}
        setNameRecords={(v) => {
          handleNameRecordsSaved(v);
        }}
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
            onClick={() => onSetAddrChanged()}
          ></Toggle>
        </div>
      </Card>
      <div className="mt-2" style={{textAlign:"left"}}>
        {selectedAddr.length > 0 && (
          <Typography
            fontVariant="extraSmall"
            color="grey"
          >{`Address records set: ${selectedAddr}`}</Typography>
        )}
        {selectedTexts.length > 0 && (
          <Typography
            fontVariant="extraSmall"
            color="grey"
          >{`Text records set: ${selectedTexts}`}</Typography>
        )}
      </div>
      <div className="mt-3 d-flex">
        <Button
          loading={mintBtnLoading}
          className="me-3"
          disabled={isMintBtnDisabled}
          onClick={() => handleMint()}
        >
          {mintBtnLabel}
        </Button>
        {!mintBtnLoading && (
          <Button
            colorStyle="blueGradient"
            disabled={isMintBtnDisabled}
            onClick={() => handleSetRecords()}
          >
            Set Records
          </Button>
        )}
      </div>
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
        <a href={`https://app.ens.domains/${fullName}`} target="_blank">
          <Button style={{ width: 150 }}>Check on ENS</Button>
        </a>
      </div>
    </div>
  );
};
