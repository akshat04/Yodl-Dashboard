export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      curators: {
        Row: {
          created_at: string
          curator_address: string
          curator_id: string
          id: string
          name: string
          server_time: string | null
          status: Database["public"]["Enums"]["curator_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          curator_address: string
          curator_id: string
          id?: string
          name: string
          server_time?: string | null
          status?: Database["public"]["Enums"]["curator_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          curator_address?: string
          curator_id?: string
          id?: string
          name?: string
          server_time?: string | null
          status?: Database["public"]["Enums"]["curator_status"]
          updated_at?: string
        }
        Relationships: []
      }
      delegated_vault_pre_slashing: {
        Row: {
          created_at: string
          id: string
          remaining_amount: number
          server_time: string | null
          total_allocated: number
          updated_at: string
          utilization_percentage: number
          utilized_amount: number
          vault_address: string
          vault_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          remaining_amount?: number
          server_time?: string | null
          total_allocated?: number
          updated_at?: string
          utilization_percentage?: number
          utilized_amount?: number
          vault_address: string
          vault_name: string
        }
        Update: {
          created_at?: string
          id?: string
          remaining_amount?: number
          server_time?: string | null
          total_allocated?: number
          updated_at?: string
          utilization_percentage?: number
          utilized_amount?: number
          vault_address?: string
          vault_name?: string
        }
        Relationships: []
      }
      delegated_vault_pre_slashing_history: {
        Row: {
          id: string
          recorded_at: string
          remaining_amount: number
          server_time: string | null
          utilization_percentage: number
          utilized_amount: number
          vault_address: string
        }
        Insert: {
          id?: string
          recorded_at?: string
          remaining_amount: number
          server_time?: string | null
          utilization_percentage: number
          utilized_amount: number
          vault_address: string
        }
        Update: {
          id?: string
          recorded_at?: string
          remaining_amount?: number
          server_time?: string | null
          utilization_percentage?: number
          utilized_amount?: number
          vault_address?: string
        }
        Relationships: []
      }
      fallbacks: {
        Row: {
          batch_id: string | null
          created_at: string
          executed_at: string
          fallback_id: string
          id: string
          operator_id: string | null
          reason: string
          server_time: string | null
          trade_id: string | null
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          executed_at?: string
          fallback_id: string
          id?: string
          operator_id?: string | null
          reason: string
          server_time?: string | null
          trade_id?: string | null
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          executed_at?: string
          fallback_id?: string
          id?: string
          operator_id?: string | null
          reason?: string
          server_time?: string | null
          trade_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fallbacks_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "trading_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "fallbacks_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fallbacks_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "trades"
            referencedColumns: ["trade_id"]
          },
        ]
      }
      fund_escrow_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          is_public_call: boolean
          operator_id: string | null
          server_time: string | null
          status: string
          transaction_hash: string | null
          updated_at: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          is_public_call?: boolean
          operator_id?: string | null
          server_time?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          is_public_call?: boolean
          operator_id?: string | null
          server_time?: string | null
          status?: string
          transaction_hash?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fund_escrow_transactions_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_challenge_amounts: {
        Row: {
          amount_due: number
          challenge_id: string | null
          created_at: string
          due_date: string | null
          id: string
          is_overdue: boolean
          operator_id: string | null
          server_time: string | null
          updated_at: string
        }
        Insert: {
          amount_due?: number
          challenge_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_overdue?: boolean
          operator_id?: string | null
          server_time?: string | null
          updated_at?: string
        }
        Update: {
          amount_due?: number
          challenge_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          is_overdue?: boolean
          operator_id?: string | null
          server_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_challenge_amounts_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_delegations: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          operator_id: string | null
          server_time: string | null
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at: string | null
          usd_value: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          operator_id?: string | null
          server_time?: string | null
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at?: string | null
          usd_value?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          operator_id?: string | null
          server_time?: string | null
          token_type?: Database["public"]["Enums"]["token_type"]
          updated_at?: string | null
          usd_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "operator_delegations_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_fallback_liability: {
        Row: {
          created_at: string
          current_usd_price: number
          id: string
          liability_usd: number
          operator_id: string | null
          server_time: string | null
          slashed_quantity: number
          token_type: Database["public"]["Enums"]["token_type"]
          tokens_in_custody: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_usd_price?: number
          id?: string
          liability_usd?: number
          operator_id?: string | null
          server_time?: string | null
          slashed_quantity?: number
          token_type: Database["public"]["Enums"]["token_type"]
          tokens_in_custody?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_usd_price?: number
          id?: string
          liability_usd?: number
          operator_id?: string | null
          server_time?: string | null
          slashed_quantity?: number
          token_type?: Database["public"]["Enums"]["token_type"]
          tokens_in_custody?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_fallback_liability_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_liquidation_health: {
        Row: {
          can_liquidate: boolean
          created_at: string
          current_collateral: number
          health_score: number
          id: string
          liquidation_threshold: number
          operator_id: string | null
          required_collateral: number
          risk_level: string
          server_time: string | null
          updated_at: string
        }
        Insert: {
          can_liquidate?: boolean
          created_at?: string
          current_collateral?: number
          health_score?: number
          id?: string
          liquidation_threshold?: number
          operator_id?: string | null
          required_collateral?: number
          risk_level?: string
          server_time?: string | null
          updated_at?: string
        }
        Update: {
          can_liquidate?: boolean
          created_at?: string
          current_collateral?: number
          health_score?: number
          id?: string
          liquidation_threshold?: number
          operator_id?: string | null
          required_collateral?: number
          risk_level?: string
          server_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operator_liquidation_health_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_pre_slashing: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          operator_id: string | null
          server_time: string | null
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at: string | null
          usd_value: number
        }
        Insert: {
          amount?: number
          created_at?: string | null
          id?: string
          operator_id?: string | null
          server_time?: string | null
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at?: string | null
          usd_value?: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          operator_id?: string | null
          server_time?: string | null
          token_type?: Database["public"]["Enums"]["token_type"]
          updated_at?: string | null
          usd_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "operator_pre_slashing_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_quote_limits: {
        Row: {
          created_at: string
          id: string
          operator_id: string | null
          percentage_used: number
          server_time: string | null
          total_limit: number
          updated_at: string
          used_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          operator_id?: string | null
          percentage_used?: number
          server_time?: string | null
          total_limit?: number
          updated_at?: string
          used_amount?: number
        }
        Update: {
          created_at?: string
          id?: string
          operator_id?: string | null
          percentage_used?: number
          server_time?: string | null
          total_limit?: number
          updated_at?: string
          used_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "operator_quote_limits_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operator_unclaimed_fees: {
        Row: {
          amount_usd: number
          id: string
          last_updated: string | null
          operator_id: string | null
          server_time: string | null
        }
        Insert: {
          amount_usd?: number
          id?: string
          last_updated?: string | null
          operator_id?: string | null
          server_time?: string | null
        }
        Update: {
          amount_usd?: number
          id?: string
          last_updated?: string | null
          operator_id?: string | null
          server_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operator_unclaimed_fees_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: true
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      operators: {
        Row: {
          created_at: string | null
          id: string
          name: string
          operator_address: string
          operator_id_external: string | null
          server_time: string | null
          status: Database["public"]["Enums"]["operator_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          operator_address: string
          operator_id_external?: string | null
          server_time?: string | null
          status?: Database["public"]["Enums"]["operator_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          operator_address?: string
          operator_id_external?: string | null
          server_time?: string | null
          status?: Database["public"]["Enums"]["operator_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      orchestrator_balances: {
        Row: {
          created_at: string
          discrepancy: number
          escrow_balance: number
          id: string
          operator_id: string | null
          orchestrator_balance: number
          risk_level: string
          server_time: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          discrepancy?: number
          escrow_balance?: number
          id?: string
          operator_id?: string | null
          orchestrator_balance?: number
          risk_level?: string
          server_time?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          discrepancy?: number
          escrow_balance?: number
          id?: string
          operator_id?: string | null
          orchestrator_balance?: number
          risk_level?: string
          server_time?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orchestrator_balances_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_limit_usage_history: {
        Row: {
          created_at: string
          id: string
          operator_id: string | null
          percentage_used: number
          server_time: string | null
          total_limit: number
          used_amount: number
        }
        Insert: {
          created_at?: string
          id?: string
          operator_id?: string | null
          percentage_used: number
          server_time?: string | null
          total_limit: number
          used_amount: number
        }
        Update: {
          created_at?: string
          id?: string
          operator_id?: string | null
          percentage_used?: number
          server_time?: string | null
          total_limit?: number
          used_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_limit_usage_history_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          amount_in: number
          amount_out: number
          created_at: string
          eip712_hash: string | null
          expires_at: string
          id: string
          operator_id: string | null
          pair_id: string
          price: number
          quote_id: string
          server_time: string | null
          status: string
          token_in: string
          token_out: string
          updated_at: string
        }
        Insert: {
          amount_in?: number
          amount_out?: number
          created_at?: string
          eip712_hash?: string | null
          expires_at: string
          id?: string
          operator_id?: string | null
          pair_id: string
          price?: number
          quote_id: string
          server_time?: string | null
          status?: string
          token_in: string
          token_out: string
          updated_at?: string
        }
        Update: {
          amount_in?: number
          amount_out?: number
          created_at?: string
          eip712_hash?: string | null
          expires_at?: string
          id?: string
          operator_id?: string | null
          pair_id?: string
          price?: number
          quote_id?: string
          server_time?: string | null
          status?: string
          token_in?: string
          token_out?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      tokens: {
        Row: {
          address: string
          created_at: string
          decimals: number
          id: string
          is_active: boolean
          name: string
          server_time: string | null
          symbol: string
          token_id: string
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          name: string
          server_time?: string | null
          symbol: string
          token_id: string
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          decimals?: number
          id?: string
          is_active?: boolean
          name?: string
          server_time?: string | null
          symbol?: string
          token_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      trades: {
        Row: {
          amount_in: number
          amount_out: number
          batch_id: string | null
          created_at: string
          executed_at: string | null
          id: string
          operator_id: string | null
          pair_id: string | null
          quote_id: string | null
          server_time: string | null
          status: string
          token_in: string
          token_out: string
          trade_id: string
          updated_at: string
        }
        Insert: {
          amount_in?: number
          amount_out?: number
          batch_id?: string | null
          created_at?: string
          executed_at?: string | null
          id?: string
          operator_id?: string | null
          pair_id?: string | null
          quote_id?: string | null
          server_time?: string | null
          status?: string
          token_in: string
          token_out: string
          trade_id: string
          updated_at?: string
        }
        Update: {
          amount_in?: number
          amount_out?: number
          batch_id?: string | null
          created_at?: string
          executed_at?: string | null
          id?: string
          operator_id?: string | null
          pair_id?: string | null
          quote_id?: string | null
          server_time?: string | null
          status?: string
          token_in?: string
          token_out?: string
          trade_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trades_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "trading_batches"
            referencedColumns: ["batch_id"]
          },
          {
            foreignKeyName: "trades_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_batches: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          max_trades: number
          operator_id: string | null
          server_time: string | null
          status: string
          trade_count: number
          updated_at: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          max_trades?: number
          operator_id?: string | null
          server_time?: string | null
          status?: string
          trade_count?: number
          updated_at?: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          max_trades?: number
          operator_id?: string | null
          server_time?: string | null
          status?: string
          trade_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_batches_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
      trading_pairs: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          pair_id: string
          server_time: string | null
          token_in: string
          token_out: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          pair_id: string
          server_time?: string | null
          token_in: string
          token_out: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          pair_id?: string
          server_time?: string | null
          token_in?: string
          token_out?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vault_outstanding_rebalances: {
        Row: {
          created_at: string
          id: string
          outstanding_quantity: number
          outstanding_usd_value: number
          server_time: string | null
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at: string
          vault_address: string
          vault_id: string | null
          vault_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          outstanding_quantity?: number
          outstanding_usd_value?: number
          server_time?: string | null
          token_type: Database["public"]["Enums"]["token_type"]
          updated_at?: string
          vault_address: string
          vault_id?: string | null
          vault_name: string
        }
        Update: {
          created_at?: string
          id?: string
          outstanding_quantity?: number
          outstanding_usd_value?: number
          server_time?: string | null
          token_type?: Database["public"]["Enums"]["token_type"]
          updated_at?: string
          vault_address?: string
          vault_id?: string | null
          vault_name?: string
        }
        Relationships: []
      }
      vault_rebalances: {
        Row: {
          created_at: string | null
          expiry_time: string
          id: string
          is_overdue: boolean | null
          operator_compliance: boolean | null
          rebalance_id: string | null
          server_time: string | null
          status: string | null
          timeout_at: string | null
          vault_address: string
          vault_id: string | null
          vault_name: string
        }
        Insert: {
          created_at?: string | null
          expiry_time: string
          id?: string
          is_overdue?: boolean | null
          operator_compliance?: boolean | null
          rebalance_id?: string | null
          server_time?: string | null
          status?: string | null
          timeout_at?: string | null
          vault_address: string
          vault_id?: string | null
          vault_name: string
        }
        Update: {
          created_at?: string | null
          expiry_time?: string
          id?: string
          is_overdue?: boolean | null
          operator_compliance?: boolean | null
          rebalance_id?: string | null
          server_time?: string | null
          status?: string | null
          timeout_at?: string | null
          vault_address?: string
          vault_id?: string | null
          vault_name?: string
        }
        Relationships: []
      }
      vault_risk_data: {
        Row: {
          amount_at_risk_usd: number
          created_at: string
          current_value: number
          id: string
          risk_ratio: number
          server_time: string | null
          updated_at: string
          value_slashing: number
          vault_address: string
          vault_id: string | null
          vault_name: string
        }
        Insert: {
          amount_at_risk_usd?: number
          created_at?: string
          current_value?: number
          id?: string
          risk_ratio?: number
          server_time?: string | null
          updated_at?: string
          value_slashing?: number
          vault_address: string
          vault_id?: string | null
          vault_name: string
        }
        Update: {
          amount_at_risk_usd?: number
          created_at?: string
          current_value?: number
          id?: string
          risk_ratio?: number
          server_time?: string | null
          updated_at?: string
          value_slashing?: number
          vault_address?: string
          vault_id?: string | null
          vault_name?: string
        }
        Relationships: []
      }
      yodl_price_data: {
        Row: {
          change_24h: number
          created_at: string
          id: string
          market_cap: number
          price_usd: number
          server_time: string | null
          volume_24h: number
        }
        Insert: {
          change_24h?: number
          created_at?: string
          id?: string
          market_cap?: number
          price_usd: number
          server_time?: string | null
          volume_24h?: number
        }
        Update: {
          change_24h?: number
          created_at?: string
          id?: string
          market_cap?: number
          price_usd?: number
          server_time?: string | null
          volume_24h?: number
        }
        Relationships: []
      }
      yodl_staked_balances: {
        Row: {
          balance: number
          created_at: string
          id: string
          operator_id: string | null
          server_time: string | null
          updated_at: string
          usd_value: number
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          operator_id?: string | null
          server_time?: string | null
          updated_at?: string
          usd_value?: number
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          operator_id?: string | null
          server_time?: string | null
          updated_at?: string
          usd_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "yodl_staked_balances_operator_id_fkey"
            columns: ["operator_id"]
            isOneToOne: false
            referencedRelation: "operators"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "operator" | "curator"
      curator_status: "active" | "inactive" | "suspended"
      operator_status:
        | "active"
        | "de_listed"
        | "pending_de_listing"
        | "blacklisted"
      token_type: "ETH" | "USDC" | "USDT" | "DAI" | "WBTC"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["operator", "curator"],
      curator_status: ["active", "inactive", "suspended"],
      operator_status: [
        "active",
        "de_listed",
        "pending_de_listing",
        "blacklisted",
      ],
      token_type: ["ETH", "USDC", "USDT", "DAI", "WBTC"],
    },
  },
} as const
