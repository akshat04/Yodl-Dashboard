-- Create enum type for curator status
CREATE TYPE public.curator_status AS ENUM ('active', 'inactive', 'suspended');

-- Add missing core IDs to the database schema

-- Create curators table
CREATE TABLE public.curators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curator_id TEXT NOT NULL UNIQUE, -- curatorId (addr/string)
  name TEXT NOT NULL,
  curator_address TEXT NOT NULL,
  status curator_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trading_batches table
CREATE TABLE public.trading_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  batch_id TEXT NOT NULL UNIQUE, -- batchId (bytes32/uuid)
  operator_id UUID REFERENCES public.operators(id),
  status TEXT NOT NULL DEFAULT 'pending',
  trade_count INTEGER NOT NULL DEFAULT 0,
  max_trades INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trades table
CREATE TABLE public.trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_id TEXT NOT NULL UNIQUE, -- tradeId (bytes32/uuid)
  batch_id TEXT REFERENCES public.trading_batches(batch_id),
  quote_id TEXT, -- quoteId reference
  operator_id UUID REFERENCES public.operators(id),
  pair_id TEXT, -- pairId reference
  token_in TEXT NOT NULL, -- tokenId
  token_out TEXT NOT NULL, -- tokenId
  amount_in NUMERIC NOT NULL DEFAULT 0,
  amount_out NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  executed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create fallbacks table
CREATE TABLE public.fallbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fallback_id TEXT NOT NULL UNIQUE, -- fallbackId (bytes32/uuid)
  trade_id TEXT REFERENCES public.trades(trade_id),
  batch_id TEXT REFERENCES public.trading_batches(batch_id),
  operator_id UUID REFERENCES public.operators(id),
  reason TEXT NOT NULL,
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create quotes table
CREATE TABLE public.quotes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote_id TEXT NOT NULL UNIQUE, -- quoteId (bytes32/uuid)
  operator_id UUID REFERENCES public.operators(id),
  pair_id TEXT NOT NULL, -- pairId reference
  token_in TEXT NOT NULL, -- tokenId
  token_out TEXT NOT NULL, -- tokenId
  amount_in NUMERIC NOT NULL DEFAULT 0,
  amount_out NUMERIC NOT NULL DEFAULT 0,
  price NUMERIC NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  eip712_hash TEXT, -- EIP-712 hash
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create trading_pairs table
CREATE TABLE public.trading_pairs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pair_id TEXT NOT NULL UNIQUE, -- pairId (tokenIn|tokenOut canonical order)
  token_in TEXT NOT NULL, -- tokenId
  token_out TEXT NOT NULL, -- tokenId
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tokens table for proper tokenId management
CREATE TABLE public.tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  token_id TEXT NOT NULL UNIQUE, -- tokenId (addr/symbol)
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  decimals INTEGER NOT NULL DEFAULT 18,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  server_time TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing core IDs to existing tables

-- Add rebalanceId to vault_rebalances
ALTER TABLE public.vault_rebalances 
ADD COLUMN rebalance_id TEXT UNIQUE;

-- Add challengeId to operator_challenge_amounts
ALTER TABLE public.operator_challenge_amounts 
ADD COLUMN challenge_id TEXT UNIQUE;

-- Add vaultId to vault tables (standardizing vault_address as vaultId)
ALTER TABLE public.vault_rebalances 
ADD COLUMN vault_id TEXT;

ALTER TABLE public.vault_risk_data 
ADD COLUMN vault_id TEXT;

ALTER TABLE public.vault_outstanding_rebalances 
ADD COLUMN vault_id TEXT;

-- Update vault_id with vault_address values
UPDATE public.vault_rebalances SET vault_id = vault_address;
UPDATE public.vault_risk_data SET vault_id = vault_address;
UPDATE public.vault_outstanding_rebalances SET vault_id = vault_address;

-- Add operatorId standardization (ensuring consistency)
ALTER TABLE public.operators 
ADD COLUMN operator_id_external TEXT UNIQUE;

-- Enable RLS on new tables
ALTER TABLE public.curators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fallbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_pairs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Authenticated users can view curators" 
ON public.curators FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view trading batches" 
ON public.trading_batches FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view trades" 
ON public.trades FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view fallbacks" 
ON public.fallbacks FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view quotes" 
ON public.quotes FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view trading pairs" 
ON public.trading_pairs FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can view tokens" 
ON public.tokens FOR SELECT 
USING (true);

-- Create curator-specific policies
CREATE POLICY "Curators can manage curators" 
ON public.curators FOR ALL 
USING (has_role(auth.uid(), 'curator'::app_role));

CREATE POLICY "Curators can manage trading batches" 
ON public.trading_batches FOR ALL 
USING (has_role(auth.uid(), 'curator'::app_role));

CREATE POLICY "Curators can manage trades" 
ON public.trades FOR ALL 
USING (has_role(auth.uid(), 'curator'::app_role));

CREATE POLICY "Curators can manage quotes" 
ON public.quotes FOR ALL 
USING (has_role(auth.uid(), 'curator'::app_role));

-- Add update triggers for new tables
CREATE TRIGGER update_curators_updated_at
BEFORE UPDATE ON public.curators
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_batches_updated_at
BEFORE UPDATE ON public.trading_batches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
BEFORE UPDATE ON public.trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trading_pairs_updated_at
BEFORE UPDATE ON public.trading_pairs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tokens_updated_at
BEFORE UPDATE ON public.tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_curators_curator_id ON public.curators(curator_id);
CREATE INDEX idx_trading_batches_batch_id ON public.trading_batches(batch_id);
CREATE INDEX idx_trades_trade_id ON public.trades(trade_id);
CREATE INDEX idx_fallbacks_fallback_id ON public.fallbacks(fallback_id);
CREATE INDEX idx_quotes_quote_id ON public.quotes(quote_id);
CREATE INDEX idx_trading_pairs_pair_id ON public.trading_pairs(pair_id);
CREATE INDEX idx_tokens_token_id ON public.tokens(token_id);
CREATE INDEX idx_vault_rebalances_rebalance_id ON public.vault_rebalances(rebalance_id);
CREATE INDEX idx_operator_challenge_amounts_challenge_id ON public.operator_challenge_amounts(challenge_id);