import { TextRecordCard } from "./Types";

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
  export const textsCategories: Record<string, TextRecordCard[]> = {
    General: generalIcons,
    Social: socialIcons,
  };