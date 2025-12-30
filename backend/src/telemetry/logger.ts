import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json()
    ),
    defaultMeta: { service: 'support-bot' },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "combine.log" })
    ]
})

export default logger;