import type { Institution } from "@/types";

interface BankData {
    institution: string;
    accountIdentifier: string;
  }

  interface RateResponse {
    data: number;
  }

  interface AccountResponse {
    data: string;
  }

  interface InstitutionResponse {
    data: { name: string; code: string }[];
  }

  export async function fetchNairaRate(): Promise<number> {
    const response = await fetch("https://api.paycrest.io/v1/rates/usdt/1/ngn");
    if (!response.ok) throw new Error("Failed to fetch naira rate");
    const data: RateResponse = await response.json();
    return data.data;
  }

  export async function verifyBankAccount(bankData: BankData): Promise<string> {
    const response = await fetch("https://api.paycrest.io/v1/verify-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bankData),
    });
    if (!response.ok) throw new Error("Failed to verify account");
    const data: AccountResponse = await response.json();
    return data.data;
  }

  export async function fetchInstitutions(): Promise<Institution[]> {
    try {
      const response = await fetch("https://api.paycrest.io/v1/institutions/ngn");
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data: InstitutionResponse = await response.json();
      return data.data;
    } catch (error) {
      console.error("Error fetching NGN institutions:", error);
      throw error;
    }
  }