import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { timeRange: "0-5s", count: 12, isOutlier: false },
  { timeRange: "5-10s", count: 35, isOutlier: false },
  { timeRange: "10-15s", count: 48, isOutlier: false },
  { timeRange: "15-20s", count: 32, isOutlier: false },
  { timeRange: "20-25s", count: 28, isOutlier: false },
  { timeRange: "25-30s", count: 15, isOutlier: false },
  { timeRange: "30-35s", count: 8, isOutlier: true },
  { timeRange: "35-40s", count: 4, isOutlier: true },
  { timeRange: "40s+", count: 2, isOutlier: true },
];

const chartConfig = {
  count: {
    label: "Number of Trades",
    color: "hsl(var(--primary))",
  },
  outlier: {
    label: "Outliers",
    color: "hsl(var(--destructive))",
  },
};

export function CoWCloseTimeHistogram() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Taken to Close CoW per Trade</CardTitle>
        <CardDescription>Highlighting distribution and outliers</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timeRange" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="count" 
                radius={[4, 4, 0, 0]}
              >
                {mockData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.isOutlier ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--primary))" }}></div>
            <span>Normal Distribution</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "hsl(var(--destructive))" }}></div>
            <span>Outliers (&gt;30s)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}