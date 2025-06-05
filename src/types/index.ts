
import type { User as FirebaseUser } from 'firebase/auth';

export interface Investment {
  id: string; // Unique ID for this investment holding specific to the user's array
  symbol: string;
  companyName: string;
  shares: number;
  averagePurchasePrice: number;
  purchaseDate?: string; // Optional: date of first purchase or last update
}

export interface StockData {
  symbol: string;
  currentPrice: number;
  changePercent?: number; // Optional: daily change
  companyName?: string; // Optional
}

export type TransactionType = 'purchase' | 'sale' | 'deposit' | 'withdrawal' | 'dividend';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO string
  symbol: string; 
  shares: number; 
  pricePerShare: number; 
  totalAmount: number; // shares * pricePerShare for purchase/sale, or deposit/withdrawal amount
  description: string; // e.g., "Compradas 10 acciones de AAPL" or "Vendidas 5 acciones de MSFT"
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName?: string | null;
  investments: Investment[];
  transactions: Transaction[]; // Ensured this exists
}

// Combine FirebaseUser with our custom UserProfile details if needed
export type AppUser = FirebaseUser & Partial<UserProfile>; // Or just FirebaseUser if profile is separate

// NewsItem is no longer needed as news functionality was removed.
// export interface NewsItem {
//   title: string;
//   summary: string;
//   source: string;
//   date: string; // ISO date string
//   url: string;
//   imageUrl?: string;
//   symbol: string;
// }
