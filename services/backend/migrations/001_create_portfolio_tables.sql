-- Migration 001: Create Portfolio and API Key Tables
-- Story 2.1: Basic Dashboard Layout and Portfolio Snapshot
-- Creates necessary tables for portfolio management and API key storage

-- Portfolio table
CREATE TABLE IF NOT EXISTS portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cash_balance DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    total_invested DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    total_value DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    total_pnl DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    total_pnl_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    day_pnl DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    day_pnl_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Constraints
    CONSTRAINT unique_portfolio_name_per_user UNIQUE (user_id, name, is_active),
    CONSTRAINT positive_cash_balance CHECK (cash_balance >= 0),
    CONSTRAINT positive_total_invested CHECK (total_invested >= 0),
    CONSTRAINT positive_total_value CHECK (total_value >= 0)
);

-- Portfolio positions table
CREATE TABLE IF NOT EXISTS portfolio_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(20, 8) NOT NULL,
    average_cost DECIMAL(20, 2) NOT NULL,
    current_price DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    market_value DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    total_cost DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    unrealized_pnl DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    unrealized_pnl_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    day_pnl DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    day_pnl_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    weight_percentage DECIMAL(10, 4) NOT NULL DEFAULT 0.0000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT unique_symbol_per_portfolio UNIQUE (portfolio_id, symbol),
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_average_cost CHECK (average_cost > 0),
    CONSTRAINT positive_current_price CHECK (current_price >= 0),
    CONSTRAINT valid_weight_percentage CHECK (weight_percentage >= 0 AND weight_percentage <= 100)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('BUY', 'SELL', 'DIVIDEND', 'SPLIT', 'TRANSFER')),
    quantity DECIMAL(20, 8) NOT NULL,
    price DECIMAL(20, 2) NOT NULL,
    total_amount DECIMAL(20, 2) NOT NULL,
    fees DECIMAL(20, 2) NOT NULL DEFAULT 0.00,
    transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    
    -- Constraints
    CONSTRAINT positive_quantity CHECK (quantity > 0),
    CONSTRAINT positive_price CHECK (price > 0),
    CONSTRAINT positive_total_amount CHECK (total_amount > 0),
    CONSTRAINT positive_fees CHECK (fees >= 0)
);

-- AI Portfolio Insights table
CREATE TABLE IF NOT EXISTS ai_portfolio_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    insight_type VARCHAR(50) NOT NULL CHECK (insight_type IN ('ANALYSIS', 'RECOMMENDATION', 'ALERT', 'SUMMARY')),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    confidence_score DECIMAL(3, 2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_required BOOLEAN NOT NULL DEFAULT false,
    metadata JSONB
);

-- Portfolio Snapshots table (for historical tracking)
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    snapshot_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    cash_balance DECIMAL(20, 2) NOT NULL,
    total_invested DECIMAL(20, 2) NOT NULL,
    total_pnl DECIMAL(20, 2) NOT NULL,
    total_pnl_percentage DECIMAL(10, 4) NOT NULL,
    positions_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB,
    
    -- Constraints
    CONSTRAINT unique_portfolio_snapshot_date UNIQUE (portfolio_id, snapshot_date),
    CONSTRAINT positive_snapshot_values CHECK (
        total_value >= 0 AND 
        cash_balance >= 0 AND 
        total_invested >= 0 AND
        positions_count >= 0
    )
);

