-- Create liquidation health table for operators
CREATE TABLE public.operator_liquidation_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  operator_id UUID REFERENCES public.operators(id),
  health_score NUMERIC NOT NULL DEFAULT 0,
  liquidation_threshold NUMERIC NOT NULL DEFAULT 0,
  current_collateral NUMERIC NOT NULL DEFAULT 0,
  required_collateral NUMERIC NOT NULL DEFAULT 0,
  risk_level VARCHAR NOT NULL DEFAULT 'low',
  can_liquidate BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create delegated vault pre-slashing table
CREATE TABLE public.delegated_vault_pre_slashing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_address VARCHAR NOT NULL,
  vault_name VARCHAR NOT NULL,
  utilized_amount NUMERIC NOT NULL DEFAULT 0,
  remaining_amount NUMERIC NOT NULL DEFAULT 0,
  total_allocated NUMERIC NOT NULL DEFAULT 0,
  utilization_percentage NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pre-slashing history table for tracking changes
CREATE TABLE public.delegated_vault_pre_slashing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vault_address VARCHAR NOT NULL,
  utilized_amount NUMERIC NOT NULL,
  remaining_amount NUMERIC NOT NULL,
  utilization_percentage NUMERIC NOT NULL,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.operator_liquidation_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegated_vault_pre_slashing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegated_vault_pre_slashing_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for read access (curators can see all data)
CREATE POLICY "Curators can view all liquidation health data" ON public.operator_liquidation_health FOR SELECT USING (true);
CREATE POLICY "Curators can view all delegated vault pre-slashing" ON public.delegated_vault_pre_slashing FOR SELECT USING (true);
CREATE POLICY "Curators can view pre-slashing history" ON public.delegated_vault_pre_slashing_history FOR SELECT USING (true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_operator_liquidation_health_updated_at BEFORE UPDATE ON public.operator_liquidation_health FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_delegated_vault_pre_slashing_updated_at BEFORE UPDATE ON public.delegated_vault_pre_slashing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Add some additional columns to existing vault_rebalances for curator functionality
ALTER TABLE public.vault_rebalances ADD COLUMN IF NOT EXISTS operator_compliance BOOLEAN DEFAULT true;
ALTER TABLE public.vault_rebalances ADD COLUMN IF NOT EXISTS is_overdue BOOLEAN DEFAULT false;
ALTER TABLE public.vault_rebalances ADD COLUMN IF NOT EXISTS timeout_at TIMESTAMP WITH TIME ZONE;