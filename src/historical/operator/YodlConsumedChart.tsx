import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mockData = [
  { date: "Jan", yodlConsumed: 1250, cumulativeConsumed: 1250, eventCount: 3 },
  { date: "Feb", yodlConsumed: 890, cumulativeConsumed: 2140, eventCount: 2 },
  { date: "Mar", yodlConsumed: 1580, cumulativeConsumed: 3720, eventCount: 4 },
  { date: "Apr", yodlConsumed: 720, cumulativeConsumed: 4440, eventCount: 2 },
  { date: "May", yodlConsumed: 1920, cumulativeConsumed: 6360, eventCount: 5 },
  { date: "Jun", yodlConsumed: 1100, cumulativeConsumed: 7460, eventCount: 3 },
  { date: "Jul", yodlConsumed: 1480, cumulativeConsumed: 8940, eventCount: 4 },
  { date: "Aug", yodlConsumed: 950, cumulativeConsumed: 9890, eventCount: 2 },
];

const chartConfig = {
  yodlConsumed: {
    label: "YODL Consumed",
    color: "hsl(var(--primary))",
  },
  cumulativeConsumed: {
    label: "Cumulative YODL",
    color: "hsl(var(--secondary))",
  },
  eventCount: {
    label: "Event Count",
    color: "hsl(var(--accent))",
  },
};

export function YodlConsumedChart() {
  const totalConsumed = mockData[mockData.length - 1].cumulativeConsumed;
  const totalEvents = mockData.reduce((sum, item) => sum + item.eventCount, 0);
  const avgPerEvent = totalConsumed / totalEvents;

  return (
    <Card>
      <CardHeader>
        <CardTitle>YODL Consumed (Fallback)</CardTitle>
        <CardDescription>Distribution across events and cumulative tracking</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{totalConsumed.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total YODL Consumed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary">{totalEvents}</div>
            <div className="text-sm text-muted-foreground">Total Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-accent">{avgPerEvent.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">Avg per Event</div>
          </div>
        </div>

        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="monthly">Monthly Consumption</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative View</TabsTrigger>
          </TabsList>
          
          <TabsContent value="monthly">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="yodlConsumed"
                    stroke="var(--color-yodlConsumed)"
                    fill="var(--color-yodlConsumed)"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          
          <TabsContent value="cumulative">
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="cumulativeConsumed" 
                    stroke="var(--color-cumulativeConsumed)"
                    strokeWidth={3}
                    dot={{ fill: "var(--color-cumulativeConsumed)", strokeWidth: 2, r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}