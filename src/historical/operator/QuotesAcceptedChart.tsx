import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const mockData = [
  { pair: "USDC/WETH", batch1: 45, batch2: 52, batch3: 38, batch4: 41 },
  { pair: "WETH/USDT", batch1: 35, batch2: 42, batch3: 28, batch4: 33 },
  { pair: "USDC/DAI", batch1: 28, batch2: 31, batch3: 25, batch4: 29 },
  { pair: "WETH/DAI", batch1: 22, batch2: 25, batch3: 20, batch4: 24 },
];

const chartConfig = {
  batch1: {
    label: "Batch 1",
    color: "hsl(var(--primary))",
  },
  batch2: {
    label: "Batch 2",
    color: "hsl(var(--secondary))",
  },
  batch3: {
    label: "Batch 3",
    color: "hsl(var(--accent))",
  },
  batch4: {
    label: "Batch 4",
    color: "hsl(var(--muted))",
  },
};

export function QuotesAcceptedChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pair-wise Quotes Accepted</CardTitle>
        <CardDescription>Organized per pair and batch</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="pair" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="batch1" stackId="a" fill="var(--color-batch1)" />
              <Bar dataKey="batch2" stackId="a" fill="var(--color-batch2)" />
              <Bar dataKey="batch3" stackId="a" fill="var(--color-batch3)" />
              <Bar dataKey="batch4" stackId="a" fill="var(--color-batch4)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}