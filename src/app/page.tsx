import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartBig, ShieldCheck, TrendingUp, LogIn, UserPlus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <BarChartBig className="h-7 w-7 text-primary" />
            <span className="font-headline text-xl font-bold">J-INvest</span>
          </Link>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Iniciar Sesión
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="mr-2 h-4 w-4" /> Registrarse
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto flex flex-col items-center justify-center gap-12 px-4 py-16 text-center md:py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="font-headline text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Sigue Tus Inversiones en Acciones <span className="text-primary">Sin Esfuerzo</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              J-INvest te ayuda a monitorear tu portafolio, ver actualizaciones de precios en tiempo real y visualizar tus ganancias y pérdidas. Seguro, simple e intuitivo.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">Comienza Gratis</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Accede a Tu Portafolio</Link>
            </Button>
          </div>
        </section>

        <section className="bg-muted py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center font-headline text-3xl font-bold md:text-4xl">
              ¿Por Qué Elegir J-INvest?
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="transform shadow-lg transition-all hover:scale-105">
                <CardHeader className="items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <TrendingUp className="h-7 w-7" />
                  </div>
                  <CardTitle className="font-headline">Seguimiento en Tiempo Real</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Mantente actualizado con los precios de las acciones en vivo y observa el rendimiento de tus inversiones minuto a minuto.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="transform shadow-lg transition-all hover:scale-105">
                <CardHeader className="items-center text-center">
                   <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BarChartBig className="h-7 w-7" />
                  </div>
                  <CardTitle className="font-headline">Información de Ganancias y Pérdidas</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Visualiza claramente tus ganancias y pérdidas, distinguiendo entre el crecimiento de la inversión y el nuevo capital.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="transform shadow-lg transition-all hover:scale-105">
                <CardHeader className="items-center text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <CardTitle className="font-headline">Almacenamiento Seguro</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    Tus datos de inversión se almacenan de forma segura utilizando Firebase, garantizando que tu información esté protegida.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="md:w-1/2">
              <Image 
                src="https://placehold.co/600x400.png" 
                alt="Vista previa del Panel de Portafolio"
                data-ai-hint="dashboard chart" 
                width={600} 
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="font-headline text-3xl font-bold md:text-4xl">
                Una Visión Clara de Tu Crecimiento Financiero
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Nuestro panel intuitivo proporciona una visión general completa de tu portafolio de acciones. Toma decisiones informadas con gráficos y resúmenes fáciles de entender. Todas tus acciones, sus valores actuales y métricas de rendimiento en un solo lugar.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/signup">Únete Ahora</Link>
              </Button>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t bg-background py-8 text-center">
        <div className="container mx-auto">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} J-INvest. Creado con Next.js y Firebase.
          </p>
        </div>
      </footer>
    </div>
  );
}
