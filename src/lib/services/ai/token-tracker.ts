/**
 * AI Token Usage Tracking
 */

export interface AIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Utility class to track token usage across multiple requests
 */
export class TokenTracker {
  private usage: AIUsage = {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  };

  /**
   * Add usage from a request
   */
  addUsage(usage?: AIUsage): void {
    if (!usage) return;

    this.usage.prompt_tokens += usage.prompt_tokens;
    this.usage.completion_tokens += usage.completion_tokens;
    this.usage.total_tokens += usage.total_tokens;
  }

  /**
   * Get total accumulated usage
   */
  getTotalUsage(): AIUsage {
    return { ...this.usage };
  }

  /**
   * Reset usage counters
   */
  reset(): void {
    this.usage = {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };
  }
}

/**
 * Helper to combine two usage objects
 */
export function combineUsage(a?: AIUsage, b?: AIUsage): AIUsage {
  return {
    prompt_tokens: (a?.prompt_tokens || 0) + (b?.prompt_tokens || 0),
    completion_tokens:
      (a?.completion_tokens || 0) + (b?.completion_tokens || 0),
    total_tokens: (a?.total_tokens || 0) + (b?.total_tokens || 0),
  };
}
