
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { SellInvestmentSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { sellSharesFromInvestment } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import type { Investment } from '@/types';
import { Loader2, PackageOpen } from 'lucide-react';

interface SellInvestmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  investment: Investment;
  onSaleCompleted: () => void;
}

export default function SellInvestmentForm({ isOpen, onClose, investment, onSaleCompleted }: SellInvestmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof SellInvestmentSchema>>({
    resolver: zodResolver(SellInvestmentSchema),
    defaultValues: {
      investmentId: investment.id,
      sharesToSell: 0,
      salePrice: 0,
      saleDate: new Date().toISOString().split('T')[0],
    },
  });

  // Reset form when investment changes or dialog opens/closes
  useEffect(() => {
    if (investment) {
      form.reset({
        investmentId: investment.id,
        sharesToSell: 0,
        salePrice: 0, // Or fetch current market price as default?
        saleDate: new Date().toISOString().split('T')[0],
      });
    }
  }, [investment, isOpen, form]);


  async function onSubmit(values: z.infer<typeof SellInvestmentSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'Debes iniciar sesión.', variant: 'destructive' });
      return;
    }
    if (values.sharesToSell > investment.shares) {
      form.setError('sharesToSell', { type: 'manual', message: `No puedes vender más de ${investment.shares} acciones.`});
      return;
    }
    setLoading(true);
    try {
      await sellSharesFromInvestment(
        user.uid,
        values.investmentId,
        values.sharesToSell,
        values.salePrice,
        values.saleDate || new Date().toISOString().split('T')[0]
      );
      toast({ title: 'Éxito', description: `Venta de ${values.sharesToSell} acciones de ${investment.symbol} registrada.` });
      onSaleCompleted();
    } catch (error: any) {
      toast({ title: 'Error al Vender Acciones', description: error.message || 'Fallo al registrar la venta.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  if (!investment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline flex items-center">
            <PackageOpen className="mr-2 h-6 w-6" />
            Vender Acciones de {investment.symbol}
          </DialogTitle>
          <DialogDescription>
            Posees {investment.shares.toLocaleString('es-ES')} acciones de {investment.companyName}.
            Ingresa los detalles de la venta.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="sharesToSell"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Acciones a Vender</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Ej. 5" 
                      {...field} 
                      onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                      max={investment.shares}
                    />
                  </FormControl>
                  <FormDescription>
                    Máximo: {investment.shares.toLocaleString('es-ES')} acciones.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Venta (por acción)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej. 160.25" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saleDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Venta</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Registrando Venta...' : 'Confirmar Venta'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

