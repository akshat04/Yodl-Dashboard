import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimedOutRebalance {
  id: string;
  vault_address: string;
  vault_name: string;
  expiry_time: string;
  timeout_at: string | null;
  operator_compliance: boolean;
  is_overdue: boolean;
  created_at: string;
}

export const TimedOutRebalanceRequestsWidget = () => {
  const [timedOutRequests, setTimedOutRequests] = useState<TimedOutRebalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTimedOutRequests = async () => {
      try {
        // Fetch requests that are either overdue or past their expiry time
        const { data, error } = await supabase
          .from('vault_rebalances')
          .select('*')
          .or('is_overdue.eq.true,expiry_time.lt.' + new Date().toISOString())
          .order('expiry_time', { ascending: false });

        if (error) throw error;
        setTimedOutRequests(data || []);
      } catch (error) {
        console.error('Error fetching timed out rebalance requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimedOutRequests();

    // Set up real-time subscription
    const channel = supabase
      .channel('vault_rebalances_timeout')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vault_rebalances'
        },
        () => {
          fetchTimedOutRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRebalanceAction = async (requestId: string, vaultName: string, action: 'retry' | 'force') => {
    setProcessingRequest(requestId);
    
    try {
      // Simulate rebalance action
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: `Rebalance ${action === 'retry' ? 'Retry' : 'Force'} Initiated`,
        description: `${action === 'retry' ? 'Retry' : 'Force rebalance'} process started for ${vaultName}`,
      });
      
      // Refresh the data
      const { data, error } = await supabase
        .from('vault_rebalances')
        .select('*')
        .or('is_overdue.eq.true,expiry_time.lt.' + new Date().toISOString())
        .order('expiry_time', { ascending: false });

      if (!error) {
        setTimedOutRequests(data || []);
      }
    } catch (error) {
      toast({
        title: "Action Failed",
        description: `Failed to ${action} rebalance for ${vaultName}`,
        variant: "destructive",
      });
    } finally {
      setProcessingRequest(null);
    }
  };

  const getComplianceIcon = (compliant: boolean) => {
    return compliant ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-destructive" />
    );
  };

  const getTimeSinceExpiry = (expiryTime: string) => {
    const expiry = new Date(expiryTime);
    const now = new Date();
    const timeSince = now.getTime() - expiry.getTime();

    const days = Math.floor(timeSince / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeSince % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days}d ${hours}h ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else {
      return "< 1h ago";
    }
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Timed Out Rebalance Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const nonCompliantRequests = timedOutRequests.filter(req => !req.operator_compliance);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Timed Out Rebalance Requests
          {nonCompliantRequests.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {nonCompliantRequests.length} Non-Compliant
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timedOutRequests.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No timed out rebalance requests</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {timedOutRequests.length}
              </div>
              <p className="text-sm text-muted-foreground">
                Timed Out Requests
              </p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vault</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Expired</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timedOutRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{request.vault_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {request.vault_address.substring(0, 16)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getComplianceIcon(request.operator_compliance)}
                        <span className={`text-sm ${
                          request.operator_compliance ? 'text-green-500' : 'text-destructive'
                        }`}>
                          {request.operator_compliance ? 'Compliant' : 'Non-Compliant'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {getTimeSinceExpiry(request.expiry_time)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {!request.operator_compliance ? (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRebalanceAction(request.id, request.vault_name, 'retry')}
                            disabled={processingRequest === request.id}
                          >
                            {processingRequest === request.id ? (
                              <>Processing...</>
                            ) : (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </>
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRebalanceAction(request.id, request.vault_name, 'force')}
                            disabled={processingRequest === request.id}
                          >
                            Force
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="secondary">No Action Needed</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};