import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { useState } from "react";

const mockData = [
  { batch: "B001", operator: "OP1", date: "2024-01-15", fee: 1250 },
  { batch: "B002", operator: "OP2", date: "2024-01-16", fee: 1580 },
  { batch: "B003", operator: "OP1", date: "2024-01-17", fee: 1890 },
  { batch: "B004", operator: "OP3", date: "2024-01-18", fee: 2210 },
  { batch: "B005", operator: "OP2", date: "2024-01-19", fee: 1950 },
  { batch: "B006", operator: "OP1", date: "2024-01-20", fee: 2430 },
];

const chartConfig = {
  fee: {
    label: "Fee Earned ($)",
    color: "hsl(var(--primary))",
  },
};

export function FeeEarnedPerBatchChart() {
  const [sortBy, setSortBy] = useState("batch");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedData = [...mockData].sort((a, b) => {
    let aVal, bVal;
    switch (sortBy) {
      case "batch":
        aVal = a.batch;
        bVal = b.batch;
        break;
      case "operator":
        aVal = a.operator;
        bVal = b.operator;
        break;
      case "date":
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
        break;
      case "fee":
        aVal = a.fee;
        bVal = b.fee;
        break;
      default:
        aVal = a.batch;
        bVal = b.batch;
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
            <CardTitle>Fee Earned per Batch</CardTitle>
            <CardDescription>Sortable by batch, operator, or date</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="batch">Batch</SelectItem>
                <SelectItem value="operator">Operator</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="fee">Fee</SelectItem>
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
              <XAxis dataKey="batch" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="fee" 
                fill="var(--color-fee)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}