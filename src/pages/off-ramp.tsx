/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import TransactionStatus from "@/components/transaction-status";
import OffRampForm from "@/components/off-ramp-form";

export default function OffRamp() {
  const location = useLocation();
  const navigate = useNavigate();
  const userAddress = location.state?.address || "Unknown";
  const [transaction, setTransaction] = useState<{ status: string; data?: any } | null>(null);

  const handleTransaction = (status: string, data?: any) => {
    setTransaction({ status, data });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Convert USDT to NGN</h1>
          <Button onClick={() => navigate("/dashboard", { state: { address: userAddress } })}>
            Back to Dashboard
          </Button>
        </div>
        <p className="text-sm text-gray-600">Address: {userAddress}</p>
        <OffRampForm userAddress={userAddress} onTransaction={handleTransaction} />
        {transaction && <TransactionStatus status={transaction.status} data={transaction.data} />}
      </div>
    </div>
  );
}