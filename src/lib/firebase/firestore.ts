
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove, DocumentData } from 'firebase/firestore';
import { db } from './config';
import type { Investment, UserProfile, Transaction } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  console.log(`getUserProfile llamado con userId: ${userId}`);
  if (!userId) {
    console.error("getUserProfile llamado con userId indefinido o nulo");
    return null;
  }
  const userDocRef = doc(db, 'users', userId);
  try {
    const userDocSnap = await getDoc(userDocRef);
    if (userDocSnap.exists()) {
      const data = userDocSnap.data() as UserProfile;
      if (!data.investments) {
        data.investments = [];
      }
      if (!data.transactions) {
        data.transactions = [];
      }
      console.log(`Documento de usuario encontrado para ${userId}`, data);
      return data;
    } else {
      console.warn(`¡No existe tal documento de usuario para userId: ${userId}! Ref del documento: ${userDocRef.path}`);
      return null;
    }
  } catch (error) {
    console.error(`Error al obtener el perfil de usuario para ${userId}:`, error);
    return null;
  }
}

export async function recordTransaction(userId: string, transactionData: Omit<Transaction, 'id'>): Promise<Transaction> {
  console.log(`recordTransaction llamado para userId: ${userId}`);
  if (!userId) {
    console.error("recordTransaction: userId es indefinido.");
    throw new Error("User ID is undefined");
  }
  const userDocRef = doc(db, 'users', userId);
  const newTransaction: Transaction = { ...transactionData, id: uuidv4() };

  try {
    await updateDoc(userDocRef, {
      transactions: arrayUnion(newTransaction),
    });
    console.log(`Transacción registrada para ${userId}:`, newTransaction);
    return newTransaction;
  } catch (error) {
    console.error(`Error al registrar la transacción para ${userId}:`, error);
    throw error;
  }
}

export async function addInvestment(userId: string, purchaseData: Omit<Investment, 'id' | 'companyName'> & {companyName: string, purchaseDate: string}): Promise<Investment> {
  console.log(`addInvestment llamado para userId: ${userId}`);
  const userDocRef = doc(db, 'users', userId);
  
  const userProfile = await getUserProfile(userId);
  if (!userProfile) {
    console.error(`Perfil de usuario no encontrado para userId: ${userId} en addInvestment. Lanzando error.`);
    throw new Error("User profile not found");
  }

  const existingInvestmentIndex = userProfile.investments.findIndex(inv => inv.symbol === purchaseData.symbol.toUpperCase());
  let resultingInvestment: Investment;

  const purchaseShares = purchaseData.shares;
  const purchasePrice = purchaseData.averagePurchasePrice; // This is price of current lot
  const purchaseDate = purchaseData.purchaseDate || new Date().toISOString().split('T')[0];

  if (existingInvestmentIndex > -1) {
    const existing = userProfile.investments[existingInvestmentIndex];
    const updatedShares = existing.shares + purchaseShares;
    const updatedAveragePrice = 
      ((existing.averagePurchasePrice * existing.shares) + (purchasePrice * purchaseShares)) / updatedShares;
    
    resultingInvestment = {
      ...existing,
      shares: updatedShares,
      averagePurchasePrice: parseFloat(updatedAveragePrice.toFixed(2)), // Ensure two decimal places
      // Purchase date of overall holding might be the first one or most recent, business decision.
      // For simplicity, let's keep the original purchaseDate of the holding or update if new.
      purchaseDate: existing.purchaseDate || purchaseDate, 
    };
    
    const updatedInvestments = [...userProfile.investments];
    updatedInvestments[existingInvestmentIndex] = resultingInvestment;
    
    console.log(`Actualizando inversión existente para ${userId}, símbolo ${purchaseData.symbol}`);
    await updateDoc(userDocRef, { investments: updatedInvestments });
  } else {
    resultingInvestment = { 
        id: uuidv4(),
        symbol: purchaseData.symbol.toUpperCase(),
        companyName: purchaseData.companyName,
        shares: purchaseShares,
        averagePurchasePrice: parseFloat(purchasePrice.toFixed(2)),
        purchaseDate: purchaseDate,
    };
    console.log(`Agregando nueva inversión para ${userId}, símbolo ${purchaseData.symbol}`);
    await updateDoc(userDocRef, {
      investments: arrayUnion(resultingInvestment),
    });
  }

  // Record the "purchase" transaction for this specific lot
  await recordTransaction(userId, {
    type: 'purchase',
    date: purchaseDate,
    symbol: purchaseData.symbol.toUpperCase(),
    shares: purchaseShares,
    pricePerShare: purchasePrice,
    totalAmount: parseFloat((purchaseShares * purchasePrice).toFixed(2)),
    description: `Compra de ${purchaseShares} acciones de ${purchaseData.symbol.toUpperCase()} a $${purchasePrice.toFixed(2)}`,
  });

  return resultingInvestment;
}

