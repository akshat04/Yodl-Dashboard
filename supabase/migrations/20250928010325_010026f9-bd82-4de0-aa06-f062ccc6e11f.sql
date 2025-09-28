-- Create operator status enum
CREATE TYPE public.operator_status AS ENUM ('active', 'de_listed', 'pending_de_listing', 'blacklisted');

-- Create token type enum  
CREATE TYPE public.token_type AS ENUM ('ETH', 'USDC', 'USDT', 'DAI', 'WBTC');

-- Create operators table
CREATE TABLE public.operators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_address VARCHAR(42) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    status operator_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create operator_delegations table
CREATE TABLE public.operator_delegations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE,
    token_type token_type NOT NULL,
    amount NUMERIC(38, 18) NOT NULL DEFAULT 0,
    usd_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    server_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(operator_id, token_type)
);

-- Create operator_pre_slashing table
CREATE TABLE public.operator_pre_slashing (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE,
    token_type token_type NOT NULL,
    amount NUMERIC(38, 18) NOT NULL DEFAULT 0,
    usd_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    server_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(operator_id, token_type)
);

-- Create operator_unclaimed_fees table
CREATE TABLE public.operator_unclaimed_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES public.operators(id) ON DELETE CASCADE,
    amount_usd NUMERIC(15, 2) NOT NULL DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    server_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(operator_id)
);

-- Create vault_rebalances table
CREATE TABLE public.vault_rebalances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vault_address VARCHAR(42) NOT NULL,
    vault_name VARCHAR(255) NOT NULL,
    expiry_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.operators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_delegations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_pre_slashing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operator_unclaimed_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_rebalances ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing read access for authenticated users)
CREATE POLICY "Allow read access for authenticated users" ON public.operators FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.operator_delegations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.operator_pre_slashing FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.operator_unclaimed_fees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow read access for authenticated users" ON public.vault_rebalances FOR SELECT TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    NEW.server_time = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_operators_updated_at BEFORE UPDATE ON public.operators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operator_delegations_updated_at BEFORE UPDATE ON public.operator_delegations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_operator_pre_slashing_updated_at BEFORE UPDATE ON public.operator_pre_slashing FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();