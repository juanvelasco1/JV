'use client';

import type { Investment, StockData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // CardDescription removed as it's not used
import { TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';

interface PortfolioSummaryProps {
  investments: Investment[];
  stockData: StockData[];
}

export default function PortfolioSummary({ investments, stockData }: PortfolioSummaryProps) {
  const stockDataMap = new Map(stockData.map(s => [s.symbol, s]));

  let totalPortfolioValue = 0;
  let totalCostBasis = 0;

  investments.forEach(inv => {
    const currentStockInfo = stockDataMap.get(inv.symbol);
    const currentPrice = currentStockInfo?.currentPrice || inv.averagePurchasePrice; 
    
    totalPortfolioValue += inv.shares * currentPrice;
    totalCostBasis += inv.shares * inv.averagePurchasePrice;
  });

  const totalProfitLoss = totalPortfolioValue - totalCostBasis;
  const totalProfitLossPercent = totalCostBasis > 0 ? (totalProfitLoss / totalCostBasis) * 100 : 0;

  const getProfitLossColor = (value: number) => {
    if (value > 0) return 'text-accent'; 
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };
  
  const ProfitLossIcon = ({ value }: { value: number }) => {
    if (value > 0) return <TrendingUp className="h-5 w-5 text-accent" />;
    if (value < 0) return <TrendingDown className="h-5 w-5 text-destructive" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total del Portafolio</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalPortfolioValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <p className="text-xs text-muted-foreground">
            Basado en precios actuales del mercado
          </p>
        </CardContent>
      </Card>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ganancia / Pérdida Total</CardTitle>
          <ProfitLossIcon value={totalProfitLoss} />
        </CardHeader>
        <CardContent>
          <div className={`text-3xl font-bold ${getProfitLossColor(totalProfitLoss)}`}>
            {totalProfitLoss >= 0 ? '+' : '-'}${Math.abs(totalProfitLoss).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
           <p className={`text-xs ${getProfitLossColor(totalProfitLoss)}`}>
            {totalProfitLossPercent.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}% de cambio general
          </p>
        </CardContent>
      </Card>
       <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Capital Total Invertido</CardTitle>
          <DollarSign className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">${totalCostBasis.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
           <p className="text-xs text-muted-foreground">
            Suma de todos los costos de compra
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
