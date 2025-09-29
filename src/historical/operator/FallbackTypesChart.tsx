import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const mockData = [
  { month: "Jan", positive: 12, negative: 8 },
  { month: "Feb", positive: 15, negative: 5 },
  { month: "Mar", positive: 9, negative: 11 },
  { month: "Apr", positive: 18, negative: 4 },
  { month: "May", positive: 11, negative: 9 },
  { month: "Jun", positive: 16, negative: 6 },
  { month: "Jul", positive: 13, negative: 7 },
  { month: "Aug", positive: 20, negative: 3 },
];

const chartConfig = {
  positive: {
    label: "Positive Fallbacks",
    color: "hsl(var(--primary))",
  },
  negative: {
    label: "Negative Fallbacks",
    color: "hsl(var(--destructive))",
  },
};

export function FallbackTypesChart() {
  const totalPositive = mockData.reduce((sum, item) => sum + item.positive, 0);
  const totalNegative = mockData.reduce((sum, item) => sum + item.negative, 0);
  const positiveRate = (totalPositive / (totalPositive + totalNegative) * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Number of Positive vs Negative Fallbacks</CardTitle>
            <CardDescription>Color coding for each type over time</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{positiveRate}%</div>
            <div className="text-sm text-muted-foreground">Positive Fallback Rate</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
            <span className="text-sm text-muted-foreground">Positive Fallbacks</span>
            <span className="text-2xl font-bold text-primary">{totalPositive}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
            <span className="text-sm text-muted-foreground">Negative Fallbacks</span>
            <span className="text-2xl font-bold text-destructive">{totalNegative}</span>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar 
                dataKey="positive" 
                fill="var(--color-positive)"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="negative" 
                fill="var(--color-negative)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}