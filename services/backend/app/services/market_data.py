"""
Market Data Service
Provides real-time and historical market data from multiple sources.
Implements caching, failover, and rate limiting for enterprise reliability.
"""
import asyncio
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Dict, List, Optional, Any, Union
import aiohttp
import json
from dataclasses import dataclass
from enum import Enum

from app.core.config import settings

logger = logging.getLogger(__name__)


class DataProvider(str, Enum):
    """Available market data providers."""
    ALPHA_VANTAGE = "alpha_vantage"
    FINANCIAL_MODELING_PREP = "fmp"
    POLYGON = "polygon"
    TAAPI = "taapi"


@dataclass
class QuoteData:
    """Standardized quote data structure."""
    symbol: str
    price: Decimal
    previous_close: Decimal
    change: Decimal
    change_percent: Decimal
    volume: int
    high: Decimal
    low: Decimal
    open: Decimal
    timestamp: datetime
    source: str


class MarketDataError(Exception):
    """Custom exception for market data errors."""
    pass


class MarketDataService:
    """
    Market data service with multi-provider support and enterprise features.
    
    Features:
    - Multiple data provider integration
    - Automatic failover between providers
    - Intelligent caching with TTL
    - Rate limiting compliance
    - Data normalization and validation
    """
    
    def __init__(self):
        self.session: Optional[aiohttp.ClientSession] = None
        self.cache: Dict[str, Dict] = {}  # Simple in-memory cache
        self.cache_ttl = 60  # Cache TTL in seconds
        self.rate_limits = {
            DataProvider.ALPHA_VANTAGE: {'calls': 5, 'per_minute': True, 'last_calls': []},
            DataProvider.FINANCIAL_MODELING_PREP: {'calls': 250, 'per_day': True, 'last_calls': []},
            DataProvider.POLYGON: {'calls': 5, 'per_minute': True, 'last_calls': []},
        }
        
    async def __aenter__(self):
        """Async context manager entry."""
        self.session = aiohttp.ClientSession(
            timeout=aiohttp.ClientTimeout(total=30),
            headers={'User-Agent': 'StockPulse/1.0'}
        )
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        if self.session:
            await self.session.close()
    
    def _is_cache_valid(self, symbol: str) -> bool:
        """Check if cached data is still valid."""
        if symbol not in self.cache:
            return False
        
        cache_time = self.cache[symbol].get('timestamp')
        if not cache_time:
            return False
            
        return (datetime.utcnow() - cache_time).total_seconds() < self.cache_ttl
    
    def _can_make_request(self, provider: DataProvider) -> bool:
        """Check if we can make a request to the provider based on rate limits."""
        limits = self.rate_limits.get(provider)
        if not limits:
            return True
            
        now = datetime.utcnow()
        last_calls = limits['last_calls']
        
        if limits.get('per_minute'):
            # Remove calls older than 1 minute
            cutoff = now - timedelta(minutes=1)
            limits['last_calls'] = [call for call in last_calls if call > cutoff]
            return len(limits['last_calls']) < limits['calls']
        elif limits.get('per_day'):
            # Remove calls older than 1 day
            cutoff = now - timedelta(days=1)
            limits['last_calls'] = [call for call in last_calls if call > cutoff]
            return len(limits['last_calls']) < limits['calls']
        
        return True
    
    def _record_request(self, provider: DataProvider):
        """Record a request for rate limiting."""
        if provider in self.rate_limits:
            self.rate_limits[provider]['last_calls'].append(datetime.utcnow())
    
    async def get_quote(self, symbol: str) -> Optional[QuoteData]:
        """
        Get real-time quote for a single symbol.
        
        Args:
            symbol: Stock symbol (e.g., 'AAPL', 'MSFT')
            
        Returns:
            QuoteData object or None if not found
        """
        symbol = symbol.upper().strip()
        
        # Check cache first
        if self._is_cache_valid(symbol):
            cached_data = self.cache[symbol]['data']
            return QuoteData(**cached_data)
        
        # Try providers in order of preference
        providers = [
            DataProvider.ALPHA_VANTAGE,
            DataProvider.FINANCIAL_MODELING_PREP,
            DataProvider.POLYGON
        ]
        
        for provider in providers:
            if not self._can_make_request(provider):
                logger.warning(f"Rate limit reached for {provider}, trying next provider")
                continue
                
            try:
                quote_data = await self._fetch_quote_from_provider(symbol, provider)
                if quote_data:
                    # Cache the result
                    self.cache[symbol] = {
                        'data': quote_data.__dict__,
                        'timestamp': datetime.utcnow()
                    }
                    self._record_request(provider)
                    return quote_data
                    
            except Exception as e:
                logger.error(f"Error fetching quote from {provider}: {e}")
                continue
        
        logger.error(f"Failed to fetch quote for {symbol} from all providers")
        return None
    
    async def get_bulk_quotes(self, symbols: List[str]) -> Dict[str, Dict[str, Any]]:
        """
        Get quotes for multiple symbols efficiently.
        
        Args:
            symbols: List of stock symbols
            
        Returns:
            Dictionary mapping symbol to quote data
        """
        if not symbols:
            return {}
        
        # Process symbols in batches to respect rate limits
        batch_size = 5  # Conservative batch size
        results = {}
        
        for i in range(0, len(symbols), batch_size):
            batch = symbols[i:i + batch_size]
            batch_tasks = [self.get_quote(symbol) for symbol in batch]
            
            try:
                batch_results = await asyncio.gather(*batch_tasks, return_exceptions=True)
                
                for symbol, result in zip(batch, batch_results):
                    if isinstance(result, QuoteData):
                        results[symbol] = {
                            'price': result.price,
                            'previous_close': result.previous_close,
                            'change': result.change,
                            'change_percent': result.change_percent,
                            'volume': result.volume,
                            'timestamp': result.timestamp
                        }
                    elif isinstance(result, Exception):
                        logger.error(f"Error fetching {symbol}: {result}")
                        
            except Exception as e:
                logger.error(f"Error in batch quote fetch: {e}")
            
            # Small delay between batches to be respectful to APIs
            if i + batch_size < len(symbols):
                await asyncio.sleep(0.5)
        
        return results
    
    async def _fetch_quote_from_provider(self, symbol: str, provider: DataProvider) -> Optional[QuoteData]:
        """Fetch quote from specific provider."""
        if not self.session:
            raise MarketDataError("HTTP session not initialized")
        
        if provider == DataProvider.ALPHA_VANTAGE:
            return await self._fetch_alpha_vantage(symbol)
        elif provider == DataProvider.FINANCIAL_MODELING_PREP:
            return await self._fetch_fmp(symbol)
        elif provider == DataProvider.POLYGON:
            return await self._fetch_polygon(symbol)
        else:
            raise MarketDataError(f"Unsupported provider: {provider}")
    
    async def _fetch_alpha_vantage(self, symbol: str) -> Optional[QuoteData]:
        """Fetch quote from Alpha Vantage API."""
        if not settings.ALPHA_VANTAGE_API_KEY:
            return None
            
        url = "https://www.alphavantage.co/query"
        params = {
            'function': 'GLOBAL_QUOTE',
            'symbol': symbol,
            'apikey': settings.ALPHA_VANTAGE_API_KEY
        }
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                quote = data.get('Global Quote', {})
                
                if not quote:
                    return None
                
                return QuoteData(
                    symbol=symbol,
                    price=Decimal(quote.get('05. price', '0')),
                    previous_close=Decimal(quote.get('08. previous close', '0')),
                    change=Decimal(quote.get('09. change', '0')),
                    change_percent=Decimal(quote.get('10. change percent', '0%').rstrip('%')),
                    volume=int(quote.get('06. volume', '0')),
                    high=Decimal(quote.get('03. high', '0')),
                    low=Decimal(quote.get('04. low', '0')),
                    open=Decimal(quote.get('02. open', '0')),
                    timestamp=datetime.utcnow(),
                    source=DataProvider.ALPHA_VANTAGE
                )
                
        except Exception as e:
            logger.error(f"Alpha Vantage API error: {e}")
            return None
    
    async def _fetch_fmp(self, symbol: str) -> Optional[QuoteData]:
        """Fetch quote from Financial Modeling Prep API."""
        if not settings.FMP_API_KEY:
            return None
            
        url = f"https://financialmodelingprep.com/api/v3/quote/{symbol}"
        params = {'apikey': settings.FMP_API_KEY}
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                if not data or len(data) == 0:
                    return None
                
                quote = data[0]
                
                return QuoteData(
                    symbol=symbol,
                    price=Decimal(str(quote.get('price', 0))),
                    previous_close=Decimal(str(quote.get('previousClose', 0))),
                    change=Decimal(str(quote.get('change', 0))),
                    change_percent=Decimal(str(quote.get('changesPercentage', 0))),
                    volume=int(quote.get('volume', 0)),
                    high=Decimal(str(quote.get('dayHigh', 0))),
                    low=Decimal(str(quote.get('dayLow', 0))),
                    open=Decimal(str(quote.get('open', 0))),
                    timestamp=datetime.utcnow(),
                    source=DataProvider.FINANCIAL_MODELING_PREP
                )
                
        except Exception as e:
            logger.error(f"FMP API error: {e}")
            return None
    
    async def _fetch_polygon(self, symbol: str) -> Optional[QuoteData]:
        """Fetch quote from Polygon.io API."""
        if not settings.POLYGON_API_KEY:
            return None
            
        url = f"https://api.polygon.io/v2/last/trade/{symbol}"
        params = {'apikey': settings.POLYGON_API_KEY}
        
        try:
            async with self.session.get(url, params=params) as response:
                if response.status != 200:
                    return None
                    
                data = await response.json()
                results = data.get('results', {})
                
                if not results:
                    return None
                
                # For Polygon, we need to make an additional call for previous close
                # For now, we'll use the current price as previous close (simplified)
                price = Decimal(str(results.get('p', 0)))
                
                return QuoteData(
                    symbol=symbol,
                    price=price,
                    previous_close=price,  # Simplified - should fetch from daily bars
                    change=Decimal('0'),
                    change_percent=Decimal('0'),
                    volume=int(results.get('s', 0)),
                    high=price,
                    low=price,
                    open=price,
                    timestamp=datetime.utcnow(),
                    source=DataProvider.POLYGON
                )
                
        except Exception as e:
            logger.error(f"Polygon API error: {e}")
            return None
    
    async def get_market_status(self) -> Dict[str, Any]:
        """Get current market status."""
        # Simplified market status - in real implementation would check market hours
        now = datetime.utcnow()
        
        # NYSE market hours: 9:30 AM - 4:00 PM ET (14:30 - 21:00 UTC)
        market_open_utc = now.replace(hour=14, minute=30, second=0, microsecond=0)
        market_close_utc = now.replace(hour=21, minute=0, second=0, microsecond=0)
        
        is_open = market_open_utc <= now <= market_close_utc and now.weekday() < 5
        
        return {
            'is_open': is_open,
            'next_open': market_open_utc if not is_open else None,
            'next_close': market_close_utc if is_open else None,
            'timezone': 'UTC'
        } 