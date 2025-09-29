import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const mockData = {
  "7D": [
    { date: "Day 1", fees: 1200 },
    { date: "Day 2", fees: 2400 },
    { date: "Day 3", fees: 3800 },
    { date: "Day 4", fees: 5200 },
    { date: "Day 5", fees: 6800 },
    { date: "Day 6", fees: 8400 },
    { date: "Day 7", fees: 10200 },
  ],
  "30D": [
    { date: "Week 1", fees: 12000 },
    { date: "Week 2", fees: 28000 },
    { date: "Week 3", fees: 45000 },
    { date: "Week 4", fees: 64000 },
  ],
  "90D": [
    { date: "Month 1", fees: 64000 },
    { date: "Month 2", fees: 142000 },
    { date: "Month 3", fees: 235000 },
  ],
  "1Y": [
    { date: "Q1", fees: 235000 },
    { date: "Q2", fees: 485000 },
    { date: "Q3", fees: 742000 },
    { date: "Q4", fees: 1024000 },
  ],
};

const timePeriods = [
  { value: "7D", label: "Last 7 Days" },
  { value: "30D", label: "Last 30 Days" },
  { value: "90D", label: "Last 90 Days" },
  { value: "1Y", label: "Last Year" },
];

export function CumulativeFeeEarnedChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("30D");

  const chartConfig = {
    fees: { label: "Cumulative Fees", color: "hsl(var(--primary))" },
  };

  const currentData = mockData[selectedPeriod as keyof typeof mockData];
  const latestFee = currentData[currentData.length - 1]?.fees || 0;

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex justify-between items-center">
          <CardTitle>Cumulative Fee Earned from Delegation</CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timePeriods.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="text-2xl font-bold text-primary">
          ${latestFee.toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData}>
              <XAxis dataKey="date" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="fees" 
                stroke="var(--color-fees)" 
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}