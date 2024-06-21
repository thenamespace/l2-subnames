import {
  Button,
  Card,
  Helper,
  Input,
  Select,
  Spinner,
  Typography,
} from "@ensdomains/thorin";
import { useCallback, useEffect, useMemo, useState } from "react";
import { http, useAccount, useSwitchChain } from "wagmi";
import { createEnsPublicClient } from "@ensdomains/ensjs";
import { mainnet } from "viem/chains";
import "./KeychainFrom.css";
import { useNameController, useNameRegistry, useWeb3Clients } from "../../web3";
import { Address, Hash, encodeFunctionData, isAddress, namehash } from "viem";
import { debounce } from "lodash";
import { normalise } from "@ensdomains/ensjs/utils";
import { SetRecordsForm } from "../MintRecordsForm";
import { NameRecords } from "../NameRecordsForm";
import { getMintingParameters, sendEmail } from "../../api";
import RESOLVER_ABI from "../../web3/abi/name-resolver-abi.json";
import { toast } from "react-toastify";
import { base } from "viem/chains";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import baseLogo from "../../assets/logo/base.svg";
import happyNinja from "../../assets/logo/happy-ninja.png";
import { Link } from "react-router-dom";
import { fetchGraphNames } from "./subgraph";

const BASE_CHAIN_ID = 8453;
const KEYCHAIN_ENS_NAME = "enskeychain.eth";

const ensClient = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
});

interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
  name: string
}

enum RegStep {
  SelectName = 0,
  SetEmail = 1,
  ShippingInfo = 2,
  Review = 3,
  MintSubname = 4,
  Success = 5,
}

export const EnsKeychainForm = () => {
  const { address, chain } = useAccount();
  const [faq, setFaq] = useState(false);
  const [email, setEmail] = useState("");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: "",
    city: "",
    country: "",
    postalCode: "",
    name: ""
  });
  const [regStep, setRegStep] = useState<RegStep>(RegStep.SelectName);
  const [selectedName, setSelectedName] = useState<string>("");
  const [allNames, setAllNames] = useState<{
    fetching: boolean;
    items: string[];
  }>({
    fetching: true,
    items: [],
  });
  const [subnameLabel, setSubnameLabel] = useState("");

  const Questions = () => {
    return (
      <div
        className="text-center"
        style={{ cursor: "pointer" }}
        onClick={() => setFaq(true)}
      >
        <Typography color="accent" fontVariant="extraSmall">
          Frequently Asked Questions
        </Typography>
      </div>
    );
  };
  const handleTxSent = (tx: string) => {
    sendEmail({
      email: email,
      ensName: selectedName,
      shippingInfo: shippingInfo,
      transaction: tx
    }).catch(err => {
      console.log(err, "ERR WHILE SENDING EMAIL")
    })
  }


  useEffect(() => {
    if (address) {
      fetchGraphNames(address).then((result) => {
        setAllNames({
          fetching: false,
          items: result,
        });
      }).catch(err => {
        console.error(err);
        toast("An error ocurred while fetching ENS names")
        setAllNames({
          fetching: false,
          items: []
        })
      });
    }
  }, [address]);

  if (!chain || chain.id !== base.id) {
    return <EnsureBaseChain/>
  }

  if (allNames.fetching) {
    return <Spinner size="large"/>;
  }

  if (faq) {
    return <FaQ back={() => setFaq(false)} />;
  }

  if (regStep === RegStep.SelectName) {
    return (
      <>
        <SelectName
          selectedName={selectedName}
          onNext={() => setRegStep(regStep + 1)}
          nameOptions={allNames.items}
          onNameSelect={(val) => setSelectedName(val)}
        ></SelectName>
        <Questions />
      </>
    );
  }

  if (regStep === RegStep.SetEmail) {
    return (
      <>
        <SetEmail
          value={email}
          setEmail={(v) => setEmail(v)}
          next={() => setRegStep(regStep + 1)}
          back={() => setRegStep(regStep - 1)}
        />
        <Questions />
      </>
    );
  }

  if (regStep === RegStep.ShippingInfo) {
    return (
      <>
        <ShippingInformation
          onBack={() => setRegStep(regStep - 1)}
          onNext={() => setRegStep(regStep + 1)}
          setShippingInfo={(val) => setShippingInfo(val)}
          shippingInfo={shippingInfo}
        />
        <Questions />
      </>
    );
  }

  if (regStep === RegStep.Review) {
    return (
      <>
        <ReviewTab
          shipping={shippingInfo}
          ensName={selectedName}
          back={() => setRegStep(regStep - 1)}
          next={() => setRegStep(regStep + 1)}
        />
        <Questions />
      </>
    );
  }

  if (regStep === RegStep.MintSubname) {
    return (
      <MintSubname
        txSent={(tx) => handleTxSent(tx)}
        label={subnameLabel}
        setLabel={(v) => setSubnameLabel(v)}
        back={() => setRegStep(regStep - 1)}
        next={() => setRegStep(regStep + 1)}
      />
    );
  }

  if (regStep === RegStep.Success) {
    return <SuccessScreen fullName={`${subnameLabel}.${KEYCHAIN_ENS_NAME}`} keychainName={selectedName}/>
  }

  return (
    <div>
      <Typography>Mint a subname to pay</Typography>
      <div>
        <Typography>Shipping information</Typography>
        <Input size="small" labelSecondary="Address" label=""></Input>
        <Input size="small" labelSecondary="City" label=""></Input>
      </div>
    </div>
  );
};

