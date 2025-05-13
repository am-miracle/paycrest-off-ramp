/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "./ui/button";

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();
        setAddress(userAddress);
        onConnect(userAddress);
      } catch (err) {
        setError("Failed to connect wallet. Please try again.");
        console.error(err);
      }
    } else {
      setError("Please install MetaMask or another wallet.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {address ? (
        <p className="text-sm text-gray-600">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </p>
      ) : (
        <Button onClick={connectWallet}>Connect Wallet</Button>
      )}
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
}