import {
  Button,
  Card,
  Input,
  Typography,
  CrossSVG,
  ScrollBox,
} from "@ensdomains/thorin";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import "./MintRecordsForm.css";

interface TextRecordCard {
  icon?: string;
  key: string;
  label: string;
}

export interface RecordsUpdateInput {
    baseAddr?:string,
    ethAddr?:string,
    texts: TextRecord[]
}

const generalIcons: TextRecordCard[] = [
  {
    key: "name",
    label: "Nickname",
  },
  {
    key: "bio",
    label: "Short bio",
  },
  {
    key: "location",
    label: "Location",
  },
  {
    key: "website",
    label: "Website",
  },
  {
    key: "email",
    label: "Email",
  },
];

const socialIcons: TextRecordCard[] = [
  {
    key: "com.twitter",
    label: "Twitter",
  },
  {
    key: "com.warpcast",
    label: "Warpcast",
  },
  {
    key: "com.github",
    label: "Github",
  },
  {
    key: "com.telegram",
    label: "Telegram",
  },
];

interface TextRecord {
  key: string;
  value: string;
}

const categories: Record<string, TextRecordCard[]> = {
  General: generalIcons,
  Social: socialIcons,
};

export const MintRecordsForm = ({onMint}: {onMint: (records: RecordsUpdateInput) => void}) => {
  const [selectedRecords, setSelectedRecords] = useState<
    Record<string, string>
  >({});

  const { address } = useAccount();
  const [recordPicker, setRecordPicker] = useState(false);
  const [baseAddr, setBasAddr] = useState<string>(address as string);
  const [ethAddr, setEthAddr] = useState<string>(address as string);

  const handleAddRecord = (recordKeys: string[]) => {
    const _records = { ...selectedRecords };
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

  return (
    <div className="mint-records-form">
      <Typography fontVariant="largeBold">Add records to profile</Typography>
      {recordPicker && (
        <SelectRecordType
          onBack={() => setRecordPicker(false)}
          onRecordAdded={(record) => handleAddRecord(record)}
        />
      )}
      {!recordPicker && (
        <div>
          <ScrollBox className="p-1" style={{ maxHeight: 270 }}>
            <div
              style={{ width: "100px", height: "100px", background: "red" }}
            ></div>
            <Input
              value={baseAddr}
              onChange={(e) => setBasAddr(e.target.value as string)}
              label="Base address"
            ></Input>
            <Input
              value={ethAddr}
              onChange={(e) => setEthAddr(e.target.value as string)}
              label="Eth address"
              suffix={<CrossSVG />}
            ></Input>
            {Object.keys(selectedRecords).map((recordKey) => (
              <Input
                label={recordKey}
                value={selectedRecords[recordKey]}
                onChange={(e) => handleUpdateRecord(recordKey, e.target.value)}
                suffix={
                  <CrossSVG onClick={() => handleRecordRemove(recordKey)} />
                }
              ></Input>
            ))}
          </ScrollBox>
          <div className="d-flex">
            <Button
              className="mt-3"
              onClick={() => setRecordPicker(!recordPicker)}
            >
              + Add more to profile
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const SelectRecordType = ({
  onRecordAdded,
  onBack,
}: {
  onRecordAdded: (records: string[]) => void;
  onBack: () => void;
}) => {
  const [selectedRecords, setSelectedRecords] = useState<
    Record<string, boolean>
  >({});

  const handleAddRecords = () => {
    onRecordAdded(Object.keys(selectedRecords));
  };

  const toggleRecords = (key: string) => {
    const _records = { ...selectedRecords };
    if (_records[key]) {
      delete _records[key];
    } else {
      _records[key] = true;
    }
    setSelectedRecords(_records);
  };

  const selectedCount = Object.keys(selectedRecords).length;

  return (
    <div>
      <ScrollBox className="row p-1" style={{ maxHeight: 270 }}>
        <div className="col col-lg-12">
          {Object.keys(categories).map((category) => (
            <div className="row mb-2">
              <div className="col col-lg-12">
                <Typography color="grey" className="mb-2">
                  {category}
                </Typography>
              </div>
              {(categories[category] || []).map((text) => (
                <div className="col col-lg-4 col-md-6 col-sm-6 p-1">
                  <Card
                    onClick={() => toggleRecords(text.key)}
                    className={`p-3 records-item ${selectedRecords[text.key] ? "active" : ""}`}
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
