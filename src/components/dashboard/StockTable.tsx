
'use client';

import type { Investment, StockData } from '@/types';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Edit2, Trash2, TrendingUp, TrendingDown, Minus, PackageOpen } from 'lucide-react'; // Edit2 can be 'DollarSign' or 'PackageOpen' for sell
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { cn } from "@/lib/utils";


interface StockTableProps {
  investments: Investment[];
  stockData: StockData[];
  onOpenSellDialog: (investment: Investment) => void; 
  onDeleteInvestment: (investmentId: string) => void; 
}

export default function StockTable({ investments, stockData, onOpenSellDialog, onDeleteInvestment }: StockTableProps) {
  const stockDataMap = new Map(stockData.map(s => [s.symbol, s]));

  if (investments.length === 0) {
    return <p className="py-10 text-center text-muted-foreground">Aún no hay inversiones. ¡Agrega tu primera acción para comenzar!</p>;
  }

  const getProfitLossColor = (value: number) => {
    if (value > 0) return 'text-accent'; 
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };
  
  const ProfitLossIcon = ({ value, className }: { value: number, className?: string }) => {
    if (value > 0) return <TrendingUp className={cn("inline h-4 w-4 mr-1", className)} />;
    if (value < 0) return <TrendingDown className={cn("inline h-4 w-4 mr-1", className)} />;
    return <Minus className={cn("inline h-4 w-4 mr-1", className)} />;
  };

  return (
    <div className="overflow-x-auto rounded-lg border shadow-md">
      <Table>
        <TableCaption className="py-4">Tus inversiones en acciones actuales.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Símbolo</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
            <TableHead className="text-right">Precio Compra Prom.</TableHead>
            <TableHead className="text-right">Precio Actual</TableHead>
            <TableHead className="text-right">Valor de Mercado</TableHead>
            <TableHead className="text-right">G/P</TableHead>
            <TableHead className="text-right">G/P %</TableHead>
            <TableHead className="text-center">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {investments.map((inv) => {
            const currentStockInfo = stockDataMap.get(inv.symbol);
            const currentPrice = currentStockInfo?.currentPrice || inv.averagePurchasePrice; 
            const marketValue = inv.shares * currentPrice;
            const profitLoss = (currentPrice - inv.averagePurchasePrice) * inv.shares;
            const profitLossPercent = inv.averagePurchasePrice * inv.shares !== 0 ? (profitLoss / (inv.averagePurchasePrice * inv.shares)) * 100 : 0;

            return (
              <TableRow key={inv.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">
                  <Badge variant="secondary">{inv.symbol}</Badge>
                </TableCell>
                <TableCell>{inv.companyName}</TableCell>
                <TableCell className="text-right">{inv.shares.toLocaleString('es-ES')}</TableCell>
                <TableCell className="text-right">${inv.averagePurchasePrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-right">
                  ${currentPrice.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {currentStockInfo?.changePercent !== undefined && (
                     <span className={`ml-1 text-xs ${getProfitLossColor(currentStockInfo.changePercent)}`}>
                        ({currentStockInfo.changePercent > 0 ? '+' : ''}{currentStockInfo.changePercent.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%)
                     </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-semibold">${marketValue.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                <TableCell className={`text-right font-semibold ${getProfitLossColor(profitLoss)}`}>
                  <ProfitLossIcon value={profitLoss} />
                  {profitLoss >= 0 ? '+' : '-'}${Math.abs(profitLoss).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                 <TableCell className={`text-right font-semibold ${getProfitLossColor(profitLossPercent)}`}>
                  {profitLossPercent.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Acciones Menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onOpenSellDialog(inv)}>
                        <PackageOpen className="mr-2 h-4 w-4" /> {/* Using PackageOpen for 'Sell' */}
                        Vender Acciones
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDeleteInvestment(inv.id)} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar Inversión
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
