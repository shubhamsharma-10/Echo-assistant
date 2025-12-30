import { VertexAI } from "@google-cloud/vertexai";
import config from "../utils/config.js";
import { EVALUATOR_PROMPT } from "../utils/prompts.js";
import logger from "../telemetry/logger.js";
const vertexAI = new VertexAI({
    project: config.google.projectId,
    location: config.google.location,
});
const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash-001",
    generationConfig: {
        responseMimeType: "application/json", // Force JSON output
    },
});
export interface EvaluationResult {
    helpfulness: number;
    safety: number;
    hallucinationRisk: number;
    escalationNeeded: boolean;
    comment: string;
}
export async function evaluateAnswer(
    question: string,
    answer: string
): Promise<{ evaluation: EvaluationResult; latencyMs: number; tokens: number }> {
    const startTime = Date.now();
    const prompt = `
Question: ${question}
Answer: ${answer}
Evaluate this support response.`;
    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            systemInstruction: EVALUATOR_PROMPT,
        });

        console.log("Result from evaluateAnswer: ", JSON.stringify(result));

        const latencyMs = Date.now() - startTime;
        const responseText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
        const tokens = result.response.usageMetadata?.totalTokenCount || 0;

        const evaluation = JSON.parse(responseText) as EvaluationResult;
        logger.info("Evaluation complete", { latencyMs, evaluation });
        return { evaluation, latencyMs, tokens };
    } catch (error) {
        logger.error("Evaluation failed", { error });
        return {
            evaluation: {
                helpfulness: 0.5,
                safety: 0.5,
                hallucinationRisk: 0.5,
                escalationNeeded: true,
                comment: "Evaluation failed",
            },
            latencyMs: Date.now() - startTime,
            tokens: 0,
        };
    }
}
