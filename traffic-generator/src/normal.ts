const API_URL = "http://localhost:3000/api/chat";

const normalQuestions = [
    // Billing questions
    "I was charged twice this month, can you help?",
    "How do I update my payment method?",
    "Can I get a refund for my last order?",
    "Why is my subscription more expensive now?",

    // Shipping questions
    "Where is my order #12345?",
    "How long does shipping take?",
    "Can I change my delivery address?",
    "My package shows delivered but I didn't receive it",

    // Technical support
    "My product isn't turning on, what should I do?",
    "How do I reset my device to factory settings?",
    "The app keeps crashing on my phone",
    "I can't connect my device to WiFi",

    // Account questions
    "How do I change my password?",
    "I forgot my email address for my account",
    "How do I cancel my subscription?",
    "Can I transfer my account to someone else?",
];

function getRandomItems<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

async function sendRequest(question: string, index: number) {
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: "normal-traffic", question }),
        });

        const data = await response.json();

        if (data.metrics) {
            const h = data.metrics.helpfulness;
            const s = data.metrics.safety;
            const status = h >= 0.7 && s >= 0.8 ? "Good" : "Warning";
            console.log(`  ${status} Helpfulness: ${h} | Safety: ${s} | Latency: ${data.latency}ms`);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
    }
}


async function run() {
    console.log("NORMAL TRAFFIC GENERATOR");

    const selected = getRandomItems(normalQuestions, 4);
    console.log(selected);
    for (let i = 0; i < selected.length; i++) {
        await sendRequest(selected[i] as string, i);
        await new Promise(r => setTimeout(r, 3000)); // 3 second delay
    }
}

run().catch(console.error);