import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const mockData = [
  { pair: "USDC/WETH", week1: 150, week2: 180, week3: 220, week4: 190 },
  { pair: "WETH/USDT", week1: 120, week2: 140, week3: 160, week4: 145 },
  { pair: "USDC/DAI", week1: 90, week2: 110, week3: 95, week4: 105 },
  { pair: "WETH/DAI", week1: 80, week2: 85, week3: 100, week4: 92 },
];

const chartConfig = {
  week1: {
    label: "Week 1",
    color: "hsl(var(--primary))",
  },
  week2: {
    label: "Week 2",
    color: "hsl(var(--secondary))",
  },
  week3: {
    label: "Week 3",
    color: "hsl(var(--accent))",
  },
  week4: {
    label: "Week 4",
    color: "hsl(var(--muted))",
  },
};

export function QuotesSubmittedChart() {
  const [timePeriod, setTimePeriod] = useState("weekly");

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Number of Pair-wise Quotes Submitted</CardTitle>
            <CardDescription>Grouped by pair and time period</CardDescription>
          </div>
          <Select value={timePeriod} onValueChange={setTimePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
              <Bar dataKey="week1" stackId="a" fill="var(--color-week1)" />
              <Bar dataKey="week2" stackId="a" fill="var(--color-week2)" />
              <Bar dataKey="week3" stackId="a" fill="var(--color-week3)" />
              <Bar dataKey="week4" stackId="a" fill="var(--color-week4)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}