import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mockData = [
  { date: "Jan", usdcWeth: 75, wethUsdt: 68, usdcDai: 82, wethDai: 71 },
  { date: "Feb", usdcWeth: 78, wethUsdt: 72, usdcDai: 85, wethDai: 74 },
  { date: "Mar", usdcWeth: 73, wethUsdt: 69, usdcDai: 88, wethDai: 76 },
  { date: "Apr", usdcWeth: 80, wethUsdt: 75, usdcDai: 84, wethDai: 78 },
  { date: "May", usdcWeth: 77, wethUsdt: 73, usdcDai: 86, wethDai: 75 },
  { date: "Jun", usdcWeth: 82, wethUsdt: 76, usdcDai: 89, wethDai: 80 },
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

export function QuoteAcceptanceRateChart() {
  const [timeFilter, setTimeFilter] = useState("6months");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Percentage of Quotes Accepted per Pair</CardTitle>
            <CardDescription>With selectable time filter</CardDescription>
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="1year">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="usdcWeth" 
                stroke="var(--color-usdcWeth)"
                strokeWidth={2}
                dot={{ fill: "var(--color-usdcWeth)", r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="wethUsdt" 
                stroke="var(--color-wethUsdt)"
                strokeWidth={2}
                dot={{ fill: "var(--color-wethUsdt)", r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="usdcDai" 
                stroke="var(--color-usdcDai)"
                strokeWidth={2}
                dot={{ fill: "var(--color-usdcDai)", r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="wethDai" 
                stroke="var(--color-wethDai)"
                strokeWidth={2}
                dot={{ fill: "var(--color-wethDai)", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}