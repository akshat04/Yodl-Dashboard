import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { date: "Jan", gasPaid: 123.45, gasPrice: 25.3, eventCount: 3 },
  { date: "Feb", gasPaid: 89.67, gasPrice: 18.2, eventCount: 2 },
  { date: "Mar", gasPaid: 156.78, gasPrice: 31.8, eventCount: 4 },
  { date: "Apr", gasPaid: 67.23, gasPrice: 15.7, eventCount: 2 },
  { date: "May", gasPaid: 234.56, gasPrice: 42.1, eventCount: 5 },
  { date: "Jun", gasPaid: 145.89, gasPrice: 28.9, eventCount: 3 },
  { date: "Jul", gasPaid: 178.34, gasPrice: 35.2, eventCount: 4 },
  { date: "Aug", gasPaid: 98.12, gasPrice: 21.4, eventCount: 2 },
];

const chartConfig = {
  gasPaid: {
    label: "Gas Paid ($)",
    color: "hsl(var(--primary))",
  },
  gasPrice: {
    label: "Avg Gas Price (Gwei)",
    color: "hsl(var(--secondary))",
  },
};

export function GasPaidChart() {
  const totalGas = mockData.reduce((sum, item) => sum + item.gasPaid, 0);
  const totalEvents = mockData.reduce((sum, item) => sum + item.eventCount, 0);
  const avgGasPerEvent = totalGas / totalEvents;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gas Paid (Fallback)</CardTitle>
            <CardDescription>For each fallback event and over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${totalGas.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total Gas Cost</div>
            <div className="text-sm text-secondary">${avgGasPerEvent.toFixed(2)} per event</div>
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
                dataKey="gasPaid" 
                stroke="var(--color-gasPaid)"
                strokeWidth={3}
                dot={{ fill: "var(--color-gasPaid)", strokeWidth: 2, r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="gasPrice" 
                stroke="var(--color-gasPrice)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-gasPrice)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
            <span>Gas Cost $ (left axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--secondary))" }}></div>
            <span>Avg Gas Price Gwei (right axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}