const SelectName = ({
  selectedName,
  nameOptions,
  onNameSelect,
  onNext,
}: {
  selectedName?: string;
  onNext: () => void;
  nameOptions: string[];
  onNameSelect: (val: string) => void;
}) => {
  const options = nameOptions.map((name) => {
    return {
      value: name,
      label: name,
    };
  });

  return (
    <div>
      <div className="mb-3">
        <Typography fontVariant="largeBold">
        ENS Name for the Keychain
        </Typography>
        <Typography fontVariant="small" color="grey">
          Pick any ENS Name you own for the Keychain. :)
        </Typography>
      </div>
      {options.length === 0 && <Helper className="mt-2 mb-2">
          <Typography>You don't own any ENS names</Typography>
          <Typography fontVariant="small">Switch to other address or <a href={`https://app.ens.domains`} style={{color:"blue"}} target="_blank">
          Register some
            </a></Typography>
        </Helper>}
      {options.length > 0 && <Select
        labelSecondary="Your keychain name"
        className="mb-3"
        autocomplete
        label=""
        value={selectedName}
        inputSize={{
          min: 1,
          max: 10,
        }}
        onChange={(val) => onNameSelect(val.target.value)}
        options={options}
        rows={3}
        tabIndex={2}
      />}
      <Button
        disabled={!selectedName || selectedName.length === 0}
        onClick={() => onNext()}
      >
        Next
      </Button>
    </div>
  );
};

export const ShippingInformation = ({
  shippingInfo,
  setShippingInfo,
  onBack,
  onNext,
}: {
  shippingInfo: ShippingInfo;
  setShippingInfo: (val: ShippingInfo) => void;
  onBack: () => void;
  onNext: () => void;
}) => {
  const handleInput = (key: keyof ShippingInfo, value: string) => {
    const _info = { ...shippingInfo };
    _info[key] = value;
    setShippingInfo(_info);
  };

  const { address, city, country, postalCode, name } = shippingInfo;

  const buttonDisabled =
    [address, city, country, postalCode, name].find((i) => i.length === 0) !==
    undefined;

  return (
    <div>
      <Typography fontVariant="largeBold">
        Where should we send your ENS keychain?
      </Typography>
      <Typography fontVariant="small" color="grey">
        Everything necessary for an international shipment. Your privacy is
        valued, after shipping all info is deleted
      </Typography>
      <div className="mb-2">
        <Input
          className="mb-2"
          placeholder="ex. John Doe"
          label=""
          labelSecondary="Your name"
          value={shippingInfo.name}
          onChange={(e) => handleInput("name", e.target.value)}
        ></Input>
      </div>
      <div className="mb-2">
        <Input
          className="mb-2"
          placeholder="Postal code"
          label=""
          labelSecondary="Postal code"
          value={shippingInfo.postalCode}
          onChange={(e) => handleInput("postalCode", e.target.value)}
        ></Input>
      </div>
      <div className="mb-2">
        <Input
          className="mb-2"
          label=""
          placeholder="Example St. 20"
          labelSecondary="Address"
          value={shippingInfo.address}
          onChange={(e) => handleInput("address", e.target.value)}
        ></Input>
      </div>
      <div className="mb-2">
        <Input
          className="mb-2"
          label=""
          placeholder="ex. New York"
          labelSecondary="City"
          value={shippingInfo.city}
          onChange={(e) => handleInput("city", e.target.value)}
        ></Input>
      </div>
      <div className="mb-2">
        <Input
          className="mb-2"
          label=""
          placeholder="ex. Japan"
          labelSecondary="Country"
          value={shippingInfo.country}
          onChange={(e) => handleInput("country", e.target.value)}
        ></Input>
      </div>
      <div className="mt-3 d-flex">
        <Button
          onClick={() => onBack()}
          className="me-2"
          colorStyle="accentSecondary"
        >
          Back
        </Button>
        <Button disabled={buttonDisabled} onClick={() => onNext()}>
          Next
        </Button>
      </div>
    </div>
  );
};

