import {
  Button,
  Card,
  Input,
  Typography,
  CrossSVG,
  ScrollBox,
  Avatar,
} from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  textsCategories,
  TextRecord,
  NameRecords,
  AddressRecord,
  getAvailableAddrByCoin,
  availableAddresses,
} from "./NameRecordsForm";
import "./MintRecordsForm.css";

export interface RecordsUpdateInput {
  baseAddr?: string;
  ethAddr?: string;
  texts: TextRecord[];
}

export type SetRecordsMode = "update" | "select";

export const SetRecordsForm = ({ onBack }: { onBack: () => void }) => {
  const [nameRecords, setNameRecords] = useState<NameRecords>({
    addresses: [],
    texts: [],
  });
  const [mode, setMode] = useState<SetRecordsMode>("select");

  const handleTextsValueChanged = (key: string, value: string) => {
    const _records = { ...nameRecords };
    const _texts = [..._records.texts];
    for (let text of _texts) {
      if (text.key === key) {
        text.value = value;
      }
    }
    _records.texts = _texts;
    setNameRecords(_records);
  };

  const handleTextsRemoved = (key: string) => {
    const _records = { ...nameRecords };
    let _texts = _records.texts.filter((t) => t.key !== key);
    _records.texts = _texts;
    setNameRecords(_records);
  };

  const handleAddrValueChanged = (coinType: number, value: string) => {
    const _records = { ...nameRecords };
    const _addresses = [..._records.addresses];
    for (let addr of _addresses) {
      if (addr.coinType === coinType) {
        addr.value = value;
      }
    }
    _records.addresses = _addresses;
    setNameRecords(_records);
  }

  const handleAddrRemoved = (coinType: number) => {
    const _records = { ...nameRecords };
    const _addresses = _records.addresses.filter(i => i.coinType !== coinType);
    _records.addresses = _addresses;
    setNameRecords(_records);
    
  }

  if (mode === "select") {
    return (
      <div>
        <div className="d-flex justify-content">
          <div style={{ width: 120 }}>
            <Avatar label="avatar"></Avatar>
          </div>
        </div>
        <TextsInputs
          onTextChanged={(key, value) => handleTextsValueChanged(key, value)}
          onTextRemoved={(key) => handleTextsRemoved(key)}
          selectedTexts={nameRecords.texts}
        />
        <AddressesInputs
          onAddrChange={(coin,val) => handleAddrValueChanged(coin,val)}
          onAddrRemoved={handleAddrRemoved}
          selectedAddresses={nameRecords.addresses}
        />
        <Button onClick={() => onBack()}>Back</Button>
        <Button onClick={() => setMode("update")}>Update</Button>
      </div>
    );
  }

  const handleToggleText = (key: string) => {
    const _records = { ...nameRecords };
    let _texts = [..._records.texts];
    if (_texts.find((t) => t.key === key)) {
      _texts = _texts.filter((t) => t.key !== key);
    } else {
      _texts.push({ key, value: "" });
    }
    _records.texts = _texts;
    setNameRecords(_records);
  };

  const handleTogglAddr = (coinType: number) => {
    const _records = { ...nameRecords };
    let _addresses = [..._records.addresses];

    if (_addresses.find((i) => i.coinType === coinType)) {
      _addresses = _addresses.filter((addr) => addr.coinType !== coinType);
    } else {
      _addresses.push({ value: "", coinType });
    }
    _records.addresses = _addresses;
    setNameRecords(_records);
  };

  if (mode === "update") {
    return (
      <div>
        <SelectTexts
          textToggled={(key) => handleToggleText(key)}
          selectedTexts={nameRecords.texts}
        />
        <SelectAddresses
          onAddrToggled={(coinType: number) => handleTogglAddr(coinType)}
          selectedAddrs={nameRecords.addresses}
        />
        <Button onClick={() => setMode("select")}>Back</Button>
      </div>
    );
  }

  return <div></div>;
};

