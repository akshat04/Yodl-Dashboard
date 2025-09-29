import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";

const mockData = [
  { operator: "Operator A", jan: 2, feb: 1, mar: 3, apr: 0, total: 6, stake: 125000 },
  { operator: "Operator B", jan: 4, feb: 2, mar: 1, apr: 2, total: 9, stake: 98000 },
  { operator: "Operator C", jan: 1, feb: 0, mar: 2, apr: 1, total: 4, stake: 156000 },
  { operator: "Operator D", jan: 3, feb: 3, mar: 4, apr: 3, total: 13, stake: 87000 },
  { operator: "Operator E", jan: 0, feb: 1, mar: 0, apr: 1, total: 2, stake: 142000 },
];

type SortField = "operator" | "total" | "stake";
type SortOrder = "asc" | "desc";

export function ChallengesRaisedChart() {
  const [sortField, setSortField] = useState<SortField>("total");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [timeFilter, setTimeFilter] = useState("All");

  const chartConfig = {
    jan: { label: "January", color: "hsl(var(--primary))" },
    feb: { label: "February", color: "hsl(var(--secondary))" },
    mar: { label: "March", color: "hsl(var(--accent))" },
    apr: { label: "April", color: "hsl(var(--muted))" },
  };

  const sortedData = [...mockData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-4">
        <CardTitle>Challenges Raised on Operators with Delegated Stake</CardTitle>
        <div className="flex flex-wrap gap-4">
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Months</SelectItem>
              <SelectItem value="jan">January</SelectItem>
              <SelectItem value="feb">February</SelectItem>
              <SelectItem value="mar">March</SelectItem>
              <SelectItem value="apr">April</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("operator")}
              className="flex items-center gap-1"
            >
              Operator
              <ArrowUpDown className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("total")}
              className="flex items-center gap-1"
            >
              Challenges
              <ArrowUpDown className="h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort("stake")}
              className="flex items-center gap-1"
            >
              Stake
              <ArrowUpDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sortedData}>
              <XAxis dataKey="operator" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="jan" fill="var(--color-jan)" />
              <Bar dataKey="feb" fill="var(--color-feb)" />
              <Bar dataKey="mar" fill="var(--color-mar)" />
              <Bar dataKey="apr" fill="var(--color-apr)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedData.map((operator) => (
            <div key={operator.operator} className="p-4 rounded-lg bg-muted">
              <div className="font-medium">{operator.operator}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Total Challenges: <span className="font-medium text-destructive">{operator.total}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Delegated Stake: <span className="font-medium">${operator.stake.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}