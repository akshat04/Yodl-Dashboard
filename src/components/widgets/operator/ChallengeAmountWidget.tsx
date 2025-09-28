import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";

interface ChallengeAmount {
  id: string;
  operator_id: string;
  amount_due: number;
  due_date: string | null;
  is_overdue: boolean;
  operator: {
    name: string;
  };
}

export const ChallengeAmountWidget = () => {
  const [challengeAmounts, setChallengeAmounts] = useState<ChallengeAmount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallengeAmounts = async () => {
      try {
        const { data, error } = await supabase
          .from('operator_challenge_amounts')
          .select(`
            id,
            operator_id,
            amount_due,
            due_date,
            is_overdue,
            operator:operators(name)
          `)
          .order('amount_due', { ascending: false });

        if (error) throw error;
        setChallengeAmounts(data || []);
      } catch (error) {
        console.error('Error fetching challenge amounts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallengeAmounts();

    // Set up real-time subscription
    const channel = supabase
      .channel('operator_challenge_amounts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operator_challenge_amounts'
        },
        () => {
          fetchChallengeAmounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const totalAmountDue = challengeAmounts.reduce((sum, challenge) => sum + challenge.amount_due, 0);
  const overdueAmounts = challengeAmounts.filter(challenge => challenge.is_overdue);
  const totalOverdue = overdueAmounts.reduce((sum, challenge) => sum + challenge.amount_due, 0);

  const formatDueDate = (dueDateStr: string | null) => {
    if (!dueDateStr) return "No due date";
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return "Due today";
    return `Due in ${diffDays} days`;
  };

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Challenge Amounts Due
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
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
          <DollarSign className="h-5 w-5" />
          Challenge Amounts Due
          {overdueAmounts.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {overdueAmounts.length} Overdue
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Total Due</p>
            <p className="text-2xl font-bold text-primary">
              ${totalAmountDue.toLocaleString()}
            </p>
          </div>
          <div className="p-3 border rounded-lg text-center">
            <p className="text-sm text-muted-foreground">Overdue</p>
            <p className={`text-2xl font-bold ${totalOverdue > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
              ${totalOverdue.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {challengeAmounts.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No challenge amounts found</p>
          ) : (
            challengeAmounts.map((challenge) => (
              <div 
                key={challenge.id} 
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  challenge.is_overdue ? 'border-destructive bg-destructive/5' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {challenge.is_overdue ? (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  ) : (
                    <Clock className="h-5 w-5 text-primary" />
                  )}
                  <div>
                    <p className="font-medium">{challenge.operator.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDueDate(challenge.due_date)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${challenge.is_overdue ? 'text-destructive' : 'text-foreground'}`}>
                    ${challenge.amount_due.toLocaleString()}
                  </p>
                  {challenge.is_overdue && (
                    <Badge variant="destructive" className="text-xs">
                      OVERDUE
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};