export const MintRecordsForm = ({
  onMint,
  onBack,
}: {
  onMint: (records: RecordsUpdateInput) => void;
  onBack: () => void;
}) => {
  const [selectedRecords, setSelectedRecords] = useState<
    Record<string, string>
  >({});

  const { address } = useAccount();
  const [recordPicker, setRecordPicker] = useState(false);
  const [baseAddr, setBasAddr] = useState<string>(address as string);
  const [ethAddr, setEthAddr] = useState<string>(address as string);

  const handleAddRecord = (recordKeys: string[]) => {
    const _records: Record<string, string> = {};
    recordKeys.forEach((key) => {
      _records[key] = "";
    });
    setSelectedRecords(_records);
    setRecordPicker(false);
  };

  const handleUpdateRecord = (key: string, value: string) => {
    const _records = { ...selectedRecords };
    _records[key] = value;
    setSelectedRecords(_records);
  };

  const handleRecordRemove = (key: string) => {
    const _records = { ...selectedRecords };
    delete _records[key];
    setSelectedRecords(_records);
  };

  const handleMintWithRecords = () => {
    const texts: TextRecord[] = [];
    Object.keys(selectedRecords).forEach((key) => {
      const recordValue = selectedRecords[key];
      if (recordValue.length > 0) {
        texts.push({ key, value: recordValue });
      }
    });

    const _records: RecordsUpdateInput = {
      texts: texts,
      baseAddr: baseAddr,
      ethAddr: ethAddr,
    };

    onMint(_records);
  };

  return (
    <div className="mint-records-form">
      <Typography fontVariant="largeBold">Add records to profile</Typography>
      {recordPicker && (
        <SelectRecordType
          selectedRecords={selectedRecords}
          onBack={() => setRecordPicker(false)}
          onRecordAdded={(record) => handleAddRecord(record)}
        />
      )}
      {!recordPicker && (
        <div>
          <ScrollBox className="p-1" style={{ maxHeight: 270 }}>
            <div className="d-flex justify-content-center mb-2">
              <div style={{ width: 120 }}>
                <Avatar label="avatar"></Avatar>
              </div>
            </div>
            <Input
              className="mb-2"
              value={baseAddr}
              onChange={(e) => setBasAddr(e.target.value as string)}
              label="Base address"
            ></Input>
            <Input
              className="mb-2"
              value={ethAddr}
              onChange={(e) => setEthAddr(e.target.value as string)}
              label="Eth address"
              suffix={<CrossSVG />}
            ></Input>
            {Object.keys(selectedRecords).map((recordKey) => (
              <div className="mb-1">
                <Input
                  label={recordKey}
                  value={selectedRecords[recordKey]}
                  onChange={(e) =>
                    handleUpdateRecord(recordKey, e.target.value)
                  }
                  suffix={
                    <CrossSVG onClick={() => handleRecordRemove(recordKey)} />
                  }
                ></Input>
              </div>
            ))}
          </ScrollBox>
          <div className="d-flex mt-3">
            <Button
              onClick={() => onBack()}
              className="me-2"
              colorStyle="blueSecondary"
            >
              Back
            </Button>
            <Button onClick={() => setRecordPicker(!recordPicker)}>
              + Add more to profile
            </Button>
            <Button onClick={() => handleMintWithRecords()}>Mint</Button>
          </div>
        </div>
      )}
    </div>
  );
};

const SelectAddresses = ({
  onAddrToggled,
  selectedAddrs,
}: {
  onAddrToggled: (coinType: number) => void;
  selectedAddrs: AddressRecord[];
}) => {
  const getCoinType = (name: string) => {
    return availableAddresses[name] ? availableAddresses[name].coinType : 60;
  };

  const isActive = (name: string) => {
    const coinType = getCoinType(name);
    return selectedAddrs.find((addr) => addr.coinType === coinType);
  };

  isActive("ETH")

  return (
    <div className="row">
      {Object.keys(availableAddresses).map((addr) => (
        <div
          className="col col-lg-4"
          onClick={() => onAddrToggled(getCoinType(addr))}
        >
          <Card className="p-3">
            <Typography>{availableAddresses[addr].chainName}</Typography>
          </Card>
        </div>
      ))}
    </div>
  );
};

