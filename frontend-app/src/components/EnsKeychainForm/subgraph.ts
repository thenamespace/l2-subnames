import axios from "axios";

const subgraphURl =
  "https://gateway-arbitrum.network.thegraph.com/api/8f8abad149a2fbd9e7040990938441b0/subgraphs/id/5XqPmWe6gjyrJtFn9cLy237i4cWw2j9HcUJEXsP5qGtH";

interface Domain {
  name: string;
}

const getNamesQuery = (address: string) => {
  return {
    query: `
        {   
         domains(where: {
            owner: "${address.toLocaleLowerCase()}"
         }) {
            id
            name
         },
         wrappedDomains(where: { owner: "${address.toLocaleLowerCase()}" }) {
            id
            name
            }
        }
        `,
  };
};

export const fetchGraphNames = async (address: any): Promise<string[]> => {
  try {
    const response = await axios.post<{
      data: {
        domains: Domain[];
        wrappedDomains: Domain[];
      };
    }>(subgraphURl, getNamesQuery(address));


    const allDomains: string[] = []

    if (response.data && response.data.data) {
        const { wrappedDomains, domains } = response.data.data;
        if (wrappedDomains) {
            wrappedDomains.forEach(d => {
                allDomains.push(d.name)
            })
        }
        if (domains) {
            domains.filter(d => !d.name.includes(".addr.reverse"))
            .forEach(d => {
                allDomains.push(d.name);
            })
        }
    }


    return allDomains
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
