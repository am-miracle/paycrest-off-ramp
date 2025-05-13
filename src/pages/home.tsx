import WalletConnect from "@/components/wallet-connect";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleConnect = (address: string) => {
    navigate("/dashboard", { state: { address } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Stablecoin Savings App</h1>
        <p className="text-lg text-gray-600">
          Connect your wallet to start saving with stablecoins.
        </p>
        <WalletConnect onConnect={handleConnect} />
      </div>
    </div>
  );
}