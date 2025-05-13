/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ethers, Contract } from "ethers";
import { Button } from "../components/ui/button";
import BalanceDisplay from "@/components/display-balance";

// USDT contract configuration (Arbitrum mainnet)
const usdtContract = {
  address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", // USDT on Arbitrum mainnet
  abi: ["function balanceOf(address _owner) public view returns (uint256)"],
};

// Arbitrum mainnet chain ID
const ARBITRUM_MAINNET_CHAIN_ID = 42161;

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const address = location.state?.address || "Unknown";
  const [balance, setBalance] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch USDT balance from wallet
  const fetchBalance = async () => {
    if (!((window as any).ethereum) || address === "Unknown") {
      setError("Please connect your wallet.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check network
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== ARBITRUM_MAINNET_CHAIN_ID) {
        setError("Please switch to Arbitrum mainnet in your wallet.");
        return;
      }

      // Fetch balance
      const usdtAsset = new Contract(usdtContract.address, usdtContract.abi, provider);
      const balanceRaw = await usdtAsset.balanceOf(address);
      const balanceFormatted = parseFloat(ethers.formatUnits(balanceRaw, 6)); // USDT has 6 decimals
      setBalance(balanceFormatted);
    } catch (err: any) {
      if (err.code === "BAD_DATA") {
        setError("Failed to fetch balance: Invalid contract response. Please ensure the USDT contract is correct.");
      } else {
        setError(`Failed to fetch balance: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance();
  }, [address]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-gray-600">Address: {address}</p>
        {loading && <p>Loading balance...</p>}
        {error && (
          <div className="space-y-2">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchBalance} disabled={loading}>
              Retry
            </Button>
          </div>
        )}
        {balance !== null ? (
          <BalanceDisplay balance={balance} savings={0} />
        ) : (
          !loading && !error && <p>No balance available</p>
        )}
        <Button onClick={() => navigate("/off-ramp", { state: { address } })}>
          Convert USDT to NGN
        </Button>
      </div>
    </div>
  );
}