export async function sellSharesFromInvestment(
  userId: string, 
  investmentId: string, 
  sharesToSell: number, 
  salePrice: number, 
  saleDateString: string
): Promise<void> {
  console.log(`sellSharesFromInvestment llamado para userId: ${userId}, investmentId: ${investmentId}`);
  const userDocRef = doc(db, 'users', userId);
  const userProfile = await getUserProfile(userId);

  if (!userProfile) {
    console.error(`Perfil de usuario no encontrado para ${userId} en sellSharesFromInvestment.`);
    throw new Error("User profile not found");
  }

  const investmentIndex = userProfile.investments.findIndex(inv => inv.id === investmentId);
  if (investmentIndex === -1) {
    console.error(`Inversión ${investmentId} no encontrada para ${userId}.`);
    throw new Error("Investment not found");
  }

  const investment = userProfile.investments[investmentIndex];

  if (sharesToSell > investment.shares) {
    console.error(`Intento de vender ${sharesToSell} acciones, pero solo hay ${investment.shares} disponibles para ${investment.symbol}.`);
    throw new Error("No se pueden vender más acciones de las que se poseen.");
  }

  const updatedInvestments = [...userProfile.investments];
  if (sharesToSell === investment.shares) {
    // Selling all shares, remove the investment
    updatedInvestments.splice(investmentIndex, 1);
    console.log(`Todas las acciones de ${investment.symbol} vendidas, eliminando inversión.`);
  } else {
    // Selling some shares, update the investment
    const remainingShares = investment.shares - sharesToSell;
    // Average purchase price remains the same for the remaining shares
    updatedInvestments[investmentIndex] = {
      ...investment,
      shares: remainingShares,
    };
    console.log(`${sharesToSell} acciones de ${investment.symbol} vendidas. Quedan ${remainingShares} acciones.`);
  }

  await updateDoc(userDocRef, { investments: updatedInvestments });

  // Record the "sale" transaction
  const saleDate = saleDateString || new Date().toISOString().split('T')[0];
  await recordTransaction(userId, {
    type: 'sale',
    date: saleDate,
    symbol: investment.symbol,
    shares: sharesToSell,
    pricePerShare: salePrice,
    totalAmount: parseFloat((sharesToSell * salePrice).toFixed(2)),
    description: `Venta de ${sharesToSell} acciones de ${investment.symbol} a $${salePrice.toFixed(2)}`,
  });
}


export async function deleteInvestment(userId: string, investmentId: string): Promise<void> {
  console.log(`deleteInvestment llamado para userId: ${userId}, investmentId: ${investmentId}`);
  const userDocRef = doc(db, 'users', userId);
  const userProfile = await getUserProfile(userId);

  if (userProfile) {
    const investmentToRemove = userProfile.investments.find(inv => inv.id === investmentId);
    if (!investmentToRemove) {
      console.error(`Inversión no encontrada para eliminar: userId ${userId}, investmentId ${investmentId}`);
      throw new Error("Investment not found for deletion");
    }
    
    console.log(`Eliminando inversión (documento completo) para ${userId}, investmentId ${investmentId}`);
    await updateDoc(userDocRef, {
      investments: arrayRemove(investmentToRemove)
    });
     // Optionally, record a "sale" transaction for the full amount if deleting implies selling all
     // This might be redundant if sellSharesFromInvestment already handles full sales leading to deletion.
     // For now, direct deletion doesn't auto-log a transaction.
  } else {
    console.error(`Perfil de usuario no encontrado para userId: ${userId} en deleteInvestment. Lanzando error.`);
    throw new Error("User profile not found");
  }
}

export async function getUserInvestments(userId: string): Promise<Investment[]> {
  console.log(`getUserInvestments llamado para userId: ${userId}`);
  const userProfile = await getUserProfile(userId);
  if (userProfile) {
    console.log(`Inversiones obtenidas para ${userId}:`, userProfile.investments.length);
  } else {
    console.warn(`No se encontró perfil de usuario para ${userId} en getUserInvestments.`);
  }
  return userProfile ? userProfile.investments : [];
}

export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  console.log(`getUserTransactions llamado para userId: ${userId}`);
  const userProfile = await getUserProfile(userId);
  if (userProfile) {
    console.log(`Transacciones obtenidas para ${userId}:`, userProfile.transactions?.length || 0);
  } else {
    console.warn(`No se encontró perfil de usuario para ${userId} en getUserTransactions.`);
  }
  return userProfile?.transactions || [];
}

export async function initializeUserDocument(userId: string, email: string | null) {
  console.log(`initializeUserDocument llamado para userId: ${userId}, email: ${email}`);
  const userDocRef = doc(db, 'users', userId);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    console.log(`Inicializando nuevo documento de usuario para ${userId}`);
    await setDoc(userDocRef, {
      uid: userId,
      email: email,
      investments: [],
      transactions: [],
    });
    console.log(`Documento de usuario inicializado para ${userId}`);
  } else {
    console.log(`El documento de usuario ya existe para ${userId}`);
    const data = userDocSnap.data();
    if (data && data.transactions === undefined) { // Check if transactions is undefined specifically
      console.log(`Agregando campo 'transactions' faltante al documento existente para ${userId}`);
      await updateDoc(userDocRef, {
        transactions: []
      });
    }
  }
}
