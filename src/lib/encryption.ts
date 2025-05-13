/* eslint-disable @typescript-eslint/no-explicit-any */
import JSEncrypt from "jsencrypt";

export async function fetchAggregatorPublicKey(): Promise<string> {
  try {
    const response = await fetch("https://api.paycrest.io/v1/pubkey");
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching aggregator public key:", error);
    throw error;
  }
}

export function publicKeyEncrypt(data: any, publicKeyPEM: string): string {
  const encrypt = new JSEncrypt();
  encrypt.setPublicKey(publicKeyPEM);
  const encrypted = encrypt.encrypt(JSON.stringify(data));
  if (encrypted === false) throw new Error("Failed to encrypt data");
  return encrypted;
}