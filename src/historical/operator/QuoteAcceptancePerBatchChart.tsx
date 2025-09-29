import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { batch: "B001", usdcWeth: 75, wethUsdt: 68, usdcDai: 82, wethDai: 71 },
  { batch: "B002", usdcWeth: 78, wethUsdt: 72, usdcDai: 85, wethDai: 74 },
  { batch: "B003", usdcWeth: 73, wethUsdt: 69, usdcDai: 88, wethDai: 76 },
  { batch: "B004", usdcWeth: 80, wethUsdt: 75, usdcDai: 84, wethDai: 78 },
  { batch: "B005", usdcWeth: 77, wethUsdt: 73, usdcDai: 86, wethDai: 75 },
  { batch: "B006", usdcWeth: 82, wethUsdt: 76, usdcDai: 89, wethDai: 80 },
  { batch: "B007", usdcWeth: 79, wethUsdt: 74, usdcDai: 87, wethDai: 77 },
  { batch: "B008", usdcWeth: 81, wethUsdt: 77, usdcDai: 90, wethDai: 79 },
  { batch: "B009", usdcWeth: 76, wethUsdt: 71, usdcDai: 83, wethDai: 73 },
  { batch: "B010", usdcWeth: 84, wethUsdt: 78, usdcDai: 91, wethDai: 81 },
  { batch: "B011", usdcWeth: 80, wethUsdt: 75, usdcDai: 88, wethDai: 78 },
  { batch: "B012", usdcWeth: 83, wethUsdt: 79, usdcDai: 92, wethDai: 82 },
];

const chartConfig = {
  usdcWeth: {
    label: "USDC/WETH",
    color: "hsl(var(--primary))",
  },
  wethUsdt: {
    label: "WETH/USDT",
    color: "hsl(var(--secondary))",
  },
  usdcDai: {
    label: "USDC/DAI",
    color: "hsl(var(--accent))",
  },
  wethDai: {
    label: "WETH/DAI",
    color: "hsl(var(--muted))",
  },
};

export function QuoteAcceptancePerBatchChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Percentage of Quotes Accepted per Pair per Batch</CardTitle>
        <CardDescription>Showing up to 12 bars for detailed comparison</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="usdcWeth" fill="var(--color-usdcWeth)" />
              <Bar dataKey="wethUsdt" fill="var(--color-wethUsdt)" />
              <Bar dataKey="usdcDai" fill="var(--color-usdcDai)" />
              <Bar dataKey="wethDai" fill="var(--color-wethDai)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}