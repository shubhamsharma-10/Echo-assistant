import dotenv from "dotenv";
dotenv.config();

const config = {
    google: {
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID!,
        location: process.env.GOOGLE_CLOUD_LOCATION!,
    },
    datadog: {
        apiKey: process.env.DD_API_KEY!,
        site: process.env.DD_SITE!,
    }
}

export default config;