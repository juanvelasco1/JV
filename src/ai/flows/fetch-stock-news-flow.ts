
// This file's content was related to fetching stock news.
// Since the news functionality has been removed, this file is now a placeholder
// or can be deleted from the project.
//
// 'use server';
// /**
//  * @fileOverview A Genkit flow to fetch stock news.
//  * This functionality has been removed.
//  */
//
// import { ai } from '@/ai/genkit';
// import { z } from 'genkit';
// import { StockNewsInputSchema, StockNewsOutputSchema } from '@/lib/validators'; // These were removed too
//
// export type FetchStockNewsInput = z.infer<typeof StockNewsInputSchema>;
// export type FetchStockNewsOutput = z.infer<typeof StockNewsOutputSchema>;
//
// export async function fetchStockNews(input: FetchStockNewsInput): Promise<FetchStockNewsOutput> {
//   // const result = await fetchStockNewsFlow(input);
//   // return result;
//   console.warn("fetchStockNews flow was called but is deprecated. Returning empty news.");
//   return { news: [] }; // Return empty news as functionality is removed
// }
//
// /*
// const fetchStockNewsFlow = ai.defineFlow(
//   {
//     name: 'fetchStockNewsFlow',
//     inputSchema: StockNewsInputSchema,
//     outputSchema: StockNewsOutputSchema,
//   },
//   async (input) => {
//     // Placeholder implementation as actual news fetching is complex
//     // and requires a real news API or more sophisticated web scraping.
//     // For now, this will return mock data or an empty array.
//
//     const { output } = await ai.generate({
//       prompt: `Eres un agregador de noticias financieras. Para cada uno de los siguientes símbolos de acciones: ${input.symbols.join(', ')}, 
//       encuentra 1-2 artículos de noticias recientes y relevantes (últimos 7 días). 
//       Para cada artículo, proporciona: título, un breve resumen (1-2 frases), la fuente (ej. Reuters, Bloomberg), 
//       la fecha de publicación (en formato ISO YYYY-MM-DD), la URL directa al artículo y, si es posible, una URL a una imagen relevante.
//       Indica a qué símbolo de acción se refiere cada noticia.
//       Si no encuentras noticias para un símbolo, indícalo.`,
//       output: {
//         schema: StockNewsOutputSchema,
//       },
//       config: {
//         temperature: 0.3,
//       }
//     });
//
//     return output || { news: [] };
//   }
// );
// */
