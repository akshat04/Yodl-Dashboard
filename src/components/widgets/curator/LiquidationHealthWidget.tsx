import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Zap, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface LiquidationHealth {
  id: string;
  operator_id: string;
  health_score: number;
  liquidation_threshold: number;
  current_collateral: number;
  required_collateral: number;
  risk_level: string;
  can_liquidate: boolean;
  operator: {
    name: string;
  };
}

export const LiquidationHealthWidget = () => {
  const [healthData, setHealthData] = useState<LiquidationHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [liquidating, setLiquidating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchHealthData = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_liquidation_health')
          .select(`
            id,
            operator_id,
            health_score,
            liquidation_threshold,
            current_collateral,
            required_collateral,
            risk_level,
            can_liquidate,
            operator:operators(name)
          `)
          .order('health_score', { ascending: true });

        if (error) throw error;
        setHealthData(data || []);
      } catch (error) {
        console.error('Error fetching liquidation health data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthData();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_liquidation_health_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_liquidation_health'
        },
        () => {
          fetchHealthData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLiquidate = async (operatorId: string, operatorName: string) => {
    setLiquidating(operatorId);
    
    // Simulate liquidation process
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Liquidation Initiated",
        description: `Liquidation process started for ${operatorName}`,
      });
    } catch (error) {
      toast({
        title: "Liquidation Failed",
        description: "Failed to initiate liquidation process",
        variant: "destructive",
      });
    } finally {
      setLiquidating(null);
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return "text-destructive";
      case 'medium': return "text-warning";
      default: return "text-green-500";
    }
  };

  const getBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'high': return "destructive";
      case 'medium': return "default";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Liquidation Health Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const criticalOperators = healthData.filter(op => op.can_liquidate).length;
  const atRiskOperators = healthData.filter(op => op.risk_level === 'high' || op.risk_level === 'medium').length;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Liquidation Health Monitor
          {criticalOperators > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {criticalOperators} Critical
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">At Risk</p>
            <p className="text-xl font-bold text-warning">
              {atRiskOperators}
            </p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Can Liquidate</p>
            <p className="text-xl font-bold text-destructive">
              {criticalOperators}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {healthData.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No liquidation data found</p>
          ) : (
            healthData.map((health) => (
              <div key={health.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getRiskIcon(health.risk_level)}
                    <div>
                      <p className="font-medium">{health.operator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Health Score: {health.health_score.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                  <Badge variant={getBadgeVariant(health.risk_level)}>
                    {health.risk_level.toUpperCase()}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Current: </span>
                    <span className="font-medium">
                      ${health.current_collateral.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Required: </span>
                    <span className="font-medium">
                      ${health.required_collateral.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      health.health_score < 20 ? 'bg-destructive' : 
                      health.health_score < 50 ? 'bg-warning' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(health.health_score, 100)}%` }}
                  />
                </div>

                {health.can_liquidate && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleLiquidate(health.operator_id, health.operator.name)}
                    disabled={liquidating === health.operator_id}
                    className="w-full"
                  >
                    {liquidating === health.operator_id ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Liquidate Operator
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};