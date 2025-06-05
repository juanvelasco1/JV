
'use client';

import type { Investment, StockData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, DollarSign } from 'lucide-react'; // Changed Activity to DollarSign for P/L

interface PortfolioChartsProps {
  investments: Investment[];
  stockData: StockData[];
}

const chartConfigBase = {
  profit: { label: 'Ganancia', color: 'hsl(var(--chart-2))' }, // accent - teal
  loss: { label: 'Pérdida', color: 'hsl(var(--destructive))' }, // destructive - red
  portfolioValue: { label: 'Valor de Portafolio', color: 'hsl(var(--chart-1))'}, // primary
} satisfies ChartConfig;


export default function PortfolioCharts({ investments, stockData }: PortfolioChartsProps) {
  const stockDataMap = new Map(stockData.map(s => [s.symbol, s]));

  if (investments.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-muted-foreground" />
              Ganancias/Pérdidas por Acción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay datos de inversión para mostrar gráficos.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChartIcon className="mr-2 h-5 w-5 text-muted-foreground" />
              Composición del Portafolio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay datos de inversión para mostrar gráficos.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profitLossData = investments.map(inv => {
    const currentStockInfo = stockDataMap.get(inv.symbol);
    const currentPrice = currentStockInfo?.currentPrice || inv.averagePurchasePrice;
    const PnL = (currentPrice - inv.averagePurchasePrice) * inv.shares;
    return {
      name: inv.symbol, // Stock symbol for X-axis
      'G/P': parseFloat(PnL.toFixed(2)), // Profit/Loss for Y-axis
      // color for dot (optional, could be dynamic)
      fill: PnL >= 0 ? chartConfigBase.profit.color : chartConfigBase.loss.color,
    };
  }).sort((a, b) => a.name.localeCompare(b.name)); // Sort by symbol name for consistent line chart

  const portfolioCompositionData = investments.map(inv => {
    const currentStockInfo = stockDataMap.get(inv.symbol);
    const currentPrice = currentStockInfo?.currentPrice || inv.averagePurchasePrice;
    const marketValue = inv.shares * currentPrice;
    return {
      name: inv.symbol,
      value: parseFloat(marketValue.toFixed(2)),
    };
  }).filter(item => item.value > 0); 


  const COLORS = [
    'hsl(var(--chart-1))', 
    'hsl(var(--chart-2))', 
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];
  
  const dynamicChartConfig: ChartConfig = { ...chartConfigBase };
  portfolioCompositionData.forEach((item, index) => {
    dynamicChartConfig[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
  });


  return (
    <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline">
             <DollarSign className="mr-2 h-5 w-5 text-primary" />
            Ganancias/Pérdidas por Acción
          </CardTitle>
          <CardDescription>Visualización de la rentabilidad individual de cada acción en tu portafolio.</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={dynamicChartConfig} className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitLossData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                />
                <YAxis 
                  tickFormatter={(value) => `$${value.toLocaleString('es-ES')}`} 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                  domain={['auto', 'auto']} // Ensure y-axis adapts to negative values
                />
                <ChartTooltip
                  cursor={{strokeDasharray: '3 3'}}
                  content={<ChartTooltipContent formatter={(value, name, props) => (
                    <>
                      <div className="font-medium">{props.payload.name}</div>
                      <div className="text-muted-foreground">
                        {`${props.payload['G/P'] >= 0 ? 'Ganancia' : 'Pérdida'}: $${Math.abs(props.payload['G/P']).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                      </div>
                    </>
                  )} />}
                />
                <Line 
                  type="monotone" 
                  dataKey="G/P" 
                  stroke={'hsl(var(--primary))'} // Using primary color for the line
                  strokeWidth={2} 
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return <circle cx={cx} cy={cy} r={4} fill={payload.fill} stroke={payload.fill} />;
                  }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center font-headline">
            <PieChartIcon className="mr-2 h-5 w-5 text-primary" />
            Composición del Portafolio
          </CardTitle>
           <CardDescription>Distribución de tu capital invertido entre las diferentes acciones.</CardDescription>
        </CardHeader>
        <CardContent>
          {portfolioCompositionData.length > 0 ? (
            <ChartContainer config={dynamicChartConfig} className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent 
                                hideLabel 
                                formatter={(value, name) => (
                                    <>
                                      <div className="flex items-center">
                                        <span className="mr-2 h-2.5 w-2.5 rounded-full" style={{backgroundColor: dynamicChartConfig[name as string]?.color || '#000'}}/>
                                        <span className="font-medium">{dynamicChartConfig[name as string]?.label || name}</span>
                                      </div>
                                      <div className="text-right text-muted-foreground">
                                        ${(value as number).toLocaleString('es-ES', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                                      </div>
                                    </>
                                  )} 
                              />} 
                  />
                  <Pie
                    data={portfolioCompositionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                  >
                    {portfolioCompositionData.map((entry, index) => (
                      <Cell key={`cell-comp-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                   <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground">No hay datos suficientes para mostrar el gráfico de composición.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
