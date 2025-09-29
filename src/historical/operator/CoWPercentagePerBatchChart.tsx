import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { TrendingUp, TrendingDown } from "lucide-react";

const mockData = [
  { batch: "B001", cowPercentage: 78.5 },
  { batch: "B002", cowPercentage: 82.1 },
  { batch: "B003", cowPercentage: 75.3 },
  { batch: "B004", cowPercentage: 85.7 },
  { batch: "B005", cowPercentage: 79.8 },
  { batch: "B006", cowPercentage: 88.2 },
  { batch: "B007", cowPercentage: 81.4 },
  { batch: "B008", cowPercentage: 86.9 },
  { batch: "B009", cowPercentage: 83.6 },
  { batch: "B010", cowPercentage: 90.1 },
];

const chartConfig = {
  cowPercentage: {
    label: "CoW Percentage (%)",
    color: "hsl(var(--primary))",
  },
};

export function CoWPercentagePerBatchChart() {
  const latestPercentage = mockData[mockData.length - 1].cowPercentage;
  const previousPercentage = mockData[mockData.length - 2].cowPercentage;
  const trend = latestPercentage - previousPercentage;
  const isPositiveTrend = trend > 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Percentage of CoWs per Batch</CardTitle>
            <CardDescription>Showing batchwise breakdown and trendline</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {isPositiveTrend ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
            <span className={`text-sm ${isPositiveTrend ? 'text-green-600' : 'text-red-600'}`}>
              {isPositiveTrend ? '+' : ''}{trend.toFixed(1)}%
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis domain={[70, 95]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="cowPercentage" 
                stroke="var(--color-cowPercentage)"
                strokeWidth={3}
                dot={{ fill: "var(--color-cowPercentage)", strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}