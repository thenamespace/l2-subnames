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
import { getMintingParameters, mintSponsored, mintSponsoredV2 } from "../api";
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
import calmNinjaImg from "../assets/logo/calm-ninja.png";
import happyNinjaImg from "../assets/logo/happy-ninja.png";
import { NameListing, getMintingParametersV2 } from "../api/listings-v2";

const enum MintProcess {
  SelectSubname = 1,
  SelectRecords = 2,
  Mint = 3,
  MintSuccess = 4,
}

const labels: Record<FormVariation, Record<string, string>> = {
  default: {
    your_are_about_to_mint: "You are about to mint",
    start_typing: "Start typing...",
    your_name: "{yourName}",
    congratulations: "Congratulations",
    you_have_minted: "You have successfully minted",
  },
  basesummer: {
    your_are_about_to_mint: "You are about to mint",
    start_typing: "Start typing...",
    your_name: "{yourName}",
    congratulations: "Congratulations",
    you_have_minted: "You have successfully minted",
  },
  musica: {
    your_are_about_to_mint: "Vas a registrar",
    start_typing: "Start typing...",
    your_name: "{usario}",
    congratulations: "Felicitaciones!",
    you_have_minted: "Has registrado",
  },
};

type FormVariation = "default" | "musica" | "basesummer";

export const MintSubnameForm = ({
  listing,
  sponsoredMint,
  defaultAvatar,
  formVariation,
  onMintSuccess,
  version,
}: {
  onMintSuccess?: (tx: Hash) => void;
  onComplete?: () => void;
  listing: NameListing;
  sponsoredMint?: boolean;
  defaultAvatar?: string;
  formVariation?: FormVariation;
  version: number;
}) => {
  const formType = formVariation || "default";
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
  const listingChainId = getChainId(listing.tokenNetwork);
  const publicClient = usePublicClient({ chainId: listingChainId });
  const networkName = listing.tokenNetwork;
  const { isSubnameAvailable } = useNameRegistry(listingChainId);
  const { mint, mintV2, inNodeAvailableV2 } = useNameController();
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

  if (
    listing.fullName === "gotbased.eth" &&
    !window.location.pathname.includes("based-summer")
  ) {
    return <Navigate to="/based-summer/gotbased.eth"></Navigate>;
  }

  if (
    listing.fullName === "musicaw3.eth" &&
    !window.location.pathname.includes("/events/musicaw3")
  ) {
    return <Navigate to="/events/musicaw3"></Navigate>;
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

    let available = false;
    if (version === 1) {
      const fllName = `${subnameLabel}.${listing.fullName}`;
      available = await isSubnameAvailable(fllName);
    } else {
      const parentNode = namehash(listing.fullName);
      available = await inNodeAvailableV2(subnameLabel, parentNode);
    }

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

  const getMintParams = async() => {
    if (version === 2) {
      return await getMintingParametersV2(
        subnameLabel,
        listing.label,
        address as any,
        networkName
      );
    } else {
      return await getMintingParameters(
        subnameLabel,
        listing.fullName,
        address as any,
        networkName
      );
    }
  }

  const handleMint = async () => {
    if (!address) {
      openConnectModal?.();
      return;
    }


    try {
      const _params = await getMintParams() as any;

      try {
        const fllName = `${subnameLabel}.${listing.fullName}`;
        const resolverData = convertRecordsToData(fllName);

        if (resolverData.length === 0) {
          const encodedFunc = getSetAddrFunc(fllName, address as Address);
          _params.parameters.resolverData = [encodedFunc];
        } else {
          _params.parameters.resolverData = resolverData;
        }

        let tx;
        if (sponsoredMint) {
          setMintIndicators({ ...mintIndicators, waitingTx: true });
          if (version === 1) {
            tx = await _mintSponsored(resolverData);
          } else {
            console.log(_params, "MINTING SPONSORED WITH PARAMS")
            tx = await _mintSponsoredV2(_params)
          }

        } else {
          setMintIndicators({ ...mintIndicators, waitingWallet: true });
          if (version === 2) {
            console.log(_params, "MINTING REGULAR WITH PARAMS")
            tx = await mintV2(_params)
          } else {
            tx = await mint(_params);
          }
        }
        console.log("TXHERE" + tx)

        setMintIndicators({ waitingTx: true, waitingWallet: false });
        onMintSuccess?.(tx);
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
      listing.fullName,
      address as any,
      networkName,
      resolverData
    );
  };

  const _mintSponsoredV2 = async (params: any) => {
    return mintSponsoredV2(params)
  }

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

  const formLabels = labels[formType];

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

  const fullName = `${subnameLabel}.${listing.fullName}`;
  if (mode === MintProcess.MintSuccess) {
    return <SuccessScreen formType={formType} fullName={fullName} />;
  }

  if (mode === MintProcess.SelectRecords) {
    return (
      <SetRecordsForm
        isMusica={formType === "musica"}
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
          <Typography>{formLabels.your_are_about_to_mint}</Typography>
          <Typography fontVariant="extraLargeBold" className="mt-1">
            <Typography fontVariant="extraLargeBold" color="blue" asProp="span">
              {subnameLabel}
            </Typography>
            {`.${listing.fullName}`}
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
      {formType === "musica" && (
        <div>
          <div className="d-flex justify-content-center flex-column align-items-center">
            <Typography fontVariant="largeBold">
              Únete a nuestra comunidad! ✨
            </Typography>
          </div>
        </div>
      )}
      {formType === "default" && (
        <>
          <div className="back-icon">
            <Link to="/">
              <LeftArrowSVG />
            </Link>
          </div>
          <Typography fontVariant="large">Find perfect Subname</Typography>
        </>
      )}
      {formType === "basesummer" && (
        <>
          <div className="d-flex justify-content-center flex-column align-items-center">
            <Typography color="grey">☀️ Onchain Summer ☀️</Typography>
            <Typography
              fontVariant="extraLargeBold"
              color="blue"
              className="title"
            >
              GotBased.eth yet?
            </Typography>
            <Typography fontVariant="small" color="grey" className="mt-2">
              Mint free ENS subname and get yourself BASED!
            </Typography>
          </div>
        </>
      )}
      <div className="mt-3 text-align-left" style={{ textAlign: "left" }}>
        {formType === "musica" && (
          <Typography fontVariant="small" className="mb-1">
            👇 Únete a nuestra comunidad registrando tu nombre de usuario único
            de MúsicaW3:
          </Typography>
        )}
        <Typography fontVariant="small" color="grey">
          <Typography asProp="span" color="blue" fontVariant="small">
            {subnameLabel.length > 0 ? subnameLabel : formLabels.your_name}
          </Typography>
          .{listing.fullName}
        </Typography>
        <Input
          error={isTaken && `Name ${fullName} is already taken`}
          size="large"
          value={subnameLabel}
          onChange={(e) => handleLabelChange(e.target.value)}
          placeholder={formLabels.start_typing}
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

const SuccessScreen = ({
  fullName,
  formType,
}: {
  fullName: string;
  formType?: FormVariation;
}) => {
  const type = formType || "default";
  const formLabels = labels[type];

  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-4">
      <img src={happyNinjaImg} width="80px"></img>
      <Typography className="mt-4 mb-2" fontVariant="extraLargeBold">
        {formLabels.congratulations}
      </Typography>
      <Typography className="mb-2">{formLabels.you_have_minted}</Typography>
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