export const ReviewTab = ({
  shipping,
  ensName,
  next,
  back,
}: {
  shipping: ShippingInfo;
  ensName: string;
  next: () => void;
  back: () => void;
}) => {
  const [avatar, setAvatar] = useState<{
    error: boolean;
    fetching: boolean;
    avatar?: string;
  }>({
    error: false,
    fetching: true,
  });

  useEffect(() => {
    ensClient
      .getTextRecord({ name: ensName, key: "avatar" })
      .then((res) =>
        setAvatar({
          error: false,
          fetching: false,
          avatar: res || undefined,
        })
      )
      .catch((err) => {
        toast("Error while fetching avatar", { type: "error"})
        console.error(err)
        setAvatar({
          error: true,
          fetching: true,
        });
      });
  }, []);

  const { address, city, country, postalCode } = shipping;

  return (
    <div>
      <Typography fontVariant="bodyBold">
        To complete your order go mint a subdomain
      </Typography>
      {avatar.fetching && (
        <div className="d-flex justify-content-center w-100 mt-3 mb-3">
          <Spinner size="large" color="blue" />
        </div>
      )}
      {!avatar.fetching && (
        <div className="d-flex flex-column align-items-center mt-3 mb-3">
          <Typography fontVariant="bodyBold" className="mb-2">
            {ensName}
          </Typography>
          {avatar.avatar && (
            <img className="keychain-avatar" src={avatar.avatar}></img>
          )}
          {!avatar.avatar && (
            <div className="d-flex flex-column align-items-center">
              <div className="keychain-avatar p-1">
                <Typography className="txt">No avatar</Typography>
              </div>
              <Typography
                fontVariant="extraSmall"
                color="grey"
                className="mt-2"
              >
                The name selected for a keychain does not have avatar, please
                update it within 24 hours after ordering.
              </Typography>
            </div>
          )}
        </div>
      )}
      <Card className="p-3 mb-2">
        <Typography>Selected name: {ensName}</Typography>
        <Typography>Shipping info:</Typography>
        <Typography>{`${address}, ${city}, ${postalCode}, ${country}`}</Typography>
      </Card>
      <div className="d-flex">
        <Button onClick={back} className="me-2">
          Back
        </Button>
        <Button onClick={next}>Next</Button>
      </div>
    </div>
  );
};

export const SetEmail = ({
  value,
  setEmail,
  next,
  back,
}: {
  value: string;
  setEmail: (val: string) => void;
  next: () => void;
  back: () => void;
}) => {
  const isValidEmail = useMemo(() => {
    if (value.length === 0) {
      return false;
    }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  }, [value]);

  return (
    <div>
      <div className="mb-3">
        <Typography fontVariant="largeBold">What is your email?</Typography>
        <Typography fontVariant="small" color="grey">
          Email address will be used for shipping updates.
        </Typography>
      </div>
      <Input
        error={
          value.length > 0 && !isValidEmail
            ? "Provide a valid email address"
            : undefined
        }
        labelSecondary="Email"
        label=""
        value={value}
        onChange={(e) => setEmail(e.target.value)}
      ></Input>
      <div className="mt-3 d-flex">
        <Button onClick={back} colorStyle="blueSecondary" className="me-2">
          Back
        </Button>
        <Button disabled={!isValidEmail} onClick={next} className="me-2">
          Next
        </Button>
      </div>
    </div>
  );
};

