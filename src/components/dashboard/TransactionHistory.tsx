
'use client';

import type { Transaction } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListCollapse, Info, ShoppingCart, DollarSign, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface TransactionHistoryProps {
  transactions: Transaction[];
  isLoading: boolean;
}

export default function TransactionHistory({ transactions, isLoading }: TransactionHistoryProps) {
  const getTransactionTypeInfo = (type: Transaction['type']) => {
    switch (type) {
      case 'purchase':
        return { label: 'Compra', icon: <ShoppingCart className="mr-2 h-4 w-4 text-green-500" />, color: 'text-green-500' };
      case 'sale':
        return { label: 'Venta', icon: <DollarSign className="mr-2 h-4 w-4 text-blue-500" />, color: 'text-blue-500' };
      // Add other types like deposit, withdrawal later
      default:
        return { label: type, icon: <Info className="mr-2 h-4 w-4 text-muted-foreground" />, color: 'text-muted-foreground' };
    }
  };


  if (isLoading) {
    return (
      <div>
        <h2 className="mb-6 font-headline text-2xl font-semibold tracking-tight md:text-3xl">
          <ListCollapse className="mr-3 inline-block h-7 w-7 text-primary" />
          Historial de Transacciones
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Cargando historial...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center py-10">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (transactions.length === 0) {
    return (
      <div>
        <h2 className="mb-6 font-headline text-2xl font-semibold tracking-tight md:text-3xl">
          <ListCollapse className="mr-3 inline-block h-7 w-7 text-primary" />
          Historial de Transacciones
        </h2>
        <Card className="border-dashed">
          <CardHeader className="flex-row items-center gap-3">
              <Info className="h-6 w-6 text-muted-foreground" />
            <div>
              <CardTitle>Sin Transacciones</CardTitle>
              <CardDescription>
                  Aún no se han registrado compras o ventas.
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-6 font-headline text-2xl font-semibold tracking-tight md:text-3xl">
        <ListCollapse className="mr-3 inline-block h-7 w-7 text-primary" />
        Historial de Transacciones
      </h2>
      <Card className="shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Símbolo</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
                <TableHead className="text-right">Precio/Acción</TableHead>
                <TableHead className="text-right">Monto Total</TableHead>
                <TableHead>Descripción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()).map((tx) => {
                const typeInfo = getTransactionTypeInfo(tx.type);
                return (
                  <TableRow key={tx.id}>
                    <TableCell>{format(parseISO(tx.date), "dd MMM yyyy", { locale: es })}</TableCell>
                    <TableCell>
                      <Badge variant={tx.type === 'purchase' ? 'default' : (tx.type === 'sale' ? 'secondary' : 'outline')} 
                             className={tx.type === 'purchase' ? 'bg-accent text-accent-foreground hover:bg-accent/80' : (tx.type === 'sale' ? 'bg-blue-500 text-white hover:bg-blue-600' : '')}>
                        <span className="flex items-center">
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{tx.symbol}</TableCell>
                    <TableCell className="text-right">{tx.shares.toLocaleString('es-ES')}</TableCell>
                    <TableCell className="text-right">${tx.pricePerShare.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    <TableCell className={`text-right font-semibold ${tx.type === 'purchase' ? 'text-destructive' : typeInfo.color}`}>
                      {tx.type === 'purchase' ? '-' : '+'}${tx.totalAmount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{tx.description}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
