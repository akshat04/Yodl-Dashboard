-- Create YODL staked balance table
CREATE TABLE public.yodl_staked_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  balance NUMERIC NOT NULL DEFAULT 0,
  usd_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create YODL price ticker table
CREATE TABLE public.yodl_price_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price_usd NUMERIC NOT NULL,
  change_24h NUMERIC NOT NULL DEFAULT 0,
  volume_24h NUMERIC NOT NULL DEFAULT 0,
  market_cap NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quote limits table
CREATE TABLE public.operator_quote_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  total_limit NUMERIC NOT NULL DEFAULT 0,
  used_amount NUMERIC NOT NULL DEFAULT 0,
  percentage_used NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quote limit usage history table
CREATE TABLE public.quote_limit_usage_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  used_amount NUMERIC NOT NULL,
  total_limit NUMERIC NOT NULL,
  percentage_used NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create challenge amounts table
CREATE TABLE public.operator_challenge_amounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  amount_due NUMERIC NOT NULL DEFAULT 0,
  due_date TIMESTAMP WITH TIME ZONE,
  is_overdue BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vault outstanding rebalance amounts table
CREATE TABLE public.vault_outstanding_rebalances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_address VARCHAR NOT NULL,
  vault_name VARCHAR NOT NULL,
  outstanding_quantity NUMERIC NOT NULL DEFAULT 0,
  outstanding_usd_value NUMERIC NOT NULL DEFAULT 0,
  token_type token_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create orchestrator balances table
CREATE TABLE public.orchestrator_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  orchestrator_balance NUMERIC NOT NULL DEFAULT 0,
  escrow_balance NUMERIC NOT NULL DEFAULT 0,
  discrepancy NUMERIC NOT NULL DEFAULT 0,
  risk_level VARCHAR NOT NULL DEFAULT 'low',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vault risk data table
CREATE TABLE public.vault_risk_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_address VARCHAR NOT NULL,
  vault_name VARCHAR NOT NULL,
  amount_at_risk_usd NUMERIC NOT NULL DEFAULT 0,
  value_slashing NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  risk_ratio NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fund escrow transactions table
CREATE TABLE public.fund_escrow_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_hash VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'pending',
  amount NUMERIC NOT NULL DEFAULT 0,
  operator_id UUID REFERENCES public.operators(id),
  is_public_call BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fallback liability table
CREATE TABLE public.operator_fallback_liability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  tokens_in_custody NUMERIC NOT NULL DEFAULT 0,
  slashed_quantity NUMERIC NOT NULL DEFAULT 0,
  current_usd_price NUMERIC NOT NULL DEFAULT 0,
  liability_usd NUMERIC NOT NULL DEFAULT 0,
  token_type token_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.yodl_staked_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yodl_price_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_quote_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_limit_usage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_challenge_amounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_outstanding_rebalances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orchestrator_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_risk_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fund_escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_fallback_liability ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for read access
CREATE POLICY "Allow read access for authenticated users" ON public.yodl_staked_balances FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.yodl_price_data FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.operator_quote_limits FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.quote_limit_usage_history FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.operator_challenge_amounts FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.vault_outstanding_rebalances FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.orchestrator_balances FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.vault_risk_data FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.fund_escrow_transactions FOR SELECT USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.operator_fallback_liability FOR SELECT USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_yodl_staked_balances_updated_at BEFORE UPDATE ON public.yodl_staked_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operator_quote_limits_updated_at BEFORE UPDATE ON public.operator_quote_limits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operator_challenge_amounts_updated_at BEFORE UPDATE ON public.operator_challenge_amounts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vault_outstanding_rebalances_updated_at BEFORE UPDATE ON public.vault_outstanding_rebalances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_orchestrator_balances_updated_at BEFORE UPDATE ON public.orchestrator_balances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vault_risk_data_updated_at BEFORE UPDATE ON public.vault_risk_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fund_escrow_transactions_updated_at BEFORE UPDATE ON public.fund_escrow_transactions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operator_fallback_liability_updated_at BEFORE UPDATE ON public.operator_fallback_liability FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();