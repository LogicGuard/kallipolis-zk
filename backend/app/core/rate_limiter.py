import time
import asyncio
from typing import Dict, Tuple

class TokenBucketRateLimiter:
    def __init__(self, capacity: int = 100, refill_rate: float = 10.0):
        self.capacity = capacity
        self.refill_rate = refill_rate  # tokens per second
        self.tokens: Dict[str, float] = {}
        self.last_update: Dict[str, float] = {}
        self._lock = asyncio.Lock()

    async def check_rate_limit(self, client_id: str) -> Tuple[bool, int]:
        async with self._lock:
            now = time.time()
            if client_id not in self.tokens:
                self.tokens[client_id] = float(self.capacity)
                self.last_update[client_id] = now

            elapsed = now - self.last_update[client_id]
            self.last_update[client_id] = now
            
            # Refill tokens
            self.tokens[client_id] = min(
                float(self.capacity),
                self.tokens[client_id] + elapsed * self.refill_rate
            )

            if self.tokens[client_id] >= 1.0:
                self.tokens[client_id] -= 1.0
                remaining = int(self.tokens[client_id])
                return True, remaining
            else:
                return False, 0

rate_limiter = TokenBucketRateLimiter()
