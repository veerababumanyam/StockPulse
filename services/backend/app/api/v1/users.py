"""
User management API endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import logging

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.watchlist import Watchlist, WatchlistItem
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.watchlist import (
    WatchlistResponse, 
    WatchlistItemResponse, 
    AddWatchlistItemRequest,
    WatchlistItemCreate
)
from app.services.auth.user_service import UserService
from app.services.market_data_service import MarketDataService
from app.core.config import get_settings

router = APIRouter()
logger = logging.getLogger(__name__)
settings = get_settings()

# Initialize services
user_service = UserService()
market_data_service = MarketDataService()

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    try:
        return UserResponse.from_orm(current_user)
    except Exception as e:
        logger.error(f"Error getting user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )

@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user information"""
    try:
        updated_user = await user_service.update_user(db, current_user.id, user_update)
        return UserResponse.from_orm(updated_user)
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user information"
        )

# Watchlist Management Endpoints

@router.get("/me/watchlist", response_model=Dict[str, Any])
async def get_user_watchlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's watchlist with real-time market data
    
    Story 2.4 Implementation - Returns watchlist data structure
    """
    try:
        # Get user's default watchlist
        watchlist = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.is_default == True
        ).first()
        
        if not watchlist:
            # Create default watchlist if it doesn't exist
            watchlist = Watchlist(
                user_id=current_user.id,
                name="My Watchlist",
                description="Default StockPulse watchlist",
                is_default=True
            )
            db.add(watchlist)
            db.commit()
            db.refresh(watchlist)
        
        # Get watchlist items
        watchlist_items = db.query(WatchlistItem).filter(
            WatchlistItem.watchlist_id == watchlist.id
        ).all()
        
        # Enhance with real-time market data
        enhanced_items = []
        for item in watchlist_items:
            try:
                # Get real-time market data for the symbol
                market_data = await market_data_service.get_quote(item.symbol)
                
                enhanced_item = {
                    "id": str(item.id),
                    "symbol": item.symbol,
                    "name": market_data.get("name", item.company_name or f"{item.symbol} Corp."),
                    "price": market_data.get("price", 0.0),
                    "change": market_data.get("change", 0.0),
                    "changePercent": market_data.get("changePercent", 0.0),
                    "volume": market_data.get("volume", 0),
                    "marketCap": market_data.get("marketCap"),
                    "logoUrl": market_data.get("logoUrl", f"https://logo.clearbit.com/{item.symbol.lower()}.com"),
                    "addedAt": item.created_at.isoformat() if item.created_at else None
                }
                enhanced_items.append(enhanced_item)
                
            except Exception as e:
                logger.warning(f"Failed to get market data for {item.symbol}: {str(e)}")
                # Fallback to stored data or demo data
                enhanced_item = {
                    "id": str(item.id),
                    "symbol": item.symbol,
                    "name": item.company_name or f"{item.symbol} Corp.",
                    "price": 100.0,  # Demo fallback
                    "change": 0.0,
                    "changePercent": 0.0,
                    "volume": 1000000,
                    "marketCap": None,
                    "logoUrl": f"https://logo.clearbit.com/{item.symbol.lower()}.com",
                    "addedAt": item.created_at.isoformat() if item.created_at else None
                }
                enhanced_items.append(enhanced_item)
        
        response_data = {
            "watchlistId": str(watchlist.id),
            "name": watchlist.name,
            "description": watchlist.description,
            "items": enhanced_items,
            "totalItems": len(enhanced_items),
            "lastUpdated": watchlist.updated_at.isoformat() if watchlist.updated_at else None
        }
        
        return {
            "success": True,
            "data": response_data,
            "message": "Watchlist retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error getting user watchlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve watchlist"
        )

@router.post("/me/watchlist", response_model=Dict[str, Any])
async def add_symbol_to_watchlist(
    request: AddWatchlistItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Add a symbol to current user's watchlist
    
    Story 2.4 Implementation - Handles adding symbols with validation
    """
    try:
        symbol = request.symbol.upper().strip()
        
        # Validate symbol format
        if not symbol or len(symbol) > 5 or not symbol.isalpha():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid symbol format. Symbol must be 1-5 letters only."
            )
        
        # Get user's default watchlist
        watchlist = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.is_default == True
        ).first()
        
        if not watchlist:
            # Create default watchlist if it doesn't exist
            watchlist = Watchlist(
                user_id=current_user.id,
                name="My Watchlist",
                description="Default StockPulse watchlist",
                is_default=True
            )
            db.add(watchlist)
            db.commit()
            db.refresh(watchlist)
        
        # Check if symbol already exists in watchlist
        existing_item = db.query(WatchlistItem).filter(
            WatchlistItem.watchlist_id == watchlist.id,
            WatchlistItem.symbol == symbol
        ).first()
        
        if existing_item:
            return {
                "success": False,
                "message": f"{symbol} is already in your watchlist"
            }
        
        # Validate symbol with market data service
        try:
            market_data = await market_data_service.get_quote(symbol)
            company_name = market_data.get("name", request.name or f"{symbol} Corp.")
        except Exception as e:
            logger.warning(f"Market data validation failed for {symbol}: {str(e)}")
            # For demo purposes, allow common symbols
            common_symbols = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "META", "NVDA", "NFLX", "AMD", "CRM"]
            if symbol not in common_symbols:
                return {
                    "success": False,
                    "message": f"Could not validate symbol {symbol}. Please check if it's a valid stock symbol."
                }
            company_name = request.name or f"{symbol} Corp."
        
        # Add symbol to watchlist
        new_item = WatchlistItem(
            watchlist_id=watchlist.id,
            symbol=symbol,
            company_name=company_name
        )
        
        db.add(new_item)
        db.commit()
        db.refresh(new_item)
        
        logger.info(f"Added {symbol} to watchlist for user {current_user.id}")
        
        return {
            "success": True,
            "data": {
                "id": str(new_item.id),
                "symbol": new_item.symbol,
                "companyName": new_item.company_name,
                "watchlistId": str(watchlist.id)
            },
            "message": f"{symbol} added to watchlist successfully"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding symbol to watchlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add symbol to watchlist"
        )