const SelectTexts = ({
  textToggled,
  selectedTexts,
}: {
  textToggled: (key: string) => void;
  selectedTexts: TextRecord[];
}) => {
  const isActive = (key: string) => {
    return selectedTexts.find((text) => text.key === key) !== undefined;
  };

  isActive("ETH")

  return (
    <div>
      {Object.keys(textsCategories).map((category) => (
        <div key={category} className="row mb-2">
          <Typography>{category}</Typography>
          {textsCategories[category].map((text) => (
            <div
              className="col col-lg-4 col-sm-6 col-xs-12"
              onClick={() => textToggled(text.key)}
            >
              <Card className="p-3">{text.key}</Card>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const AddressesInputs = ({
  selectedAddresses,
  onAddrChange,
  onAddrRemoved,
}: {
  selectedAddresses: AddressRecord[];
  onAddrChange: (coinType: number, value: string) => void;
  onAddrRemoved: (coinType: number) => void;
}) => {
  const getLabel = (coinType: number) => {
    const addr = getAvailableAddrByCoin(coinType);
    return addr ? addr.chainName : "";
  };

  return (
    <div>
      {selectedAddresses.map((addr) => (
        <div key={addr.coinType} className="mb-1">
          <Input
            suffix={<CrossSVG onClick={() => onAddrRemoved(addr.coinType)} />}
            label={getLabel(addr.coinType)}
            value={addr.value}
            onChange={(e) => onAddrChange(addr.coinType, e.target.value)}
          ></Input>
        </div>
      ))}
    </div>
  );
};

const TextsInputs = ({
  selectedTexts,
  onTextChanged,
  onTextRemoved,
}: {
  selectedTexts: TextRecord[];
  onTextChanged: (key: string, value: string) => void;
  onTextRemoved: (key: string) => void;
}) => {
  return (
    <div>
      {selectedTexts.map((txt) => (
        <div key={txt.key}>
          <Input
            label={txt.key}
            value={txt.value}
            onChange={(e) => onTextChanged(txt.key, e.target.value)}
            suffix={<CrossSVG onClick={() => onTextRemoved(txt.key)} />}
          ></Input>
        </div>
      ))}
    </div>
  );
};

export const SelectRecordType = ({
  onRecordAdded,
  onBack,
  selectedRecords,
}: {
  selectedRecords: Record<string, string>;
  onRecordAdded: (records: string[]) => void;
  onBack: () => void;
}) => {
  const [addedRecords, setAddedRecords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const _records = { ...addedRecords };
    Object.keys(selectedRecords).forEach((r) => {
      _records[r] = true;
    });
    setAddedRecords(_records);
  }, [selectedRecords]);

  const handleAddRecords = () => {
    onRecordAdded(Object.keys(addedRecords));
  };

  const toggleRecords = (key: string) => {
    const _records = { ...addedRecords };
    if (_records[key]) {
      delete _records[key];
    } else {
      _records[key] = true;
    }
    setAddedRecords(_records);
  };

  const selectedCount = Object.keys(addedRecords).length;

  return (
    <div>
      <ScrollBox className="row p-1" style={{ maxHeight: 270 }}>
        <div className="col col-lg-12">
          {Object.keys(textsCategories).map((category) => (
            <div className="row mb-2">
              <div className="col col-lg-12">
                <Typography color="grey" className="mb-2">
                  {category}
                </Typography>
              </div>
              {(textsCategories[category] || []).map((text) => (
                <div className="col col-lg-4 col-md-6 col-sm-6 p-1">
                  <Card
                    onClick={() => toggleRecords(text.key)}
                    className={`p-3 records-item ${
                      addedRecords[text.key] ? "active" : ""
                    }`}
                    key={text.key}
                  >
                    <Typography>{text.label}</Typography>
                  </Card>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ScrollBox>
      <div className="mt-2 d-flex">
        <Button
          className="me-2"
          colorStyle="blueSecondary"
          onClick={() => onBack()}
        >
          Back
        </Button>
        <Button
          onClick={() => handleAddRecords()}
          disabled={selectedCount === 0}
        >
          {`Selected ${selectedCount}`}
        </Button>
      </div>
    </div>
  );
};
