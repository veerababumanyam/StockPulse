"""
WebSocket endpoints for real-time market data.
Implements secure WebSocket connections with JWT authentication.
"""
import asyncio
import json
import logging
from typing import Dict, Set, Optional
from uuid import UUID

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, status
from fastapi.exceptions import WebSocketException

from app.schemas.watchlist import MarketDataUpdateMessage, SubscriptionMessage, WebSocketMessage
from app.services.auth.jwt_service import jwt_service
from app.core.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections and subscriptions."""
    
    def __init__(self):
        # Map: user_id -> WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}
        # Map: symbol -> Set of user_ids subscribed to this symbol
        self.subscriptions: Dict[str, Set[str]] = {}
        # Map: user_id -> Set of symbols user is subscribed to
        self.user_subscriptions: Dict[str, Set[str]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Accept WebSocket connection and register user."""
        await websocket.accept()
        self.active_connections[user_id] = websocket
        self.user_subscriptions[user_id] = set()
        logger.info(f"WebSocket connected for user {user_id}")
    
    def disconnect(self, user_id: str):
        """Remove user connection and clean up subscriptions."""
        if user_id in self.active_connections:
            # Clean up all subscriptions for this user
            if user_id in self.user_subscriptions:
                for symbol in self.user_subscriptions[user_id].copy():
                    self.unsubscribe_user_from_symbol(user_id, symbol)
                del self.user_subscriptions[user_id]
            
            del self.active_connections[user_id]
            logger.info(f"WebSocket disconnected for user {user_id}")
    
    async def send_personal_message(self, message: dict, user_id: str):
        """Send message to specific user."""
        if user_id in self.active_connections:
            try:
                websocket = self.active_connections[user_id]
                await websocket.send_text(json.dumps(message))
            except Exception as e:
                logger.error(f"Error sending message to user {user_id}: {e}")
                self.disconnect(user_id)
    
    async def send_to_symbol_subscribers(self, symbol: str, message: dict):
        """Send message to all users subscribed to a symbol."""
        if symbol in self.subscriptions:
            for user_id in self.subscriptions[symbol].copy():
                await self.send_personal_message(message, user_id)
    
    def subscribe_user_to_symbol(self, user_id: str, symbol: str):
        """Subscribe user to symbol updates."""
        # Add to symbol subscribers
        if symbol not in self.subscriptions:
            self.subscriptions[symbol] = set()
        self.subscriptions[symbol].add(user_id)
        
        # Add to user's subscriptions
        if user_id not in self.user_subscriptions:
            self.user_subscriptions[user_id] = set()
        self.user_subscriptions[user_id].add(symbol)
        
        logger.info(f"User {user_id} subscribed to {symbol}")
    
    def unsubscribe_user_from_symbol(self, user_id: str, symbol: str):
        """Unsubscribe user from symbol updates."""
        # Remove from symbol subscribers
        if symbol in self.subscriptions:
            self.subscriptions[symbol].discard(user_id)
            if not self.subscriptions[symbol]:
                del self.subscriptions[symbol]
        
        # Remove from user's subscriptions
        if user_id in self.user_subscriptions:
            self.user_subscriptions[user_id].discard(symbol)
        
        logger.info(f"User {user_id} unsubscribed from {symbol}")


# Global connection manager
manager = ConnectionManager()


async def authenticate_websocket(websocket: WebSocket) -> Optional[str]:
    """
    Authenticate WebSocket connection using JWT from cookies.
    Returns user_id if authenticated, None otherwise.
    """
    try:
        # Get cookies from WebSocket connection
        cookie_header = websocket.headers.get("cookie", "")
        if not cookie_header:
            return None
        
        # Parse cookies manually
        cookies = {}
        for cookie in cookie_header.split(";"):
            if "=" in cookie:
                key, value = cookie.strip().split("=", 1)
                cookies[key] = value
        
        # Get access token from cookies
        access_token_cookie = cookies.get("access_token")
        if not access_token_cookie or not access_token_cookie.startswith("Bearer "):
            return None
        
        # Extract token
        token = access_token_cookie[7:]  # Remove "Bearer " prefix
        
        # Verify token
        payload = jwt_service.verify_token(token)
        if not payload or payload.get("type") != "access":
            return None
        
        # Extract user ID
        user_id = payload.get("sub")
        if not user_id:
            return None
        
        return user_id
        
    except Exception as e:
        logger.error(f"WebSocket authentication error: {e}")
        return None


