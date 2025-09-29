import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Shield, TrendingUp, Users, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import yodlLogo from "@/assets/yodl-logo.png";

const Index = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-accent opacity-95"></div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto text-center text-primary-foreground">
            <Badge variant="secondary" className="mb-6 bg-success/20 text-success-foreground border-success/30">
              Yield Orchestration & Distribution Layer
            </Badge>
            
            <div className="flex items-center justify-center mb-6">
              <img src={yodlLogo} alt="Yodl Logo" className="h-16 w-auto" />
            </div>
            
            <p className="text-xl md:text-2xl mb-4 text-primary-foreground/90 font-medium">
              DON'T JUST HODL.
            </p>
            
            <p className="text-3xl md:text-4xl font-bold mb-8 text-success">
              Yodl.
            </p>
            
            <p className="text-lg md:text-xl mb-12 text-primary-foreground/80 max-w-3xl mx-auto leading-relaxed">
              Principal-protected yield on capital already committed to other protocols. 
              Choose your role to access the dashboard.
            </p>

            {/* Login Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Curator Login */}
              <Card className="border-2 border-success/30 bg-card/95 backdrop-blur-sm hover:border-success/50 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-success/20 rounded-full w-fit">
                    <Shield className="h-8 w-8 text-success" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-card-foreground">Curator Dashboard</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Manage collateral and authorize operator access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-success" />
                      <span>Collateral Management</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span>Yield Analytics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-success" />
                      <span>Risk Monitoring</span>
                    </div>
                  </div>
                   <div className="space-y-3">
                     <Button 
                       className="w-full bg-success text-success-foreground hover:bg-success/90 group-hover:scale-105 transition-all duration-300"
                       size="lg"
                       onClick={() => navigate('/auth')}
                     >
                       {user ? 'Go to Dashboard' : 'Login as Curator'}
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                     <Button 
                       variant="outline"
                       className="w-full border-success/30 text-success hover:bg-success/10 group-hover:scale-105 transition-all duration-300"
                       size="lg"
                       onClick={() => navigate('/auth')}
                     >
                       Sign up as Curator
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                   </div>
                </CardContent>
              </Card>

              {/* Operator Login */}
              <Card className="border-2 border-accent/30 bg-card/95 backdrop-blur-sm hover:border-accent/50 transition-all duration-300 hover:shadow-xl group">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-accent/20 rounded-full w-fit">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-card-foreground">Operator Dashboard</CardTitle>
                  <CardDescription className="text-base text-muted-foreground">
                    Construct CoW cycles and manage executions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      <span>CoW Cycle Construction</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-accent" />
                      <span>Trade Execution</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="h-4 w-4 text-accent" />
                      <span>Stake Management</span>
                    </div>
                  </div>
                   <div className="space-y-3">
                     <Button 
                       className="w-full bg-accent text-accent-foreground hover:bg-accent/90 group-hover:scale-105 transition-all duration-300"
                       size="lg"
                       onClick={() => navigate('/auth')}
                     >
                       {user ? 'Go to Dashboard' : 'Login as Operator'}
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                     <Button 
                       variant="outline"
                       className="w-full border-accent/30 text-accent hover:bg-accent/10 group-hover:scale-105 transition-all duration-300"
                       size="lg"
                       onClick={() => navigate('/auth')}
                     >
                       Sign up as Operator
                       <ArrowRight className="ml-2 h-4 w-4" />
                     </Button>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Features Section */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-primary-foreground/80">
              <div className="text-center">
                <Shield className="h-12 w-12 mx-auto mb-4 text-success" />
                <h3 className="font-semibold text-lg mb-2">Principal Protected</h3>
                <p className="text-sm">Multi-tier protection through operator stake slashing and coverage reserves</p>
              </div>
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-success" />
                <h3 className="font-semibold text-lg mb-2">Yield Optimization</h3>
                <p className="text-sm">Earn yield on capital already committed to AMMs, lending, and restaking</p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-success" />
                <h3 className="font-semibold text-lg mb-2">Coordination Layer</h3>
                <p className="text-sm">Operators construct Coincidence of Wants cycles from DEX aggregator flow</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-8">
        <div className="container mx-auto px-6 text-center text-muted-foreground">
          <p>&copy; 2025 Yodl. Yield Orchestration & Distribution Layer.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;