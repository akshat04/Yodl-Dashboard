import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OperatorStatus = 'active' | 'de_listed' | 'pending_de_listing' | 'blacklisted';

interface Operator {
  id: string;
  name: string;
  operator_address: string;
  status: OperatorStatus;
}

export function OperatorStatusWidget() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [activeFilter, setActiveFilter] = useState<OperatorStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  const statusColors = {
    active: 'bg-status-success text-status-success-foreground',
    de_listed: 'bg-status-warning text-status-warning-foreground',
    pending_de_listing: 'bg-status-info text-status-info-foreground',
    blacklisted: 'bg-status-error text-status-error-foreground'
  };

  const statusCounts = {
    active: operators.filter(op => op.status === 'active').length,
    de_listed: operators.filter(op => op.status === 'de_listed').length,
    pending_de_listing: operators.filter(op => op.status === 'pending_de_listing').length,
    blacklisted: operators.filter(op => op.status === 'blacklisted').length
  };

  useEffect(() => {
    fetchOperators();
  }, []);

  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredOperators(operators);
    } else {
      setFilteredOperators(operators.filter(op => op.status === activeFilter));
    }
  }, [operators, activeFilter]);

  const fetchOperators = async () => {
    try {
      const { data, error } = await supabase
        .from('operators')
        .select('*')
        .order('name');

      if (error) throw error;
      setOperators(data || []);
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status: OperatorStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">Operator Status</CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchOperators}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Button
            variant={activeFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('all')}
            className="flex flex-col h-auto py-3"
          >
            <span className="text-2xl font-bold">{operators.length}</span>
            <span className="text-xs">All</span>
          </Button>
          <Button
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('active')}
            className="flex flex-col h-auto py-3"
          >
            <span className="text-2xl font-bold text-status-success">{statusCounts.active}</span>
            <span className="text-xs">Active</span>
          </Button>
          <Button
            variant={activeFilter === 'de_listed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('de_listed')}
            className="flex flex-col h-auto py-3"
          >
            <span className="text-2xl font-bold text-status-warning">{statusCounts.de_listed}</span>
            <span className="text-xs">De-listed</span>
          </Button>
          <Button
            variant={activeFilter === 'pending_de_listing' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter('pending_de_listing')}
            className="flex flex-col h-auto py-3"
          >
            <span className="text-2xl font-bold text-status-info">{statusCounts.pending_de_listing}</span>
            <span className="text-xs">Pending</span>
          </Button>
        </div>

        <div className="space-y-3 max-h-64 overflow-y-auto">
          {loading ? (
            <div className="text-center py-4 text-muted-foreground">Loading...</div>
          ) : filteredOperators.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No operators found</div>
          ) : (
            filteredOperators.map((operator) => (
              <div key={operator.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <p className="font-medium">{operator.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {operator.operator_address.slice(0, 6)}...{operator.operator_address.slice(-4)}
                  </p>
                </div>
                <Badge className={statusColors[operator.status]}>
                  {formatStatus(operator.status)}
                </Badge>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}