export const FaQ = ({ back }: { back: () => void }) => {
  return (
    <div>
      <Typography fontVariant="largeBold">
        Frequently asked questions
      </Typography>
      <div className="mt-2">
        <Typography fontVariant="smallBold">
          1. Are shipping costs included
        </Typography>
        <Typography fontVariant="small" className="mt-1">
          Yes shipping is included in the minting price
        </Typography>
      </div>
      <div className="mt-2">
        <Typography fontVariant="smallBold">
          2. How long until I receive my order?
        </Typography>
        <Typography fontVariant="small" className="mt-1">
        'It depends on where you are located, the package is sent from the EU within two days after ordering. International shipments can take up to two weeks, but usually are faster
        </Typography>
      </div>
      <div className="mt-2">
        <Typography fontVariant="smallBold">
          3. Do you ship to UPS or DHL access points etc?
        </Typography>
        <Typography fontVariant="small" className="mt-1">
          Yes, wherever you want to receive the package, that fits through any
          mailbox.
        </Typography>
      </div>
      <Button className="mt-3" colorStyle="blueSecondary" onClick={back}>
        Back
      </Button>
    </div>
  );
};

export const MintSubname = ({
  label,
  txSent,
  next,
  back,
  setLabel,
}: {
  txSent: (tx: string) => void
  next: () => void;
  back: () => void;
  label: string;
  setLabel: (val: string) => void;
}) => {
  const { isSubnameAvailable } = useNameRegistry(BASE_CHAIN_ID);
  const { mint } = useNameController();
  const { publicClient } = useWeb3Clients();
  const { address } = useAccount();
  const [indicator, setIndicator] = useState<{
    checking: boolean;
    available: boolean;
  }>({
    available: false,
    checking: false,
  });
  const [records, setRecords] = useState<NameRecords>({
    addresses: [],
    texts: [],
    contenthash: "",
    ethAddress: "0x0",
  });
  const [mode, setMode] = useState<number>(0);
  
  const [btnState, setBtnState] = useState<{
    walletWait: boolean
    txWait: boolean
  }>({
    walletWait: false,
    txWait: false
  })

  useEffect(() => {
    if (address) {
      if (!records.addresses.find((addr) => addr.coinType === 60)) {
        setRecords({
          ...records,
          addresses: [...records.addresses, { coinType: 60, value: address }],
        });
      }
    }
  }, [address]);

  const checkAvailable = async (fullName: string) => {
    const _available = await isSubnameAvailable(fullName);
    setIndicator({
      available: _available,
      checking: false,
    });
  };

  const debouncedCheckAvailable = useCallback(
    debounce((subnameLabel: string) => {
      checkAvailable(subnameLabel);
    }, 300),
    []
  );

  const recordsToData = (fullName: string): Hash[] => {
    const data: Hash[] = [];

    const node = namehash(fullName);

    const { addresses, texts } = records;
    const validAddresses = addresses.filter((addr) => isAddress(addr.value));
    const validTexts = texts.filter((txt) => txt.value && txt.value.length > 0);

    validTexts.forEach((txt) => {
      data.push(
        encodeFunctionData({
          functionName: "setText",
          abi: RESOLVER_ABI,
          args: [node, txt.key, txt.value],
        })
      );
    });

    validAddresses.forEach((addr) => {
      data.push(
        encodeFunctionData({
          functionName: "setAddr",
          abi: RESOLVER_ABI,
          args: [node, addr.coinType, addr.value],
        })
      );
    });
    return data;
  };

  const validLabel = (val: string) => {
    if (val.length === 0) {
      return true;
    }

    if (val.includes(".")) {
      return false;
    }

    try {
      normalise(val);
    } catch (err) {
      return false;
    }

    return true;
  };

  const handleInputChange = async (val: string) => {

    const _val = val.toLocaleLowerCase();

    if (!validLabel(_val)) {
      return;
    }

    if (_val.length > 0) {
      const fllName = `${_val}.${KEYCHAIN_ENS_NAME}`;
      setIndicator({ available: false, checking: true });
      debouncedCheckAvailable(fllName);
    }
    setLabel(_val);
  };

  const btnLoading = btnState.txWait || btnState.walletWait;
  const validLabelLen = label && label.length > 0;
  const unavailable =
    !indicator.checking && !indicator.available && validLabelLen;
  const mintButtonDisabled =
    indicator.checking || unavailable || !validLabelLen || btnLoading;
  let btnLabel = "Mint";
  if (btnState.walletWait) {
    btnLabel = "Waiting wallet..."
  } else if(btnState.txWait) {
    btnLabel = "Waitig for tx..."
  }

  const handleMint = async () => {
    const fullName = `${label}.${KEYCHAIN_ENS_NAME}`;
    const resolverData = recordsToData(fullName);
    const node = namehash(fullName);

    if (resolverData.length === 0) {
      resolverData.push(
        encodeFunctionData({
          abi: RESOLVER_ABI,
          args: [node, 60, address],
        })
      );
    }

    const parameters = await getMintingParameters(
      label,
      KEYCHAIN_ENS_NAME,
      address as Address,
      "base"
    );
    parameters.parameters.resolverData = resolverData;

    try {
      setBtnState({...btnState, walletWait: true})
      const tx = await mint(parameters);
      txSent(tx)
      setBtnState({txWait: true, walletWait: false})
      await publicClient?.waitForTransactionReceipt({hash: tx})
      next()
    } catch (err: any) {
      console.error(err);
      if (err.details && err.details.includes("insufficient funds for gas")) {
        toast("Insufficient ETH balance.", { type: "warning" });
      } else if (err.details && err.details.includes("User denied")) {
        // do nothing, signature denied
      } else {
        toast("Error ocurred. Check console for more info", {
          type: "error",
        });
      }
    } finally {
      setBtnState({txWait: false, walletWait: false})
    }
  };

  if (mode === 1) {
    return (
      <SetRecordsForm
        nameRecords={records}
        onBack={() => setMode(0)}
        onRecordsSelected={() => setMode(0)}
        isMusica={false}
        setNameRecords={(v) => setRecords(v)}
      />
    );
  }

  if (!address) {
    return (
      <div>
        <Typography>Connect to continue</Typography>
        <Button>Connect</Button>
      </div>
    );
  }


  return (
    <div>
      <Typography fontVariant="largeBold">Mint subname</Typography>
      <Typography fontVariant="small" color="grey" className="mt-1">Minting this subname will be used as proof of ownership of your Keychain.</Typography>
      <div className="mt-2">
        <Typography color="grey" fontVariant="extraSmall">{`${
          label.length === 0 ? "{yourName}" : label
        }.${KEYCHAIN_ENS_NAME}`}</Typography>
        <Input
          label=""
          error={unavailable ? "Name is not available" : undefined}
          value={label}
          onChange={(e) => handleInputChange(e.target.value)}
          suffix={indicator.checking && <Spinner color="blue" />}
        ></Input>
        <Card className="p-3 mt-2 mb-2 d-flex flex-row align-items-center justify-content-between">
          <Typography>Price</Typography>
          <Typography fontVariant="bodyBold">0.0099 ETH</Typography>
        </Card>
        <Typography
          onClick={() => setMode(1)}
          color="blue"
          className="mt-2"
          style={{ cursor: "pointer" }}
        >
          + Set records
        </Typography>
      </div>
      <div className="mt-2 d-flex">
        <Button onClick={back} colorStyle="blueSecondary" className="me-2">
          Back
        </Button>
        <Button
          disabled={mintButtonDisabled}
          loading={btnLoading}
          className="me-2"
          onClick={() => handleMint()}
        >
          {btnLabel}
        </Button>
      </div>
    </div>
  );
};


