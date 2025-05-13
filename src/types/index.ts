export interface User {
    address: string;
    balance: number;
    savings: number;
  }
  
  export interface Transaction {
    id: string;
    type: "deposit" | "withdraw";
    amount: number;
    timestamp: string;
  }
  
  export interface Institution {
    name: string;
    code: string;
  }
  
  export interface AccountVerificationResponse {
    data: string; // Account name if valid
  }