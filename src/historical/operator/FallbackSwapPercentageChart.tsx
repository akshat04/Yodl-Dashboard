import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { batch: "B001", fallbackPercentage: 12.5 },
  { batch: "B002", fallbackPercentage: 8.7 },
  { batch: "B003", fallbackPercentage: 18.3 },
  { batch: "B004", fallbackPercentage: 5.2 },
  { batch: "B005", fallbackPercentage: 14.8 },
  { batch: "B006", fallbackPercentage: 9.6 },
  { batch: "B007", fallbackPercentage: 16.4 },
  { batch: "B008", fallbackPercentage: 7.1 },
  { batch: "B009", fallbackPercentage: 11.9 },
  { batch: "B010", fallbackPercentage: 13.3 },
];

const chartConfig = {
  fallbackPercentage: {
    label: "Fallback Percentage (%)",
    color: "hsl(var(--primary))",
  },
};

export function FallbackSwapPercentageChart() {
  const averageFallback = mockData.reduce((sum, item) => sum + item.fallbackPercentage, 0) / mockData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Percentage of Fallback Swaps per Batch</CardTitle>
        <CardDescription>With batch comparison and trend analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Average Fallback Rate:</span>
            <span className="font-semibold">{averageFallback.toFixed(1)}%</span>
          </div>
        </div>
        
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis domain={[0, 20]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="fallbackPercentage" 
                stroke="var(--color-fallbackPercentage)"
                strokeWidth={3}
                dot={{ fill: "var(--color-fallbackPercentage)", strokeWidth: 2, r: 5 }}
              />
              {/* Average line */}
              <Line 
                type="monotone" 
                dataKey={() => averageFallback}
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}