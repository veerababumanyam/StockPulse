-- TimescaleDB Initialization for StockPulse
-- This creates hypertables for time-series data

-- Create extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create schemas for organizing data
CREATE SCHEMA IF NOT EXISTS market_data;
CREATE SCHEMA IF NOT EXISTS trading;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Create market data tables
CREATE TABLE IF NOT EXISTS market_data.stock_prices (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    open DECIMAL(12,4),
    high DECIMAL(12,4),
    low DECIMAL(12,4),
    close DECIMAL(12,4),
    volume BIGINT,
    adjusted_close DECIMAL(12,4),
    source VARCHAR(50),
    PRIMARY KEY (time, symbol)
);

-- Create hypertable for stock prices
SELECT create_hypertable('market_data.stock_prices', 'time', 
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

-- Create options data table
CREATE TABLE IF NOT EXISTS market_data.options_data (
    time TIMESTAMPTZ NOT NULL,
    underlying_symbol VARCHAR(10) NOT NULL,
    option_symbol VARCHAR(50) NOT NULL,
    strike_price DECIMAL(12,4),
    expiration_date DATE,
    option_type VARCHAR(4), -- 'CALL' or 'PUT'
    bid DECIMAL(12,4),
    ask DECIMAL(12,4),
    last_price DECIMAL(12,4),
    volume INTEGER,
    open_interest INTEGER,
    implied_volatility DECIMAL(8,6),
    PRIMARY KEY (time, option_symbol)
);

-- Create hypertable for options data
SELECT create_hypertable('market_data.options_data', 'time',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

-- Create trading signals table
CREATE TABLE IF NOT EXISTS trading.signals (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    signal_type VARCHAR(20) NOT NULL, -- 'BUY', 'SELL', 'HOLD'
    confidence DECIMAL(5,4), -- 0.0 to 1.0
    price DECIMAL(12,4),
    indicator_values JSONB,
    strategy_name VARCHAR(50),
    PRIMARY KEY (time, symbol, signal_type)
);

-- Create hypertable for trading signals
SELECT create_hypertable('trading.signals', 'time',
    chunk_time_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Create portfolio performance table
CREATE TABLE IF NOT EXISTS analytics.portfolio_performance (
    time TIMESTAMPTZ NOT NULL,
    portfolio_id VARCHAR(50) NOT NULL,
    total_value DECIMAL(15,2),
    daily_return DECIMAL(8,6),
    cumulative_return DECIMAL(8,6),
    sharpe_ratio DECIMAL(8,6),
    volatility DECIMAL(8,6),
    max_drawdown DECIMAL(8,6),
    PRIMARY KEY (time, portfolio_id)
);

-- Create hypertable for portfolio performance
SELECT create_hypertable('analytics.portfolio_performance', 'time',
    chunk_time_interval => INTERVAL '1 day',
    if_not_exists => TRUE);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stock_prices_symbol_time 
    ON market_data.stock_prices (symbol, time DESC);

CREATE INDEX IF NOT EXISTS idx_options_underlying_time 
    ON market_data.options_data (underlying_symbol, time DESC);

CREATE INDEX IF NOT EXISTS idx_signals_symbol_strategy 
    ON trading.signals (symbol, strategy_name, time DESC);

-- Create continuous aggregates for common queries
CREATE MATERIALIZED VIEW IF NOT EXISTS market_data.daily_ohlcv
WITH (timescaledb.continuous) AS
SELECT 
    time_bucket('1 day', time) AS day,
    symbol,
    first(open, time) AS open,
    max(high) AS high,
    min(low) AS low,
    last(close, time) AS close,
    sum(volume) AS volume
FROM market_data.stock_prices
GROUP BY day, symbol;

-- Refresh policy for continuous aggregates
SELECT add_continuous_aggregate_policy('market_data.daily_ohlcv',
    start_offset => INTERVAL '7 days',
    end_offset => INTERVAL '1 hour',
    schedule_interval => INTERVAL '1 hour',
    if_not_exists => TRUE);

-- Create retention policy (keep raw data for 2 years)
SELECT add_retention_policy('market_data.stock_prices', INTERVAL '2 years', if_not_exists => TRUE);
SELECT add_retention_policy('market_data.options_data', INTERVAL '1 year', if_not_exists => TRUE);
SELECT add_retention_policy('trading.signals', INTERVAL '1 year', if_not_exists => TRUE); 