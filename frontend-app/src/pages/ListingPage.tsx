import { Card } from "@ensdomains/thorin";
import { ScreenContainer } from "../components";
import { NameListingCard } from "../components/name-listing/NameListingCard";

export const ListingPage = () => {
  return (
    <ScreenContainer>
      <Card>
        <NameListingCard />
      </Card>
    </ScreenContainer>
  );
};
