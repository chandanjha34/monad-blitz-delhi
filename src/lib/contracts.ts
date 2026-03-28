import { Interface } from "ethers";

export const MONAD_TESTNET = {
  name: "Monad Testnet",
  chainId: Number(process.env.NEXT_PUBLIC_MONAD_CHAIN_ID ?? 10143),
  rpcUrl: process.env.NEXT_PUBLIC_MONAD_RPC_URL ?? "https://testnet-rpc.monad.xyz",
};

export const IDENTITY_NFT_ADDRESS =
  process.env.NEXT_PUBLIC_IDENTITY_NFT_ADDRESS ?? "";

export const COLLECTION_REGISTRY_ADDRESS =
  process.env.NEXT_PUBLIC_COLLECTION_REGISTRY_ADDRESS ?? "";

export const identityAbi = [
  "function mintIdentity(address user, string metadataURI) returns (uint256)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "event IdentityMinted(uint256 indexed tokenId, address indexed user, string metadataURI)",
];

export const collectionAbi = [
  "function addToCollection(address collector, uint256 profileId)",
  "function getCollections(address collector) view returns (uint256[] memory)",
  "event CollectionAdded(address indexed collector, uint256 indexed profileId)",
];

export const identityInterface = new Interface(identityAbi);
export const collectionInterface = new Interface(collectionAbi);
