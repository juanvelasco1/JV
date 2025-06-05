
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getUserInvestments, deleteInvestment as deleteFirestoreInvestment, getUserTransactions, sellSharesFromInvestment } from '@/lib/firebase/firestore';
import { fetchStockPrices } from '@/lib/stockApi';
// import { fetchStockNews } from '@/ai/flows/fetch-stock-news-flow'; // Removed news flow
import type { Investment, StockData, Transaction } from '@/types'; // Removed NewsItem
import PortfolioSummary from '@/components/dashboard/PortfolioSummary';
import StockTable from '@/components/dashboard/StockTable';
import AddInvestmentForm from '@/components/dashboard/AddInvestmentForm';
import PortfolioCharts from '@/components/dashboard/PortfolioCharts';
// import StockNews from '@/components/dashboard/StockNews'; // Removed news component
import TransactionHistory from '@/components/dashboard/TransactionHistory';
import SellInvestmentForm from '@/components/dashboard/SellInvestmentForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSellDialogOpen, setIsSellDialogOpen] = useState(false);
  const [investmentToSell, setInvestmentToSell] = useState<Investment | null>(null);

  const fetchAllData = useCallback(async (isInitialLoad = true) => {
    if (!user) return;

    if (isInitialLoad) setLoading(true);
    setError(null);
    try {
      const [userInvestments, userTransactions] = await Promise.all([
        getUserInvestments(user.uid),
        getUserTransactions(user.uid)
      ]);
      
      setInvestments(userInvestments);
      setTransactions(userTransactions);
      setLoadingTransactions(false);

      if (userInvestments.length > 0) {
        const symbols = userInvestments.map(inv => inv.symbol);
        const prices = await fetchStockPrices(symbols);
        setStockData(prices);
      } else {
        setStockData([]);
      }
    } catch (err: any) {
      console.error("Fallo al obtener datos:", err);
      setError(err.message || 'Fallo al cargar los datos. Por favor, inténtalo de nuevo.');
      toast({ title: 'Error', description: err.message || 'Fallo al cargar datos.', variant: 'destructive' });
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchAllData(true);
    } else {
      setInvestments([]);
      setStockData([]);
      setTransactions([]);
      setLoading(false);
      setLoadingTransactions(false);
      setError(null);
    }
  }, [user, fetchAllData]);


  const handleDataRefresh = () => {
    fetchAllData(false); 
  };
  
  const handleOpenSellDialog = (investment: Investment) => {
    setInvestmentToSell(investment);
    setIsSellDialogOpen(true);
  };

  const handleCloseSellDialog = () => {
    setInvestmentToSell(null);
    setIsSellDialogOpen(false);
  };

  const handleInvestmentSold = () => {
    handleDataRefresh(); // Refresh all data after a sale
    handleCloseSellDialog(); // Close the dialog
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    if (!user) return;
    const investmentToDelete = investments.find(inv => inv.id === investmentId);
    if (!investmentToDelete) return;

    const confirmed = window.confirm(`¿Estás seguro de que quieres eliminar toda tu inversión en ${investmentToDelete.symbol}? Esta acción no registrará una transacción de venta.`);
    if (!confirmed) return;

    try {
      await deleteFirestoreInvestment(user.uid, investmentId);
      toast({ title: 'Éxito', description: `Inversión en ${investmentToDelete.symbol} eliminada.`});
      handleDataRefresh(); 
    } catch (err: any) {
      toast({ title: 'Error', description: `Fallo al eliminar inversión: ${err.message}`, variant: 'destructive'});
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto p-4 md:p-8 flex justify-center items-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <Card className="border-destructive bg-destructive/10">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-6 w-6" />
              Error al Cargar el Portafolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={() => fetchAllData(true)} className="mt-4" variant="destructive">Intentar de Nuevo</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto space-y-12 p-4 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight md:text-4xl">
            Panel de Mi Portafolio
          </h1>
          <p className="text-lg text-muted-foreground">
            ¡Bienvenido, {user?.email?.split('@')[0] || 'Inversor'}! Aquí tienes un resumen de tus inversiones.
          </p>
        </div>
        <AddInvestmentForm onInvestmentAdded={handleDataRefresh} />
      </div>

      <PortfolioSummary investments={investments} stockData={stockData} />

      <PortfolioCharts investments={investments} stockData={stockData} />
      
      <StockTable 
        investments={investments} 
        stockData={stockData} 
        onOpenSellDialog={handleOpenSellDialog}
        onDeleteInvestment={handleDeleteInvestment}
      />

      <TransactionHistory transactions={transactions} isLoading={loadingTransactions} />

      {investmentToSell && (
        <SellInvestmentForm
          isOpen={isSellDialogOpen}
          onClose={handleCloseSellDialog}
          investment={investmentToSell}
          onSaleCompleted={handleInvestmentSold}
        />
      )}
    </div>
  );
}
