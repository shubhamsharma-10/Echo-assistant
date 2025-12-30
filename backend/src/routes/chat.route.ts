import { Router, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid'
import logger from "../telemetry/logger.js";
import { metrics, sendLog } from "../telemetry/datadog.js";
import { generateAnswer } from "../services/generate.service.js";
import { evaluateAnswer } from "../services/evaluate.service.js";
import { classifyIssue } from "../services/classifier.service.js";

const chatRouter = Router();

chatRouter.post('/chat', async (req: Request, res: Response) => {
    const startTime = Date.now();
    const requestId = uuidv4();
    const { userId, question } = req.body;
    console.log(question);

    logger.info("Request received", { requestId, userId, question })
    try {
        const issueType = classifyIssue(question);
        const tags = [`issue_type:${issueType}`];

        const answerResult = await generateAnswer(question);
        logger.info("Answer generated", { requestId, userId, answerResult })
        const evalResult = await evaluateAnswer(question, answerResult.answer);
        logger.info("Evaluation generated", { requestId, userId, evalResult })
        const totalLatency = Date.now() - startTime;

        metrics.gauge("latency.answer_ms", answerResult.latencyMs, tags);
        metrics.gauge("latency.eval_ms", evalResult.latencyMs, tags);
        metrics.gauge("latency.total_ms", totalLatency, tags);
        metrics.gauge("quality.helpfulness", evalResult.evaluation.helpfulness, tags);
        metrics.gauge("quality.safety", evalResult.evaluation.safety, tags);
        metrics.gauge("quality.hallucination_risk", evalResult.evaluation.hallucinationRisk, tags);
        metrics.gauge("escalation.needed", evalResult.evaluation.escalationNeeded ? 1 : 0, tags);
        metrics.count("tokens.total", answerResult.tokens + evalResult.tokens, tags);
        metrics.count("requests.total", 1, tags);
        await metrics.flush();

        await sendLog({
            level: "info",
            message: "Chat completed",
            requestId,
            userId,
            issueType,
            question,
            answer: answerResult.answer,
            evaluation: evalResult.evaluation,
            latency: { answer: answerResult.latencyMs, eval: evalResult.latencyMs, total: totalLatency },
        });

        res.status(200).json({
            answer: answerResult.answer,
            requestId,
            metrics: evalResult.evaluation,
            latency: totalLatency,
        });
    } catch (error) {
        logger.error("Error in chat", { requestId, userId, error })
        res.status(500).json({
            msg: "Error in chat",
            error
        })
    }
})

export default chatRouter