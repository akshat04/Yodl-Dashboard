import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { date: "Jan", slippage: 245.8, avgSlippage: 0.12 },
  { date: "Feb", slippage: 189.2, avgSlippage: 0.09 },
  { date: "Mar", slippage: 378.5, avgSlippage: 0.18 },
  { date: "Apr", slippage: 156.7, avgSlippage: 0.08 },
  { date: "May", slippage: 423.1, avgSlippage: 0.21 },
  { date: "Jun", slippage: 298.4, avgSlippage: 0.15 },
  { date: "Jul", slippage: 334.6, avgSlippage: 0.16 },
  { date: "Aug", slippage: 212.9, avgSlippage: 0.10 },
];

const chartConfig = {
  slippage: {
    label: "Slippage Paid ($)",
    color: "hsl(var(--primary))",
  },
  avgSlippage: {
    label: "Avg Slippage (%)",
    color: "hsl(var(--secondary))",
  },
};

export function SlippagePaidChart() {
  const totalSlippage = mockData.reduce((sum, item) => sum + item.slippage, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Slippage Paid (Fallback)</CardTitle>
            <CardDescription>Time-based breakdown of slippage costs</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${totalSlippage.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">Total Slippage</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="slippage" 
                stroke="var(--color-slippage)"
                strokeWidth={3}
                dot={{ fill: "var(--color-slippage)", strokeWidth: 2, r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgSlippage" 
                stroke="var(--color-avgSlippage)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-avgSlippage)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
            <span>Slippage Amount $ (left axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--secondary))" }}></div>
            <span>Average Slippage % (right axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}