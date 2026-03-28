import { PinataSDK } from "pinata";

const jwt = process.env.PINATA_JWT;
const gateway = process.env.PINATA_GATEWAY ?? "gateway.pinata.cloud";

const pinata = jwt
  ? new PinataSDK({ pinataJwt: jwt, pinataGateway: gateway })
  : null;

export async function uploadJsonToStorage(payload: Record<string, unknown>) {
  const fallback = {
    uri: `data:application/json;base64,${Buffer.from(
      JSON.stringify(payload),
    ).toString("base64")}`,
    ipfs: false,
  };

  if (!pinata) {
    return fallback;
  }

  try {
    const file = new File([JSON.stringify(payload)], `metadata-${Date.now()}.json`, {
      type: "application/json",
    });

    const uploaded = await pinata.upload.public.file(file);
    return {
      uri: `ipfs://${uploaded.cid}`,
      ipfs: true,
    };
  } catch (error) {
    console.warn("Pinata upload failed, using inline metadata fallback.", error);
    return fallback;
  }
}
