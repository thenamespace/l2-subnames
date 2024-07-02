## Description

Subname minting application that accepts a minting request, verifies it and provides a [EIP712](https://docs.metamask.io/wallet/how-to/sign-data/#use-eth_signtypeddata_v4) signed response.

## Configuration

To get started configure the application with the following parameters:

- `L2_RPC_URL` - URL of the RPC node to connect to the L2 chain, where the registry controller contract is deployed
- `L2_CHAIN` - name of the chain in lower case where contracts are deployed
- `SIGNER_KEY` - key of the wallet that will be signing verified minting response
- `APP_SIGNER_NAME` - name of the contract as per [EIP712 specifications](https://docs.metamask.io/wallet/how-to/sign-data/#example)
- `APP_SIGNER_VERSION` - version of the contract as per [EIP712 specifications](https://docs.metamask.io/wallet/how-to/sign-data/#example)

## Endpoint

After running the installation as specified below, and running the app the endpoint will be available at: http://localhost:3000/l2/subname/mint.

The request to send is:

```ts
MintRequest {
  label: string;
  ensName: string;
  owner: Address;
}
```

The response will be:

```ts
MintResponse {
  signature: string;
  parameters: {
    label: string;
    parentNode: Hash;
    owner: Address;
    resolver: Address;
    price: bigint;
    fee: bigint;
    paymentReceiver: Address;
  };
}
```

After the client receives `MintResponse` it will send it to the minting controller contract in the minting transaction.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```
