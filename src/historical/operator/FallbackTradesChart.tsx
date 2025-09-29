import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const mockData = [
  { batch: "B001", fallbackTrades: 8, rebalanceEvent: "R001", eventFallbacks: 3 },
  { batch: "B002", fallbackTrades: 5, rebalanceEvent: "R001", eventFallbacks: 3 },
  { batch: "B003", fallbackTrades: 12, rebalanceEvent: "R002", eventFallbacks: 7 },
  { batch: "B004", fallbackTrades: 3, rebalanceEvent: "R002", eventFallbacks: 7 },
  { batch: "B005", fallbackTrades: 9, rebalanceEvent: "R003", eventFallbacks: 4 },
  { batch: "B006", fallbackTrades: 6, rebalanceEvent: "R003", eventFallbacks: 4 },
  { batch: "B007", fallbackTrades: 11, rebalanceEvent: "R004", eventFallbacks: 8 },
  { batch: "B008", fallbackTrades: 4, rebalanceEvent: "R004", eventFallbacks: 8 },
];

const chartConfig = {
  fallbackTrades: {
    label: "Fallback Trades per Batch",
    color: "hsl(var(--primary))",
  },
  eventFallbacks: {
    label: "Fallbacks per Rebalancing Event",
    color: "hsl(var(--secondary))",
  },
};

export function FallbackTradesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Number of Fallback Trades per Batch and per Rebalancing Event</CardTitle>
        <CardDescription>Tracking fallback frequency across batches and rebalancing events</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="batch" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar 
                dataKey="fallbackTrades" 
                fill="var(--color-fallbackTrades)"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="eventFallbacks" 
                fill="var(--color-eventFallbacks)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}