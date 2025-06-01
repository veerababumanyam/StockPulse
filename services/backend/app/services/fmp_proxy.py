"""
Financial Modeling Prep (FMP) Proxy Service
Secure proxy for FMP API calls using stored encrypted API keys
Follows enterprise security standards and rate limiting
"""
import asyncio
import logging
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Union
from uuid import UUID

import aiohttp
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from ..core.events import EventBus
from ..models.api_keys import APIKeyUsage
from ..services.api_keys import APIKeyService

logger = logging.getLogger(__name__)


class FMPProxyService:
    """
    Financial Modeling Prep API Proxy Service
    Handles secure API calls using stored encrypted keys
    """

    BASE_URL = "https://financialmodelingprep.com/api/v3"

    def __init__(self, api_key_service: APIKeyService):
        self.api_key_service = api_key_service
        self.session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create HTTP session"""
        if self.session is None or self.session.closed:
            timeout = aiohttp.ClientTimeout(total=30, connect=10)
            self.session = aiohttp.ClientSession(timeout=timeout)
        return self.session

    async def close(self):
        """Close HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()

    async def _get_api_key(self, db: AsyncSession, user_id: UUID) -> str:
        """Get decrypted FMP API key for user"""
        api_key = await self.api_key_service.get_api_key_for_provider(
            db=db, user_id=user_id, provider_id="fmp"
        )
        if not api_key:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No Financial Modeling Prep API key found. Please add your FMP API key in settings.",
            )
        return api_key

    async def _make_request(
        self,
        db: AsyncSession,
        user_id: UUID,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """Make authenticated request to FMP API"""
        api_key = await self._get_api_key(db, user_id)
        session = await self._get_session()

        # Add API key to parameters
        request_params = params.copy() if params else {}
        request_params["apikey"] = api_key

        url = f"{self.BASE_URL}/{endpoint}"
        start_time = datetime.utcnow()

        try:
            async with session.get(url, params=request_params) as response:
                response_time_ms = int(
                    (datetime.utcnow() - start_time).total_seconds() * 1000
                )

                if response.status == 200:
                    data = await response.json()

                    # Log successful usage
                    await self._log_usage(
                        db=db,
                        user_id=user_id,
                        endpoint=endpoint,
                        status_code=response.status,
                        response_time_ms=response_time_ms,
                    )

                    return data
                else:
                    error_text = await response.text()
                    logger.error(f"FMP API error {response.status}: {error_text}")

                    # Log failed usage
                    await self._log_usage(
                        db=db,
                        user_id=user_id,
                        endpoint=endpoint,
                        status_code=response.status,
                        response_time_ms=response_time_ms,
                        error_message=error_text[:500],
                    )

                    raise HTTPException(
                        status_code=status.HTTP_502_BAD_GATEWAY,
                        detail=f"FMP API error: {error_text[:200]}",
                    )

        except aiohttp.ClientError as e:
            logger.error(f"FMP API request failed: {e}")
            await self._log_usage(
                db=db,
                user_id=user_id,
                endpoint=endpoint,
                status_code=0,
                response_time_ms=int(
                    (datetime.utcnow() - start_time).total_seconds() * 1000
                ),
                error_message=str(e)[:500],
            )
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to connect to Financial Modeling Prep API",
            )

    async def _log_usage(
        self,
        db: AsyncSession,
        user_id: UUID,
        endpoint: str,
        status_code: int,
        response_time_ms: int,
        error_message: Optional[str] = None,
    ):
        """Log API usage for monitoring and billing"""
        try:
            # This would typically be implemented in the APIKeyService
            # For now, we'll just log it
            logger.info(
                f"FMP API usage - User: {user_id}, Endpoint: {endpoint}, "
                f"Status: {status_code}, Time: {response_time_ms}ms"
            )
        except Exception as e:
            logger.error(f"Failed to log API usage: {e}")

    # Portfolio Data Methods
    async def get_portfolio_overview(
        self, db: AsyncSession, user_id: UUID
    ) -> Dict[str, Any]:
        """Get portfolio overview data"""
        # For demo purposes, we'll fetch some market data
        # In a real implementation, this would combine user portfolio data with market prices
        try:
            # Get major indices for portfolio context
            indices = await self._make_request(db, user_id, "quote/^GSPC,^DJI,^IXIC")

            # Mock portfolio data (in real app, this would come from user's portfolio)
            portfolio_data = {
                "total_value": 125750.50,
                "daily_change": 2847.25,
                "daily_change_percent": 2.31,
                "total_gain_loss": 15750.50,
                "total_gain_loss_percent": 14.32,
                "cash_balance": 5250.00,
                "invested_amount": 120500.50,
                "market_indices": indices if isinstance(indices, list) else [],
            }

            return portfolio_data

        except Exception as e:
            logger.error(f"Failed to get portfolio overview: {e}")
            raise

    async def get_portfolio_chart_data(
        self, db: AsyncSession, user_id: UUID, timeframe: str = "1M"
    ) -> Dict[str, Any]:
        """Get portfolio performance chart data"""
        try:
            # For demo, we'll use SPY as a proxy for portfolio performance
            # In real implementation, this would be calculated from user's actual portfolio

            # Map timeframe to FMP parameters
            timeframe_map = {
                "1D": ("1min", 1),
                "1W": ("5min", 7),
                "1M": ("1hour", 30),
                "3M": ("1day", 90),
                "1Y": ("1day", 365),
                "5Y": ("1week", 1825),
            }

            interval, days = timeframe_map.get(timeframe, ("1day", 30))

            # Get historical data for SPY as portfolio proxy
            historical_data = await self._make_request(
                db,
                user_id,
                f"historical-chart/{interval}/SPY",
                {"from": (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")},
            )

            if not historical_data:
                return {"datapoints": [], "timeframe": timeframe}

            # Transform to portfolio chart format
            datapoints = []
            base_value = 100000  # Starting portfolio value

            for i, point in enumerate(historical_data[-100:]):  # Last 100 points
                # Simulate portfolio growth based on SPY performance
                if i == 0:
                    portfolio_value = base_value
                else:
                    prev_price = historical_data[-100:][i - 1]["close"]
                    current_price = point["close"]
                    change_percent = (current_price - prev_price) / prev_price
                    portfolio_value = datapoints[-1]["value"] * (1 + change_percent)

                datapoints.append(
                    {"timestamp": point["date"], "value": round(portfolio_value, 2)}
                )

            return {"datapoints": datapoints, "timeframe": timeframe}

        except Exception as e:
            logger.error(f"Failed to get portfolio chart data: {e}")
            raise

    # Market Data Methods
    async def get_watchlist_data(
        self, db: AsyncSession, user_id: UUID, symbols: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Get watchlist data for specified symbols"""
        try:
            # Default watchlist if none provided
            if not symbols:
                symbols = [
                    "AAPL",
                    "GOOGL",
                    "MSFT",
                    "AMZN",
                    "TSLA",
                    "NVDA",
                    "META",
                    "NFLX",
                ]

            # Get quotes for all symbols
            symbol_string = ",".join(symbols)
            quotes = await self._make_request(db, user_id, f"quote/{symbol_string}")

            if not quotes:
                return {"items": []}

            # Transform to watchlist format
            watchlist_items = []
            for quote in quotes:
                watchlist_items.append(
                    {
                        "symbol": quote.get("symbol", ""),
                        "name": quote.get("name", ""),
                        "price": quote.get("price", 0),
                        "change": quote.get("change", 0),
                        "change_percent": quote.get("changesPercentage", 0),
                        "volume": quote.get("volume", 0),
                        "market_cap": quote.get("marketCap", 0),
                    }
                )

            return {"items": watchlist_items}

        except Exception as e:
            logger.error(f"Failed to get watchlist data: {e}")
            raise

    async def get_market_summary(
        self, db: AsyncSession, user_id: UUID
    ) -> Dict[str, Any]:
        """Get market summary data"""
        try:
            # Get major market indices
            indices_data = await self._make_request(
                db, user_id, "quote/^GSPC,^DJI,^IXIC,^RUT,^VIX"
            )

            if not indices_data:
                return {"indices": []}

            # Transform to market summary format
            indices = []
            for index in indices_data:
                indices.append(
                    {
                        "symbol": index.get("symbol", ""),
                        "name": index.get("name", ""),
                        "value": index.get("price", 0),
                        "change": index.get("change", 0),
                        "change_percent": index.get("changesPercentage", 0),
                    }
                )

            return {"indices": indices}

        except Exception as e:
            logger.error(f"Failed to get market summary: {e}")
            raise

    async def get_sector_performance(
        self, db: AsyncSession, user_id: UUID, timeframe: str = "1D"
    ) -> Dict[str, Any]:
        """Get sector performance data"""
        try:
            # Get sector performance data
            sectors_data = await self._make_request(db, user_id, "sectors-performance")

            if not sectors_data:
                return {"sectors": []}

            # Transform to sector performance format
            sectors = []
            for sector in sectors_data:
                sectors.append(
                    {
                        "sector": sector.get("sector", ""),
                        "change_percent": float(
                            sector.get("changesPercentage", "0").replace("%", "")
                        ),
                        "market_cap": 0,  # FMP doesn't provide this in sector performance
                    }
                )

            return {"sectors": sectors, "timeframe": timeframe}

        except Exception as e:
            logger.error(f"Failed to get sector performance: {e}")
            raise

    async def get_top_movers(
        self,
        db: AsyncSession,
        user_id: UUID,
        market: str = "nasdaq",
        type: str = "gainers",
    ) -> Dict[str, Any]:
        """Get top movers data"""
        try:
            # Map market and type to FMP endpoints
            endpoint_map = {
                ("nasdaq", "gainers"): "gainers",
                ("nasdaq", "losers"): "losers",
                ("nyse", "gainers"): "gainers",
                ("nyse", "losers"): "losers",
            }

            endpoint = endpoint_map.get((market, type), "gainers")
            movers_data = await self._make_request(db, user_id, endpoint)

            if not movers_data:
                return {"movers": [], "market": market, "type": type}

            # Transform to top movers format
            movers = []
            for mover in movers_data[:20]:  # Top 20
                movers.append(
                    {
                        "symbol": mover.get("symbol", ""),
                        "name": mover.get("name", ""),
                        "price": mover.get("price", 0),
                        "change": mover.get("change", 0),
                        "change_percent": mover.get("changesPercentage", 0),
                        "volume": mover.get("volume", 0),
                    }
                )

            return {"movers": movers, "market": market, "type": type}

        except Exception as e:
            logger.error(f"Failed to get top movers: {e}")
            raise

    async def get_news_feed(
        self, db: AsyncSession, user_id: UUID, limit: int = 20
    ) -> Dict[str, Any]:
        """Get financial news feed"""
        try:
            # Get general market news
            news_data = await self._make_request(
                db, user_id, "fmp/articles", {"page": 0, "size": limit}
            )

            if not news_data:
                return {"articles": []}

            # Transform to news feed format
            articles = []
            for article in news_data.get("content", []):
                articles.append(
                    {
                        "title": article.get("title", ""),
                        "summary": article.get("text", "")[:200] + "..."
                        if len(article.get("text", "")) > 200
                        else article.get("text", ""),
                        "url": article.get("url", ""),
                        "published_at": article.get("publishedDate", ""),
                        "source": article.get("site", "FMP"),
                        "image_url": article.get("image", ""),
                    }
                )

            return {"articles": articles}

        except Exception as e:
            logger.error(f"Failed to get news feed: {e}")
            # Return empty result instead of raising to prevent widget failure
            return {"articles": []}

    async def get_economic_calendar(
        self, db: AsyncSession, user_id: UUID, date: Optional[str] = None
    ) -> Dict[str, Any]:
        """Get economic calendar events"""
        try:
            # Use current date if none provided
            if not date:
                date = datetime.now().strftime("%Y-%m-%d")

            # Get economic calendar data
            calendar_data = await self._make_request(
                db, user_id, "economic_calendar", {"from": date, "to": date}
            )

            if not calendar_data:
                return {"events": [], "date": date}

            # Transform to economic calendar format
            events = []
            for event in calendar_data:
                # Map FMP impact to our format
                impact_map = {"Low": "low", "Medium": "medium", "High": "high"}
                impact = impact_map.get(event.get("impact", ""), "medium")

                events.append(
                    {
                        "time": event.get("date", ""),
                        "event": event.get("event", ""),
                        "country": event.get("country", ""),
                        "impact": impact,
                        "forecast": event.get("estimate", ""),
                        "previous": event.get("previous", ""),
                        "actual": event.get("actual", ""),
                    }
                )

            return {"events": events, "date": date}

        except Exception as e:
            logger.error(f"Failed to get economic calendar: {e}")
            # Return empty result instead of raising to prevent widget failure
            return {"events": [], "date": date}
