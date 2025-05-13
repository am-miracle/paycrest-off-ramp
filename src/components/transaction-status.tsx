/* eslint-disable @typescript-eslint/no-explicit-any */
import { ethers } from "ethers";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface TransactionStatusProps {
  status: string;
  data?: any;
}

export default function TransactionStatus({ status, data }: TransactionStatusProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Transaction Status</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Status: {status}</p>
        {data && status === "Order Created" && (
          <div className="mt-2">
            <p>Order ID: {data.logs.find((l: any) => l.fragment?.name === "OrderCreated")?.args[4]}</p>
            <p>Amount: {ethers.formatUnits(data.logs.find((l: any) => l.fragment?.name === "OrderCreated")?.args[2], 6)} USDT</p>
          </div>
        )}
        {status === "Error" && <p className="text-red-500">Error: {data.message}</p>}
      </CardContent>
    </Card>
  );
}