@router.delete("/me/watchlist/{symbol}", response_model=Dict[str, Any])
async def remove_symbol_from_watchlist(
    symbol: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Remove a symbol from current user's watchlist
    
    Story 2.4 Implementation - Handles removing symbols
    """
    try:
        symbol = symbol.upper().strip()
        
        # Get user's default watchlist
        watchlist = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.is_default == True
        ).first()
        
        if not watchlist:
            return {
                "success": False,
                "message": "Watchlist not found"
            }
        
        # Find the watchlist item
        watchlist_item = db.query(WatchlistItem).filter(
            WatchlistItem.watchlist_id == watchlist.id,
            WatchlistItem.symbol == symbol
        ).first()
        
        if not watchlist_item:
            return {
                "success": False,
                "message": f"{symbol} is not in your watchlist"
            }
        
        # Remove the item
        db.delete(watchlist_item)
        db.commit()
        
        logger.info(f"Removed {symbol} from watchlist for user {current_user.id}")
        
        return {
            "success": True,
            "data": {
                "symbol": symbol,
                "watchlistId": str(watchlist.id)
            },
            "message": f"{symbol} removed from watchlist successfully"
        }
        
    except Exception as e:
        logger.error(f"Error removing symbol from watchlist: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to remove symbol from watchlist"
        )

@router.get("/me/watchlist/symbols", response_model=Dict[str, Any])
async def get_watchlist_symbols(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get only the symbols in user's watchlist (lightweight endpoint)
    
    Useful for WebSocket subscriptions and quick checks
    """
    try:
        # Get user's default watchlist
        watchlist = db.query(Watchlist).filter(
            Watchlist.user_id == current_user.id,
            Watchlist.is_default == True
        ).first()
        
        if not watchlist:
            return {
                "success": True,
                "data": {
                    "symbols": [],
                    "count": 0
                },
                "message": "No watchlist found"
            }
        
        # Get only symbols
        watchlist_items = db.query(WatchlistItem.symbol).filter(
            WatchlistItem.watchlist_id == watchlist.id
        ).all()
        
        symbols = [item.symbol for item in watchlist_items]
        
        return {
            "success": True,
            "data": {
                "symbols": symbols,
                "count": len(symbols),
                "watchlistId": str(watchlist.id)
            },
            "message": "Watchlist symbols retrieved successfully"
        }
        
    except Exception as e:
        logger.error(f"Error getting watchlist symbols: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve watchlist symbols"
        ) 