
import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo electrónico inválida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Dirección de correo electrónico inválida.' }),
  password: z.string().min(1, { message: 'La contraseña es requerida.' }),
});

export const InvestmentSchema = z.object({
  symbol: z.string().min(1, { message: 'El símbolo de la acción es requerido.' }).max(10).toUpperCase(),
  companyName: z.string().min(1, {message: "El nombre de la empresa es requerido."}),
  shares: z.number().positive({ message: 'El número de acciones debe ser positivo.' }),
  averagePurchasePrice: z.number().positive({ message: 'El precio de compra debe ser positivo.' }),
  purchaseDate: z.string().optional(), // Date of this specific purchase lot
});

export const SellInvestmentSchema = z.object({
  investmentId: z.string().min(1),
  sharesToSell: z.number().positive({ message: 'El número de acciones a vender debe ser positivo.' }),
  salePrice: z.number().positive({ message: 'El precio de venta debe ser positivo.' }),
  saleDate: z.string().refine(val => !val || !isNaN(Date.parse(val)), { message: 'Fecha de venta inválida.' }).optional(),
});

// News related schemas are no longer needed.
// export const StockNewsInputSchema = z.object({
//   symbols: z.array(z.string()).min(1, { message: "Debe proporcionar al menos un símbolo de acción." }),
// });
// 
// export const NewsItemSchema = z.object({
//   title: z.string().describe("El titular del artículo de noticias."),
//   summary: z.string().describe("Un breve resumen del artículo de noticias."),
//   source: z.string().describe("La fuente o publicación del artículo de noticias."),
//   date: z.string().describe("La fecha de publicación del artículo de noticias en formato ISO."),
//   url: z.string().url().describe("La URL directa al artículo de noticias completo."),
//   imageUrl: z.string().url().optional().describe("Una URL opcional a una imagen relevante para el artículo."),
//   symbol: z.string().describe("El símbolo de la acción al que se refiere esta noticia."),
// });
// 
// export const StockNewsOutputSchema = z.object({
//   news: z.array(NewsItemSchema).describe("Una lista de artículos de noticias para los símbolos de acciones proporcionados."),
// });
