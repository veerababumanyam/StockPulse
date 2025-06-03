"""
Security utilities for A2A agents
"""

import time
from typing import Dict, Optional
from collections import defaultdict


class RateLimiter:
    """Simple in-memory rate limiter."""
    
    def __init__(self):
        self.requests = defaultdict(list)
    
    async def check_rate_limit(self, key: str, limit: int, window: int) -> bool:
        """Check if request is within rate limit."""
        now = time.time()
        window_start = now - window
        
        # Clean old requests
        self.requests[key] = [req_time for req_time in self.requests[key] if req_time > window_start]
        
        # Check limit
        if len(self.requests[key]) >= limit:
            return False
        
        # Add current request
        self.requests[key].append(now)
        return True


async def authenticate_request(request) -> Optional[str]:
    """Placeholder authentication function."""
    # TODO: Implement proper authentication
    return "default_user" 