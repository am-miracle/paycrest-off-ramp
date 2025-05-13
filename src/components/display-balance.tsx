import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface BalanceDisplayProps {
  balance: number;
  savings: number;
}

export default function BalanceDisplay({ balance, savings }: BalanceDisplayProps) {
  // Simulate 5% annual interest for display purposes
  const interest = savings * 0.05;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Your Savings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p>Wallet Balance: {balance.toFixed(2)} USDC</p>
        <p>Savings Balance: {savings.toFixed(2)} USDC</p>
        <p>Estimated Annual Interest: {interest.toFixed(2)} USDC</p>
      </CardContent>
    </Card>
  );
}