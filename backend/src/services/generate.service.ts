import { VertexAI } from "@google-cloud/vertexai";
import config from "../utils/config.js";
import { SUPPORT_AGENT_PROMPT } from "../utils/prompts.js";
import logger from "../telemetry/logger.js";

const vertexAI = new VertexAI({
    project: config.google.projectId,
    location: config.google.location
})

const model = vertexAI.getGenerativeModel({
    model: "gemini-2.0-flash-001"
})


export async function generateAnswer(question: string) {
    try {
        const startTime = Date.now();
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{
                    text: question
                }]
            }],
            systemInstruction: SUPPORT_AGENT_PROMPT
        })

        console.log("Result from generateAnswer: ", JSON.stringify(result));

        logger.info("Result", JSON.stringify(result));

        const latencyMs = Date.now() - startTime;
        const answer = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const tokens = result.response.usageMetadata?.totalTokenCount || 0;
        logger.info("Answer generated", { latencyMs, tokens });
        return { answer, latencyMs, tokens };
    } catch (error) {
        logger.error("Error in generateAnswer", error);
        throw error;
    }
}