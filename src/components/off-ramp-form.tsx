/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { ethers, Contract } from "ethers";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { fetchNairaRate, verifyBankAccount, fetchInstitutions } from "../lib/paycrest";
import { fetchAggregatorPublicKey, publicKeyEncrypt } from "../lib/encryption";
import type { Institution } from "../types";

// Contract configurations
const usdtContract = {
  address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  abi: [
    "function transfer(address _to, uint256 _value) public returns (bool)",
    "function approve(address _spender, uint256 _value) public returns (bool)",
    "function balanceOf(address _owner) public view returns (uint256 balance)",
  ],
};

const gatewayContract = {
  address: "0xE8bc3B607CfE68F47000E3d200310D49041148Fc",
  abi: JSON.parse(
    `[{"inputs":[{"internalType":"address","name":"_token","type":"address"},{"internalType":"uint256","name":"_amount","type":"uint256"},{"internalType":"uint96","name":"_rate","type":"uint96"},{"internalType":"address","name":"_SenderFeeRecipient","type":"address"},{"internalType":"uint256","name":"_senderFee","type":"uint256"},{"internalType":"address","name":"_refundAddress","type":"address"},{"internalType":"string","name":"messageHash","type":"string"}],"name":"createOrder","outputs":[{"internalType":"bytes32","name":"orderId","type":"bytes32"}],"stateMutability":"nonpayable","type":"function"}]`
  ),
};

interface OffRampFormProps {
  userAddress: string;
  onTransaction: (status: string, data?: any) => void;
}

export default function OffRampForm({ userAddress, onTransaction }: OffRampFormProps) {
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [institution, setInstitution] = useState("");
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [accountName, setAccountName] = useState<string | null>(null);
  const [isAccountValid, setIsAccountValid] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingInstitutions, setLoadingInstitutions] = useState(false);
  const [nairaRate, setNairaRate] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch institutions
  useEffect(() => {
    const loadInstitutions = async () => {
      try {
        setLoadingInstitutions(true);
        const fetchedInstitutions = await fetchInstitutions();
        setInstitutions(fetchedInstitutions);
      } catch (err: any) {
        setError("Failed to fetch institutions: " + err.message);
      } finally {
        setLoadingInstitutions(false);
      }
    };
    loadInstitutions();
  }, []);

  // Fetch Naira Rate
  useEffect(() => {
    const loadNairaRate = async () => {
      const rate = await fetchNairaRate();
      setNairaRate(rate);
    };
    loadNairaRate();
  }, []);

  // Fetch USDT balance
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum);
        const usdtAsset = new Contract(usdtContract.address, usdtContract.abi, provider);
        const balanceRaw = await usdtAsset.balanceOf(userAddress);
        const balanceFormatted = parseFloat(ethers.formatUnits(balanceRaw, 6));
        setBalance(balanceFormatted);
      } catch (err: any) {
        setError("Failed to fetch balance: " + err.message);
      }
    };

    if (userAddress && userAddress !== "Unknown") {
      fetchBalance();
    }
  }, [userAddress]);

  // Validate account number when accountNumber or institution changes
  useEffect(() => {
    let isMounted = true;
    const validateAccount = async () => {
      if (accountNumber.length >= 10 && institution) {
        try {
          setIsAccountValid(null);
          const name = await verifyBankAccount({ institution, accountIdentifier: accountNumber });
          if (isMounted) {
            setAccountName(name);
            setIsAccountValid(true);
          }
        } catch (err: any) {
          if (isMounted) {
            setAccountName(null);
            setIsAccountValid(false);
            setError("Invalid account number or institution.");
          }
          console.error(err);
        }
      } else {
        setAccountName(null);
        setIsAccountValid(null);
      }
    };

    validateAccount();
    return () => {
      isMounted = false;
    };
  }, [accountNumber, institution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate inputs
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Please enter a valid amount.");
      setLoading(false);
      return;
    }
    if (balance !== null && numAmount > balance) {
      setError("Insufficient USDT balance.");
      setLoading(false);
      return;
    }
    if (!isAccountValid) {
      setError("Please verify a valid bank account.");
      setLoading(false);
      return;
    }
    if (nairaRate === null) {
      setError("Exchange rate not available.");
      setLoading(false);
      return;
    }

    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();

      // Initialize contracts
      const usdtAsset = new Contract(usdtContract.address, usdtContract.abi, signer);
      const gateway = new Contract(gatewayContract.address, gatewayContract.abi, signer);


      // Encrypt recipient details
      const recipient = {
        accountIdentifier: accountNumber,
        accountName,
        institution,
        memo: "N/A",
        providerId: "",
      };
      const publicKey = await fetchAggregatorPublicKey();
      const messageHash = publicKeyEncrypt(recipient, publicKey);

      // Approve USDT
      const usdtAmount = ethers.parseUnits(amount, 6);
      const approveTx = await usdtAsset.approve(gatewayContract.address, usdtAmount);
      await approveTx.wait();
      onTransaction("USDT Approved");

      // Create order
      const createOrderTx = await gateway.createOrder(
        usdtContract.address, // USDT contract
        usdtAmount, // Amount in wei
        Math.floor(nairaRate), // Exchange rate
        ethers.ZeroAddress, // No fee recipient
        0, // No sender fee
        userAddress, // Refund address
        messageHash // Encrypted bank details
      );

      const receipt = await createOrderTx.wait();
      onTransaction("Order Created", receipt);
    } catch (err: any) {
      setError(err.message || "Transaction failed");
      onTransaction("Error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>USDT Balance</Label>
        <p className="text-sm text-gray-600">
          {balance !== null ? `${balance.toFixed(2)} USDT` : "Fetching balance..."}
        </p>
      </div>
      <div>
        <Label>Naria Rate</Label>
        <p className="text-sm text-gray-600">
            {nairaRate}
        </p>
      </div>
      <div>
        <Label htmlFor="amount">Amount (USDT)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter USDT amount"
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="accountNumber">Bank Account Number</Label>
        <Input
          id="accountNumber"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          placeholder="Enter account number"
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="institution">Bank Institution</Label>
        <Select onValueChange={setInstitution} disabled={loading || loadingInstitutions}>
          <SelectTrigger>
            <SelectValue placeholder={loadingInstitutions ? "Loading institutions..." : "Select institution"} />
          </SelectTrigger>
          <SelectContent>
            {institutions.map((inst) => (
              <SelectItem key={inst.code} value={inst.code}>
                {inst.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Account Validation</Label>
        <p className="text-sm">
          {isAccountValid === null && accountNumber
            ? "Validating account..."
            : isAccountValid
            ? `Valid account: ${accountName}`
            : isAccountValid === false
            ? "Invalid account"
            : "Enter account number and select institution"}
        </p>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={loading || balance === null || !isAccountValid}>
        {loading ? "Processing..." : "Convert to NGN"}
      </Button>
    </form>
  );
}