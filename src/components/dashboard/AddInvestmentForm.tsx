
'use client';

import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type * as z from 'zod';
import { InvestmentSchema } from '@/lib/validators';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { addInvestment } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import type { Investment } from '@/types';
import { PlusCircle, Search, Loader2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { searchStockSymbol, getStockDetails } from '@/lib/stockApi'; 

interface AddInvestmentFormProps {
  onInvestmentAdded: () => void; // Changed to no argument as full investment might not be directly available
}

export default function AddInvestmentForm({ onInvestmentAdded }: AddInvestmentFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [symbolSearch, setSymbolSearch] = useState('');
  const [searchResults, setSearchResults] = useState<{ symbol: string; name: string }[]>([]);
  const [isSearchingPopover, setIsSearchingPopover] = useState(false); 
  const [isFetchingCompanyName, setIsFetchingCompanyName] = useState(false); 
  const [isSymbolPopoverOpen, setIsSymbolPopoverOpen] = useState(false);

  const form = useForm<z.infer<typeof InvestmentSchema>>({
    resolver: zodResolver(InvestmentSchema),
    defaultValues: {
      symbol: '',
      companyName: '',
      shares: 0,
      averagePurchasePrice: 0, // This will be the price for this specific lot
      purchaseDate: new Date().toISOString().split('T')[0], 
    },
  });

  useEffect(() => {
    if (symbolSearch.length > 0) {
      const fetchSymbols = async () => {
        setIsSearchingPopover(true);
        const results = await searchStockSymbol(symbolSearch);
        setSearchResults(results);
        setIsSearchingPopover(false);
        if (results.length > 0 && document.activeElement === form.control._fields.symbol?._f.ref) {
             setIsSymbolPopoverOpen(true);
        } else if (results.length === 0) {
            setIsSymbolPopoverOpen(false);
        }
      };
      const debounce = setTimeout(fetchSymbols, 300);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
      setIsSymbolPopoverOpen(false);
    }
  }, [symbolSearch, form.control._fields.symbol]);

  const handleSymbolSelect = async (selectedSymbol: string, selectedName: string) => {
    form.setValue('symbol', selectedSymbol, { shouldValidate: true });
    form.setValue('companyName', selectedName, { shouldValidate: true });
    setSymbolSearch(selectedSymbol); 
    setIsSymbolPopoverOpen(false); 
    setSearchResults([]); 
  };

  async function onSubmit(values: z.infer<typeof InvestmentSchema>) {
    if (!user) {
      toast({ title: 'Error', description: 'Debes iniciar sesión.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const purchaseData = {
        symbol: values.symbol,
        companyName: values.companyName, // Ensure companyName is passed
        shares: values.shares,
        averagePurchasePrice: values.averagePurchasePrice, // This is the price of the current lot
        purchaseDate: values.purchaseDate || new Date().toISOString().split('T')[0],
      };
      await addInvestment(user.uid, purchaseData);
      onInvestmentAdded(); // Signal parent to refetch data
      toast({ title: 'Éxito', description: 'Inversión agregada exitosamente.' });
      form.reset({ 
        symbol: '',
        companyName: '',
        shares: 0,
        averagePurchasePrice: 0,
        purchaseDate: new Date().toISOString().split('T')[0],
      });
      setSymbolSearch(''); 
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error al Agregar Inversión', description: error.message || 'Fallo al agregar inversión.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }
  
  const handleSymbolInputBlur = async () => {
    setTimeout(async () => {
      const currentSymbol = form.getValues('symbol');
      const currentCompanyName = form.getValues('companyName');

      if (currentSymbol && (!currentCompanyName || currentCompanyName.trim() === '' || currentCompanyName === 'N/A') && !isSymbolPopoverOpen) {
        setIsFetchingCompanyName(true);
        try {
          const stockDetails = await getStockDetails(currentSymbol);
          if (stockDetails && stockDetails.companyName && stockDetails.companyName !== 'N/A' && stockDetails.companyName.trim() !== '') {
            form.setValue('companyName', stockDetails.companyName, { shouldValidate: true });
          } else {
            form.setValue('companyName', '', { shouldValidate: true });
          }
        } catch (err) {
          console.error("Fallo al obtener detalles de la empresa en onBlur:", err);
          form.setValue('companyName', '', { shouldValidate: true }); 
        } finally {
          setIsFetchingCompanyName(false);
        }
      }
    }, 200); 
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) {
        form.reset({
            symbol: '',
            companyName: '',
            shares: 0,
            averagePurchasePrice: 0,
            purchaseDate: new Date().toISOString().split('T')[0],
        });
        setSymbolSearch('');
        setIsFetchingCompanyName(false);
        setIsSearchingPopover(false);
      }
    }}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Agregar Inversión
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Agregar Nueva Inversión</DialogTitle>
          <DialogDescription>
            Ingresa los detalles de tu nueva compra de acciones. Se agregará a tu portafolio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Símbolo de la Acción</FormLabel>
                  <Popover open={isSymbolPopoverOpen} onOpenChange={setIsSymbolPopoverOpen}>
                    <PopoverTrigger asChild className="w-full">
                      <div className="relative">
                        <Input
                          placeholder="Ej. AAPL"
                          {...field}
                          value={symbolSearch}
                          onChange={(e) => {
                            const upperValue = e.target.value.toUpperCase()
                            field.onChange(upperValue); 
                            setSymbolSearch(upperValue);
                            if(!isSymbolPopoverOpen && upperValue.length > 0) setIsSymbolPopoverOpen(true);
                          }}
                          onBlur={handleSymbolInputBlur}
                          onFocus={() => {if (searchResults.length > 0 && symbolSearch.length > 0) setIsSymbolPopoverOpen(true)}}
                          className="uppercase"
                        />
                        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </div>
                    </PopoverTrigger>
                    {isSymbolPopoverOpen && symbolSearch.length > 0 && (
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" 
                        onOpenAutoFocus={(e) => e.preventDefault()} 
                        onCloseAutoFocus={(e) => e.preventDefault()}
                       >
                        {isSearchingPopover ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">Buscando...</div>
                        ) : searchResults.length > 0 ? (
                          <ul className="max-h-60 overflow-y-auto">
                            {searchResults.map((item) => (
                              <li key={item.symbol}>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="w-full justify-start rounded-none px-3 py-2 text-sm"
                                  onClick={() => handleSymbolSelect(item.symbol, item.name)}
                                >
                                  <span className="font-semibold">{item.symbol}</span> - {item.name}
                                </Button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                           <div className="p-4 text-center text-sm text-muted-foreground">No se encontraron resultados.</div>
                        )}
                      </PopoverContent>
                    )}
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Empresa</FormLabel>
                  <FormControl>
                    <div className="relative">
                        <Input placeholder="Ej. Apple Inc." {...field} readOnly disabled 
                          className={isFetchingCompanyName ? "bg-muted/50" : ""} />
                        {isFetchingCompanyName && (
                            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                        )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="shares"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Acciones Compradas</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej. 10" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="averagePurchasePrice" // This is price of current lot
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Precio de Compra (por acción para esta compra)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="Ej. 150.50" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="purchaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Compra</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={loading || isFetchingCompanyName}>
                {(loading || isFetchingCompanyName) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Agregando...' : (isFetchingCompanyName ? 'Obteniendo datos...' : 'Agregar Compra')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