export const EnsureBaseChain = () => {
  
  const { chain } = useAccount();
  const { switchChainAsync } = useSwitchChain()
  
  if (!chain) {
    return <div className="d-flex flex-column align-items-center justify-content-center" style={{height:250}}>
      <Typography fontVariant="largeBold">Connect</Typography>
      <Typography className="mt-2 mb-2" color="grey" fontVariant="small">Connect your wallet to continue</Typography>
      <ConnectButton/>
    </div>
  }

  return <div className="d-flex flex-column align-items-center justify-content-center" style={{height:250}}>
      <img src={baseLogo} width="50px" className="mb-2"></img>
      <Typography className="mb-2">Switch to Base</Typography>
      <Button style={{width:170}} onClick={() => switchChainAsync({chainId: base.id})}>Switch</Button>
  </div>
}


const SuccessScreen = ({ fullName, keychainName}: { fullName: string, keychainName: string}) => {

  
  return (
    <div className="d-flex flex-column justify-content-center align-items-center mt-4">
      <img src={happyNinja} width="80px"></img>
      <Typography className="mt-4 mb-2" fontVariant="extraLargeBold">
        Congratulations
      </Typography>
       <div className="text-center">
       <Typography className="mb-1" color="grey" fontVariant="small">You have succesfully minted {fullName}</Typography>
       <Typography className="mb-1" color="grey" fontVariant="small">and ordered a keychain for</Typography>
       </div>
      <Typography fontVariant="extraLargeBold" color="blue">
        {keychainName}
      </Typography>
      <div className="d-flex mt-3">
        <Link to="/enskeychains">
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
