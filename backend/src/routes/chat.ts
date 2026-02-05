import express, { Request, Response } from "express";
import { veniceService } from "../services/veniceService";

const router = express.Router();

// System prompts
const ANALYSIS_PROMPT = `You are a data analysis expert. When given data:
1. Analyze the structure, patterns, and relationships in the data
2. Generate TypeScript/JavaScript code that captures the essence of this data
3. The code should be self-contained and executable
4. The code should contain enough information to reconstruct the original data
5. Use comments, constants, and logic to encode the data patterns

CRITICAL: Output ONLY the code. No thinking process, no explanations, no markdown formatting. Just the raw executable code.`;

const RECONSTRUCTION_PROMPT = `You are a data reconstruction expert. When given code:
1. Analyze the code to understand what data it represents
2. Execute the logic mentally to determine the original data
3. Reconstruct the exact original data that was used to generate this code
4. Output the reconstructed data in the same format as the original

CRITICAL: Output ONLY the reconstructed data. No thinking process, no explanations, no markdown. Just the raw data.`;

// GET / - Health check
router.get("/", (req: Request, res: Response) => {
    const rateLimitStatus = veniceService.getRateLimitStatus();
    
    res.json({
        service: "Venice AI Chatbot",
        status: "active",
        rateLimit: rateLimitStatus,
        endpoints: {
            "GET /rate-limit": "Check rate limit status",
            "POST /analyze": "Analyze data and generate code",
            "POST /reconstruct": "Reconstruct data from code",
            "POST /full-cycle": "Run both phases in sequence"
        }
    });
});

// GET /rate-limit - Check rate limit status
router.get("/rate-limit", (req: Request, res: Response) => {
    const status = veniceService.getRateLimitStatus();
    res.json(status);
});

// POST /analyze - Phase 1: Analyze data and generate code
router.post("/analyze", async (req: Request, res: Response) => {
    try {
        const { data, instruction } = req.body;

        if (!data) {
            return res.status(400).json({ error: "Data is required" });
        }

        const userPrompt = instruction
            ? `${instruction}\n\nData to analyze:\n${data}`
            : `Analyze this data and generate code that encodes it:\n${data}`;

        const generatedCode = await veniceService.prompt(
            userPrompt,
            ANALYSIS_PROMPT
        );

        res.json({
            success: true,
            originalData: data,
            generatedCode: generatedCode,
            instruction: instruction || "Default analysis"
        });
    } catch (error) {
        if (error instanceof Error && error.name === "RateLimitError") {
            console.log(`⚠️  Rate limit hit: ${error.message}`);
            return res.status(429).json({
                error: "Rate limit exceeded",
                message: error.message
            });
        }
        console.error("Analysis error:", error);
        res.status(500).json({
            error: "Analysis failed",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// POST /reconstruct - Phase 2: Reconstruct data from code (stateless)
router.post("/reconstruct", async (req: Request, res: Response) => {
    try {
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({ error: "Code is required" });
        }

        const reconstructedData = await veniceService.prompt(
            `Reconstruct the original data from this code:\n\n${code}`,
            RECONSTRUCTION_PROMPT
        );

        res.json({
            success: true,
            code: code,
            reconstructedData: reconstructedData
        });
    } catch (error) {
        if (error instanceof Error && error.name === "RateLimitError") {
            console.log(`⚠️  Rate limit hit: ${error.message}`);
            return res.status(429).json({
                error: "Rate limit exceeded",
                message: error.message
            });
        }
        console.error("Reconstruction error:", error);
        res.status(500).json({
            error: "Reconstruction failed",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

// POST /full-cycle - Run both steps in sequence
router.post("/full-cycle", async (req: Request, res: Response) => {
    try {
        const { data, instruction } = req.body;

        if (!data) {
            return res.status(400).json({ error: "Data is required" });
        }

        // Step 1: Analysis
        const analysisPrompt = instruction
            ? `${instruction}\n\nData to analyze:\n${data}`
            : `Analyze this data and generate code that encodes it:\n${data}`;

        const generatedCode = await veniceService.prompt(
            analysisPrompt,
            ANALYSIS_PROMPT
        );

        // Step 2: Reconstruction (stateless - no context from step 1)
        const reconstructedData = await veniceService.prompt(
            `Reconstruct the original data from this code:\n\n${generatedCode}`,
            RECONSTRUCTION_PROMPT
        );

        res.json({
            success: true,
            phase1_originalData: data,
            phase1_generatedCode: generatedCode,
            phase2_reconstructedData: reconstructedData,
            instruction: instruction || "Default analysis"
        });
    } catch (error) {
        if (error instanceof Error && error.name === "RateLimitError") {
            console.log(error.message);
            return res.status(429).json({
                error: "Rate limit exceeded",
                message: error.message
            });
        }
        console.error("Full cycle error:", error instanceof Error ? error.message : error);
        res.status(500).json({
            error: "Full cycle failed",
            details: error instanceof Error ? error.message : "Unknown error"
        });
    }
});

module.exports = router;