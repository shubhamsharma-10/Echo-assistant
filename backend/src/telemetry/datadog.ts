import logger from "./logger.js";
import config from "../utils/config.js";

// Datadog v2 API format
interface MetricSeries {
    metric: string;
    type: number;  // 0=unspecified, 1=count, 2=rate, 3=gauge
    points: Array<{ timestamp: number; value: number }>;
    tags?: string[];
    resources?: Array<{ name: string; type: string }>;
}

let metricsBatch: MetricSeries[] = [];
const now = () => Math.floor(Date.now() / 1000);

export const metrics = {
    gauge(name: string, value: number, tags: string[] = []) {
        metricsBatch.push({
            metric: `supportbot.${name}`,
            type: 3,  // 3 = gauge
            points: [{ timestamp: now(), value }],
            tags: ["env:prod", "service:supportbot", ...tags],
        });
    },
    count(name: string, value: number = 1, tags: string[] = []) {
        metricsBatch.push({
            metric: `supportbot.${name}`,
            type: 1,  // 1 = count
            points: [{ timestamp: now(), value }],
            tags: ["env:prod", "service:supportbot", ...tags],
        });
    },
    async flush(): Promise<void> {
        if (metricsBatch.length === 0 || !config.datadog.apiKey) return;
        const toSend = [...metricsBatch];
        metricsBatch = [];

        console.log("Sending to Datadog:", JSON.stringify({ series: toSend }, null, 2));

        try {
            const response = await fetch(`https://api.${config.datadog.site}/api/v2/series`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "DD-API-KEY": config.datadog.apiKey,
                },
                body: JSON.stringify({ series: toSend }),
            });

            if (!response.ok) {
                const errorBody = await response.text();
                logger.error("Datadog metrics error", { status: response.status, body: errorBody });
                console.log("Datadog error response:", errorBody);
            } else {
                console.log("✅ Metrics sent to Datadog successfully!");
            }
        } catch (error) {
            logger.error("Failed to send metrics", { error });
        }
    },
};

export async function sendLog(data: Record<string, any>): Promise<void> {
    if (!config.datadog.apiKey) return;

    const logPayload = [{
        ddsource: "nodejs",
        service: "supportbot",
        hostname: "hackathon-dev",
        ...data,
    }];

    console.log("Sending log to Datadog:", JSON.stringify(logPayload, null, 2));

    try {
        const response = await fetch(`https://http-intake.logs.${config.datadog.site}/api/v2/logs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "DD-API-KEY": config.datadog.apiKey,
            },
            body: JSON.stringify(logPayload),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.log("❌ Datadog log error:", response.status, errorBody);
        } else {
            console.log("✅ Log sent to Datadog successfully!");
        }
    } catch (error) {
        logger.error("Failed to send log", { error });
    }
}