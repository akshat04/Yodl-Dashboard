import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Target, ChevronDown, ChevronUp, TrendingUp } from "lucide-react";

interface QuoteLimit {
  id: string;
  operator_id: string;
  total_limit: number;
  used_amount: number;
  percentage_used: number;
  operator: {
    name: string;
  };
}

export const QuoteLimitWidget = () => {
  const [quoteLimits, setQuoteLimits] = useState<QuoteLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOperator, setExpandedOperator] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuoteLimits = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_quote_limits')
          .select(`
            id,
            operator_id,
            total_limit,
            used_amount,
            percentage_used,
            operator:operators(name)
          `)
          .order('total_limit', { ascending: false });

        if (error) throw error;
        setQuoteLimits(data || []);
      } catch (error) {
        console.error('Error fetching quote limits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuoteLimits();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_quote_limits_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_quote_limits'
        },
        () => {
          fetchQuoteLimits();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchHistoricalData = async (operatorId: string) => {
    try {
      const { data, error } = await supabase
        .from('quote_limit_usage_history')
        .select('*')
        .eq('operator_id', operatorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  };

  const toggleExpanded = async (operatorId: string) => {
    if (expandedOperator === operatorId) {
      setExpandedOperator(null);
    } else {
      setExpandedOperator(operatorId);
      await fetchHistoricalData(operatorId);
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
            Quote Limits
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Quote Limits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quoteLimits.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No quote limits found</p>
        ) : (
          quoteLimits.map((limit) => (
            <div key={limit.id} className="border rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <div>
                    <p className="font-medium">{limit.operator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Used: ${limit.used_amount.toLocaleString()} / ${limit.total_limit.toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={limit.percentage_used > 80 ? "destructive" : limit.percentage_used > 60 ? "default" : "secondary"}
                  >
                    {limit.percentage_used.toFixed(1)}%
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(limit.operator_id)}
                  >
                    {expandedOperator === limit.operator_id ? 
                      <ChevronUp className="h-4 w-4" /> : 
                      <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </div>
              </div>
              
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    limit.percentage_used > 80 ? 'bg-destructive' : 
                    limit.percentage_used > 60 ? 'bg-primary' : 'bg-secondary'
                  }`}
                  style={{ width: `${Math.min(limit.percentage_used, 100)}%` }}
                />
              </div>

              {expandedOperator === limit.operator_id && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium mb-2">Historical Changes</p>
                  <p className="text-sm text-muted-foreground">
                    Historical data will be displayed here when available
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};