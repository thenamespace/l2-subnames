import {
  Button,
  Card,
  Input,
  Select,
  Spinner,
  Typography,
} from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import { http, useAccount } from "wagmi";
import { createEnsPublicClient } from "@ensdomains/ensjs";
import { mainnet } from "viem/chains";
import { MintSubnameForm } from "../MintSubnameForm";

const ensClient = createEnsPublicClient({
  chain: mainnet,
  transport: http(),
});

interface ShippingInfo {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

enum RegStep {
  SelectName = 0,
  ShippingInfo = 1,
  Review = 2,
  MintSubname = 3,
  Success = 4,
}

export const EnsKeychainForm = () => {
  const { address } = useAccount();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    address: "",
    city: "",
    country: "",
    postalCode: "",
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

  useEffect(() => {
    if (address) {
      ensClient.getNamesForAddress({ address }).then((result) => {
        let namesStr: string[] = [];
        if (result && result.length > 0) {
          //@ts-ignore
          namesStr = result.map((name) => name.name);
        }
        setAllNames({
          fetching: false,
          items: namesStr,
        });
      });
    }
  }, [address]);

  if (allNames.fetching) {
    return <Spinner />;
  }

  if (regStep === RegStep.SelectName) {
    return (
      <SelectName
        selectedName={selectedName}
        onNext={() => setRegStep(regStep + 1)}
        nameOptions={allNames.items}
        onNameSelect={(val) => setSelectedName(val)}
      ></SelectName>
    );
  }

  if (regStep === RegStep.ShippingInfo) {
    return (
      <ShippingInformation
        onBack={() => setRegStep(regStep - 1)}
        onNext={() => setRegStep(regStep + 1)}
        setShippingInfo={(val) => setShippingInfo(val)}
        shippingInfo={shippingInfo}
      />
    );
  }

  if (regStep === RegStep.Review) {
    return (
      <ReviewTab
        shipping={shippingInfo}
        ensName={selectedName}
        back={() => setRegStep(regStep - 1)}
        next={() => setRegStep(regStep + 1)}
      />
    );
  }

  if (regStep === RegStep.MintSubname) {
    return <MintSubnameForm listing={{name: "enskeychain.eth", network: "base"}}/>
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
      <Typography>Select Keychain Ens name</Typography>
      <Select
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
      />
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

  return (
    <div>
      <Typography>Shipping info</Typography>
      <Input
        className="mb-2"
        placeholder="Postal code"
        label=""
        labelSecondary="Postal code"
        value={shippingInfo.postalCode}
        onChange={(e) => handleInput("postalCode", e.target.value)}
      ></Input>
      <Input
        className="mb-2"
        label=""
        placeholder="Example St. 20"
        labelSecondary="Address"
        value={shippingInfo.address}
        onChange={(e) => handleInput("address", e.target.value)}
      ></Input>
      <Input
        className="mb-2"
        label=""
        placeholder="ex. New York"
        labelSecondary="City"
        value={shippingInfo.city}
        onChange={(e) => handleInput("city", e.target.value)}
      ></Input>
      <Input
        className="mb-2"
        label=""
        placeholder="ex. Japan"
        labelSecondary="Country"
        value={shippingInfo.country}
        onChange={(e) => handleInput("country", e.target.value)}
      ></Input>
      <div className="mt-3 d-flex">
        <Button
          onClick={() => onBack()}
          className="me-2"
          colorStyle="accentSecondary"
        >
          Back
        </Button>
        <Button onClick={() => onNext()}>Next</Button>
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
  const [avatar, setAvatar] = useState("");
  useEffect(() => {
    ensClient
      .getTextRecord({ name: ensName, key: "avatar" })
      .then((res) => setAvatar(res || ""));
  }, []);

  const { address, city, country, postalCode } = shipping;

  return (
    <div>
      <Typography>Ordering Keychain</Typography>
      <div>
        <Typography>Keychain for {ensName}</Typography>
        <img src={avatar} width="120px"></img>
      </div>
      <Card className="p-3">
        <Typography fontVariant="extraSmall" color="grey">
          Shipping info{" "}
        </Typography>
        <Typography fontVariant="extraSmallBold">{`${address}, ${city} ${postalCode}, ${country}`}</Typography>
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
