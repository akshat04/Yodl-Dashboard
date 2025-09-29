import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

const mockData = [
  { operator: "OP001", jan: 3, feb: 2, mar: 5, apr: 1, may: 4, jun: 2 },
  { operator: "OP002", jan: 1, feb: 4, mar: 2, apr: 3, may: 1, jun: 5 },
  { operator: "OP003", jan: 2, feb: 1, mar: 3, apr: 4, may: 2, jun: 1 },
  { operator: "OP004", jan: 4, feb: 3, mar: 1, apr: 2, may: 5, jun: 3 },
  { operator: "OP005", jan: 1, feb: 2, mar: 4, apr: 1, may: 3, jun: 4 },
];

const chartConfig = {
  challenges: {
    label: "Challenges Raised",
    color: "hsl(var(--primary))",
  },
};

export function ChallengesRaisedOperatorChart() {
  const [sortBy, setSortBy] = useState("operator");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [timeFilter, setTimeFilter] = useState("all");

  // Transform data for current display
  const transformedData = mockData.map(item => ({
    operator: item.operator,
    total: item.jan + item.feb + item.mar + item.apr + item.may + item.jun,
    recent: item.may + item.jun, // Last 2 months
  }));

  const sortedData = [...transformedData].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "total":
        aVal = a.total;
        bVal = b.total;
        break;
      case "recent":
        aVal = a.recent;
        bVal = b.recent;
        break;
      default:
        aVal = a.operator;
        bVal = b.operator;
    }
    
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === "asc" ? "desc" : "asc");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Challenges Raised</CardTitle>
            <CardDescription>Across operators and time periods</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="total">Total</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={toggleSortOrder}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="operator" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey={timeFilter === "recent" ? "recent" : "total"}
                fill="var(--color-challenges)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}