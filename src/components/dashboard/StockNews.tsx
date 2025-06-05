
// 'use client';
//
// import type { NewsItem } from '@/types'; // NewsItem type is removed
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Newspaper, Loader2, Info } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { es } from 'date-fns/locale';
//
// interface StockNewsProps {
//   newsItems: NewsItem[];
//   isLoading: boolean;
// }
//
// export default function StockNews({ newsItems, isLoading }: StockNewsProps) {
//   if (isLoading) {
//     return (
//       <div>
//         <h2 className="mb-6 font-headline text-2xl font-semibold tracking-tight md:text-3xl">
//           <Newspaper className="mr-3 inline-block h-7 w-7 text-primary" />
//           Noticias Relevantes del Mercado
//         </h2>
//         <Card>
//           <CardHeader>
//             <CardTitle>Cargando noticias...</CardTitle>
//           </CardHeader>
//           <CardContent className="flex justify-center py-10">
//             <Loader2 className="h-12 w-12 animate-spin text-primary" />
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }
//
//   if (!newsItems || newsItems.length === 0) {
//     return (
//       <div>
//         <h2 className="mb-6 font-headline text-2xl font-semibold tracking-tight md:text-3xl">
//           <Newspaper className="mr-3 inline-block h-7 w-7 text-primary" />
//           Noticias Relevantes del Mercado
//         </h2>
//         <Card className="border-dashed">
//           <CardHeader className="flex-row items-center gap-3">
//               <Info className="h-6 w-6 text-muted-foreground" />
//             <div>
//               <CardTitle>No Hay Noticias Disponibles</CardTitle>
//               <CardDescription>
//                 No se encontraron noticias recientes para las acciones en tu portafolio.
//               </CardDescription>
//             </div>
//           </CardHeader>
//         </Card>
//       </div>
//     );
//   }
//
//   return (
//     <div>
//       <h2 className="mb-6 font-headline text-2xl font-semibold tracking-tight md:text-3xl">
//         <Newspaper className="mr-3 inline-block h-7 w-7 text-primary" />
//         Noticias Relevantes del Mercado
//       </h2>
//       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//         {newsItems.map((item, index) => (
//           <Card key={index} className="flex flex-col overflow-hidden shadow-lg transition-all hover:shadow-xl">
//             {item.imageUrl ? (
//               <div className="relative h-48 w-full">
//                 <Image
//                   src={item.imageUrl}
//                   alt={item.title}
//                   layout="fill"
//                   objectFit="cover"
//                   data-ai-hint="news article"
//                 />
//               </div>
//             ) : (
//               <div className="flex h-48 w-full items-center justify-center bg-muted">
//                 <Newspaper className="h-16 w-16 text-muted-foreground" />
//               </div>
//             )}
//             <CardHeader>
//               <CardTitle className="line-clamp-2 text-lg">{item.title}</CardTitle>
//               <CardDescription className="text-xs">
//                 <span className="font-semibold">{item.source}</span> - {format(parseISO(item.date), "dd MMM yyyy", { locale: es })} ({item.symbol})
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="flex-grow">
//               <p className="line-clamp-3 text-sm text-muted-foreground">{item.summary}</p>
//             </CardContent>
//             <CardFooter>
//               <Button variant="link" asChild className="p-0">
//                 <Link href={item.url} target="_blank" rel="noopener noreferrer">
//                   Leer más
//                 </Link>
//               </Button>
//             </CardFooter>
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// }

// This component has been removed as part of feature changes.
// It was used to display stock news, which is no longer part of the application.
export default function StockNews_Removed() {
  return null; // Or a placeholder indicating removal
}