@router.websocket("/ws/market-data")
async def websocket_market_data(websocket: WebSocket):
    """
    WebSocket endpoint for real-time market data subscriptions.
    Requires JWT authentication via cookies.
    """
    # Authenticate connection
    user_id = await authenticate_websocket(websocket)
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Authentication required")
        return
    
    # Connect user
    await manager.connect(websocket, user_id)
    
    try:
        # Send welcome message
        welcome_message = {
            "type": "connection",
            "status": "connected",
            "message": "WebSocket connected successfully",
            "timestamp": asyncio.get_event_loop().time()
        }
        await manager.send_personal_message(welcome_message, user_id)
        
        # Listen for messages
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                await handle_websocket_message(user_id, message)
                
            except json.JSONDecodeError:
                error_message = {
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(error_message, user_id)
            
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
    finally:
        manager.disconnect(user_id)


async def handle_websocket_message(user_id: str, message: dict):
    """Handle incoming WebSocket messages from client."""
    try:
        action = message.get("action")
        
        if action == "subscribe":
            symbol = message.get("symbol", "").upper()
            if symbol:
                manager.subscribe_user_to_symbol(user_id, symbol)
                
                # Send confirmation
                response = {
                    "type": "subscription",
                    "action": "subscribed",
                    "symbol": symbol,
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(response, user_id)
                
                # Send initial mock data for development
                await send_mock_market_data(symbol)
        
        elif action == "unsubscribe":
            symbol = message.get("symbol", "").upper()
            if symbol:
                manager.unsubscribe_user_from_symbol(user_id, symbol)
                
                # Send confirmation
                response = {
                    "type": "subscription",
                    "action": "unsubscribed", 
                    "symbol": symbol,
                    "timestamp": asyncio.get_event_loop().time()
                }
                await manager.send_personal_message(response, user_id)
        
        elif action == "heartbeat":
            # Respond to heartbeat
            response = {
                "type": "heartbeat",
                "action": "heartbeat_response",
                "timestamp": asyncio.get_event_loop().time()
            }
            await manager.send_personal_message(response, user_id)
        
        else:
            # Unknown action
            response = {
                "type": "error",
                "message": f"Unknown action: {action}",
                "timestamp": asyncio.get_event_loop().time()
            }
            await manager.send_personal_message(response, user_id)
            
    except Exception as e:
        logger.error(f"Error handling WebSocket message: {e}")
        error_response = {
            "type": "error",
            "message": "Internal server error",
            "timestamp": asyncio.get_event_loop().time()
        }
        await manager.send_personal_message(error_response, user_id)


async def send_mock_market_data(symbol: str):
    """Send mock market data for development/testing purposes."""
    try:
        import random
        from datetime import datetime
        
        # Generate mock market data
        base_price = 100 + random.random() * 200  # $100-$300
        change = (random.random() - 0.5) * 10  # -$5 to +$5
        change_percent = (change / base_price) * 100
        
        mock_data = {
            "type": "market_data",
            "symbol": symbol,
            "price": round(base_price + change, 2),
            "change": round(change, 2),
            "changePercent": round(change_percent, 4),
            "volume": random.randint(1000000, 10000000),
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        # Send to all subscribers of this symbol
        await manager.send_to_symbol_subscribers(symbol, mock_data)
        
    except Exception as e:
        logger.error(f"Error sending mock market data: {e}")


# Background task to simulate market data updates (for development)
async def market_data_simulator():
    """Background task that sends periodic market data updates."""
    while True:
        try:
            # Send updates for all subscribed symbols
            for symbol in list(manager.subscriptions.keys()):
                if manager.subscriptions[symbol]:  # Has subscribers
                    await send_mock_market_data(symbol)
            
            # Wait 3-5 seconds before next update
            import random
            await asyncio.sleep(random.uniform(3.0, 5.0))
            
        except Exception as e:
            logger.error(f"Market data simulator error: {e}")
            await asyncio.sleep(5)


# Start background task (will be managed by FastAPI lifespan)
_simulator_task: Optional[asyncio.Task] = None


async def start_market_data_simulator():
    """Start the market data simulator background task."""
    global _simulator_task
    if _simulator_task is None:
        _simulator_task = asyncio.create_task(market_data_simulator())
        logger.info("Market data simulator started")


async def stop_market_data_simulator():
    """Stop the market data simulator background task."""
    global _simulator_task
    if _simulator_task:
        _simulator_task.cancel()
        try:
            await _simulator_task
        except asyncio.CancelledError:
            pass
        _simulator_task = None
        logger.info("Market data simulator stopped")


# Export for app integration
__all__ = ["router", "start_market_data_simulator", "stop_market_data_simulator"] 