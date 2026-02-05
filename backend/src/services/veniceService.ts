// src/services/veniceService.ts
import OpenAI from "openai";

interface ChatMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

interface VeniceConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
}

interface RateLimitConfig {
    maxRequests: number;
    windowMs: number;
}

class VeniceService {
    private client: OpenAI;
    private defaultModel: string;
    private requestTimestamps: number[] = [];
    private rateLimitConfig: RateLimitConfig;

    constructor() {
        const apiKey = process.env.VENICE_API_KEY;
        
        if (!apiKey) {
            throw new Error("VENICE_API_KEY is not set in environment variables");
        }

        this.client = new OpenAI({
            apiKey: apiKey,
            baseURL: "https://api.venice.ai/api/v1"
        });
        this.defaultModel = process.env.VENICE_MODEL || "venice-uncensored";
        
        // Rate limit from environment variables
        this.rateLimitConfig = {
            maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "10", 10),
            windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "60000", 10)
        };
    }

    // Check if request is allowed under rate limit
    private checkRateLimit(): void {
        const now = Date.now();
        const windowStart = now - this.rateLimitConfig.windowMs;

        // Remove timestamps outside the current window
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => timestamp > windowStart
        );

        // Check if wexceeded the limit
        if (this.requestTimestamps.length >= this.rateLimitConfig.maxRequests) {
            const oldestRequest = this.requestTimestamps[0];
            const resetTime = oldestRequest + this.rateLimitConfig.windowMs;
            const waitMs = resetTime - now;
            const waitSeconds = Math.ceil(waitMs / 1000);

            const error = new Error(
                `Rate limit exceeded. Try again in ${waitSeconds} seconds. ` +
                `Limit: ${this.rateLimitConfig.maxRequests} requests per ` +
                `${this.rateLimitConfig.windowMs / 1000} seconds.`
            );
            error.name = "RateLimitError";
            throw error;
        }

        // Add current request timestamp
        this.requestTimestamps.push(now);
    }

    // Get current rate limit status
    getRateLimitStatus(): {
        remaining: number;
        limit: number;
        resetIn: number;
    } {
        const now = Date.now();
        const windowStart = now - this.rateLimitConfig.windowMs;

        // Clean old timestamps
        this.requestTimestamps = this.requestTimestamps.filter(
            timestamp => timestamp > windowStart
        );

        const remaining = Math.max(
            0,
            this.rateLimitConfig.maxRequests - this.requestTimestamps.length
        );

        const oldestRequest = this.requestTimestamps[0];
        const resetIn = oldestRequest
            ? Math.ceil((oldestRequest + this.rateLimitConfig.windowMs - now) / 1000)
            : 0;

        return {
            remaining,
            limit: this.rateLimitConfig.maxRequests,
            resetIn
        };
    }

    // Send a chat completion request to Venice AI
    async chat(
        messages: ChatMessage[],
        config: VeniceConfig = {}
    ): Promise<string> {
        // Check rate limit before making request
        this.checkRateLimit();

        try {
            const response = await this.client.chat.completions.create({
                model: config.model || this.defaultModel,
                messages: messages,
                temperature: config.temperature ?? 0.7,
                max_tokens: config.maxTokens ?? 2000
            });

            let content = response.choices[0].message.content || "";
            
            // Remove thinking tags and content if present
            content = content.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
            
            // Remove markdown code blocks if present
            content = content.replace(/```(?:javascript|typescript|js|ts)?\n?/g, '').trim();
            
            return content;
        } catch (error) {
            console.error("Venice AI Error:", error);
            throw new Error(`Venice AI request failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }

    // Send a simple prompt to Venice AI
    async prompt(
        userMessage: string,
        systemMessage?: string,
        config: VeniceConfig = {}
    ): Promise<string> {
        const messages: ChatMessage[] = [];
        
        if (systemMessage) {
            messages.push({ role: "system", content: systemMessage });
        }
        
        messages.push({ role: "user", content: userMessage });

        return this.chat(messages, config);
    }

    // Continue a conversation with history
    async continueConversation(
        conversationHistory: ChatMessage[],
        newUserMessage: string,
        config: VeniceConfig = {}
    ): Promise<string> {
        const messages = [
            ...conversationHistory,
            { role: "user" as const, content: newUserMessage }
        ];

        return this.chat(messages, config);
    }
}

// Export singleton instance
export const veniceService = new VeniceService();
export type { ChatMessage, VeniceConfig, RateLimitConfig };