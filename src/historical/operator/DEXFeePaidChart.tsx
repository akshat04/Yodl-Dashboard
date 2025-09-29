import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { date: "Jan", dexFee: 89.32, avgFeeRate: 0.25 },
  { date: "Feb", dexFee: 64.78, avgFeeRate: 0.22 },
  { date: "Mar", dexFee: 125.67, avgFeeRate: 0.28 },
  { date: "Apr", dexFee: 43.21, avgFeeRate: 0.20 },
  { date: "May", dexFee: 178.45, avgFeeRate: 0.32 },
  { date: "Jun", dexFee: 112.89, avgFeeRate: 0.26 },
  { date: "Jul", dexFee: 134.56, avgFeeRate: 0.29 },
  { date: "Aug", dexFee: 76.34, avgFeeRate: 0.23 },
];

const chartConfig = {
  dexFee: {
    label: "DEX Fee Paid ($)",
    color: "hsl(var(--primary))",
  },
  avgFeeRate: {
    label: "Avg Fee Rate (%)",
    color: "hsl(var(--secondary))",
  },
};

export function DEXFeePaidChart() {
  const totalDEXFee = mockData.reduce((sum, item) => sum + item.dexFee, 0);
  const avgFeeRate = mockData.reduce((sum, item) => sum + item.avgFeeRate, 0) / mockData.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>DEX Fee Paid (Fallback)</CardTitle>
            <CardDescription>Showing variation and trend over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">${totalDEXFee.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Total DEX Fees</div>
            <div className="text-sm text-secondary">{avgFeeRate.toFixed(2)}% avg rate</div>
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
                dataKey="dexFee" 
                stroke="var(--color-dexFee)"
                strokeWidth={3}
                dot={{ fill: "var(--color-dexFee)", strokeWidth: 2, r: 5 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="avgFeeRate" 
                stroke="var(--color-avgFeeRate)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-avgFeeRate)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
            <span>DEX Fee Amount $ (left axis)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--secondary))" }}></div>
            <span>Average Fee Rate % (right axis)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}