-- API Providers table
CREATE TABLE IF NOT EXISTS api_providers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    website_url VARCHAR(255),
    documentation_url VARCHAR(255),
    category VARCHAR(50) NOT NULL CHECK (category IN ('MARKET_DATA', 'AI_LLM', 'FINANCIAL', 'NEWS', 'OTHER')),
    auth_type VARCHAR(20) NOT NULL CHECK (auth_type IN ('API_KEY', 'OAUTH', 'BASIC', 'BEARER')),
    rate_limits JSONB,
    endpoints JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- API Keys table
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider_id VARCHAR(50) NOT NULL REFERENCES api_providers(id),
    name VARCHAR(100) NOT NULL,
    encrypted_key TEXT NOT NULL,
    key_hash VARCHAR(64) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_validated TIMESTAMP WITH TIME ZONE,
    validation_status VARCHAR(20) CHECK (validation_status IN ('VALID', 'INVALID', 'EXPIRED', 'UNKNOWN')),
    validation_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    
    -- Constraints
    CONSTRAINT unique_user_provider_name UNIQUE (user_id, provider_id, name),
    CONSTRAINT unique_key_hash UNIQUE (key_hash)
);

-- API Key Usage table (for tracking and rate limiting)
CREATE TABLE IF NOT EXISTS api_key_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 1,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
    response_time_ms INTEGER,
    error_details JSONB,
    
    -- Constraints
    CONSTRAINT unique_api_key_endpoint_date UNIQUE (api_key_id, endpoint, usage_date),
    CONSTRAINT positive_counts CHECK (
        request_count >= 0 AND 
        success_count >= 0 AND 
        error_count >= 0 AND
        success_count + error_count <= request_count
    )
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_active ON portfolios(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_portfolio_id ON portfolio_positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_positions_symbol ON portfolio_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_id ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_insights_portfolio_id ON ai_portfolio_insights(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_priority ON ai_portfolio_insights(priority);
CREATE INDEX IF NOT EXISTS idx_ai_insights_unread ON ai_portfolio_insights(is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio_date ON portfolio_snapshots(portfolio_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_provider ON api_keys(provider_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_api_key_usage_key_date ON api_key_usage(api_key_id, usage_date);

-- Insert default API providers
INSERT INTO api_providers (id, name, description, website_url, category, auth_type, is_active) VALUES
('fmp', 'Financial Modeling Prep', 'Real-time and historical financial data', 'https://financialmodelingprep.com/', 'MARKET_DATA', 'API_KEY', true),
('alpha_vantage', 'Alpha Vantage', 'Free APIs for real-time and historical data', 'https://www.alphavantage.co/', 'MARKET_DATA', 'API_KEY', true),
('polygon', 'Polygon.io', 'Real-time and historical market data', 'https://polygon.io/', 'MARKET_DATA', 'API_KEY', true),
('taapi', 'TAAPI.IO', 'Technical Analysis API', 'https://taapi.io/', 'MARKET_DATA', 'API_KEY', true),
('openai', 'OpenAI', 'GPT models for AI analysis', 'https://openai.com/', 'AI_LLM', 'API_KEY', true),
('anthropic', 'Anthropic', 'Claude AI models', 'https://anthropic.com/', 'AI_LLM', 'API_KEY', true),
('gemini', 'Google Gemini', 'Google AI models', 'https://ai.google.dev/', 'AI_LLM', 'API_KEY', true),
('openrouter', 'OpenRouter', 'Access to multiple AI models', 'https://openrouter.ai/', 'AI_LLM', 'API_KEY', true)
ON CONFLICT (id) DO NOTHING;

-- Add trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_positions_updated_at BEFORE UPDATE ON portfolio_positions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_providers_updated_at BEFORE UPDATE ON api_providers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE portfolios IS 'User investment portfolios with real-time value tracking';
COMMENT ON TABLE portfolio_positions IS 'Individual stock/asset positions within portfolios';
COMMENT ON TABLE transactions IS 'All buy/sell transactions for portfolio positions';
COMMENT ON TABLE ai_portfolio_insights IS 'AI-generated insights and recommendations';
COMMENT ON TABLE portfolio_snapshots IS 'Historical snapshots for performance tracking';
COMMENT ON TABLE api_providers IS 'Configuration for external API providers';
COMMENT ON TABLE api_keys IS 'Encrypted API keys for external services';
COMMENT ON TABLE api_key_usage IS 'Usage tracking for API rate limiting and monitoring'; 