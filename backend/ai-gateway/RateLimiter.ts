export class RateLimiter {
    private limits: Map<string, { count: number; reset: number }> = new Map();
    private readonly MAX_REQUESTS = 100;
    private readonly WINDOW_MS = 60000; // 1 minute
    
    checkLimit(userId: string = "anonymous"): boolean {
        const now = Date.now();
        const limit = this.limits.get(userId) || { count: 0, reset: now + this.WINDOW_MS };
        
        // Reset window if passed
        if (now > limit.reset) {
            limit.count = 0;
            limit.reset = now + this.WINDOW_MS;
        }

        if (limit.count >= this.MAX_REQUESTS) {
            console.warn(`[RateLimiter] Rate limit exceeded for user: ${userId}`);
            return false;
        }
        
        limit.count++;
        this.limits.set(userId, limit);
        return true;
    }
}

export const globalRateLimiter = new RateLimiter();
