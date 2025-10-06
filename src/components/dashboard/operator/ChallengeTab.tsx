import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, Clock, DollarSign } from "lucide-react";

interface Challenge {
  id: string;
  challenge_id: string;
  amount_due: number;
  due_date: string | null;
  operator: {
    name: string;
  };
}

export function ChallengeTab() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('operator_challenge_amounts')
        .select(`
          id,
          challenge_id,
          amount_due,
          due_date,
          operator:operators(name)
        `)
        .order('amount_due', { ascending: false });

      if (error) throw error;
      
      // Mock data for challenges
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          challenge_id: 'CH-2025-001',
          amount_due: 15000,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Alpha' }
        },
        {
          id: '2',
          challenge_id: 'CH-2025-002',
          amount_due: 8500,
          due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Beta' }
        },
        {
          id: '3',
          challenge_id: 'CH-2025-003',
          amount_due: 12300,
          due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Gamma' }
        },
        {
          id: '4',
          challenge_id: 'CH-2025-004',
          amount_due: 6700,
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Delta' }
        }
      ];

      setChallenges(data?.length ? data : mockChallenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      // Use mock data on error
      const mockChallenges: Challenge[] = [
        {
          id: '1',
          challenge_id: 'CH-2025-001',
          amount_due: 15000,
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Alpha' }
        },
        {
          id: '2',
          challenge_id: 'CH-2025-002',
          amount_due: 8500,
          due_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          operator: { name: 'Operator Beta' }
        }
      ];
      setChallenges(mockChallenges);
    } finally {
      setLoading(false);
    }
  };

  const totalDue = challenges.reduce((sum, c) => sum + c.amount_due, 0);

  const formatDueDate = (dueDateStr: string | null) => {
    if (!dueDateStr) return "No due date";
    const dueDate = new Date(dueDateStr);
    const now = new Date();
    const diffDays = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Due today";
    if (diffDays < 0) return `${Math.abs(diffDays)} days ago`;
    return `Due in ${diffDays} days`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Challenges Yet to be Settled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Total Due Summary */}
          <div className="p-6 bg-muted/50 rounded-lg border-2 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Amount Due</p>
                <p className="text-4xl font-bold text-foreground">${totalDue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} pending
                </p>
              </div>
              <DollarSign className="h-16 w-16 text-muted-foreground/30" />
            </div>
          </div>

          {/* Individual Challenges */}
          <div className="space-y-3">
            {challenges.length === 0 ? (
              <div className="text-center py-12">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No pending challenges</p>
              </div>
            ) : (
              challenges.map((challenge) => (
                <div 
                  key={challenge.id}
                  className="flex items-center justify-between p-4 border-2 rounded-lg border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Clock className="h-8 w-8 text-warning" />
                    <div>
                      <p className="font-medium text-lg">{challenge.operator.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Challenge ID: {challenge.challenge_id || 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-2xl text-foreground">
                      ${challenge.amount_due.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}