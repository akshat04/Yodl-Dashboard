import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

const mockData = [
  { batch: "B001", avgTime: 15.2, minTime: 8.1, maxTime: 28.5 },
  { batch: "B002", avgTime: 12.8, minTime: 6.3, maxTime: 24.1 },
  { batch: "B003", avgTime: 18.5, minTime: 9.7, maxTime: 35.2 },
  { batch: "B004", avgTime: 14.3, minTime: 7.2, maxTime: 26.8 },
  { batch: "B005", avgTime: 16.7, minTime: 8.9, maxTime: 31.4 },
  { batch: "B006", avgTime: 13.1, minTime: 6.8, maxTime: 22.9 },
  { batch: "B007", avgTime: 17.9, minTime: 9.2, maxTime: 33.7 },
  { batch: "B008", avgTime: 11.4, minTime: 5.6, maxTime: 20.3 },
];

const chartConfig = {
  avgTime: {
    label: "Average Time (s)",
    color: "hsl(var(--primary))",
  },
  minTime: {
    label: "Min Time (s)",
    color: "hsl(var(--secondary))",
  },
  maxTime: {
    label: "Max Time (s)",
    color: "hsl(var(--destructive))",
  },
};

export function CoWCloseTimePerBatchChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Time Taken to Close CoW per Batch</CardTitle>
        <CardDescription>Showing batch trends and performance analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="avgTime" 
                stroke="var(--color-avgTime)"
                strokeWidth={3}
                dot={{ fill: "var(--color-avgTime)", r: 5 }}
              />
              <Line 
                type="monotone" 
                dataKey="minTime" 
                stroke="var(--color-minTime)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-minTime)", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="maxTime" 
                stroke="var(--color-maxTime)"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: "var(--color-maxTime)", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}