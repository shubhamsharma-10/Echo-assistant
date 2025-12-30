import { IssueType } from '../utils/types.js';

const KEYWORDS: Record<IssueType, string[]> = {
    billing: ['charge', 'payment', 'refund', 'invoice', 'subscription', 'bill', 'price'],
    tech: ['not working', 'broken', 'error', 'bug', 'crash', 'frozen', 'problem'],
    shipping: ['order', 'delivery', 'track', 'shipping', 'arrived', 'package'],
    account: ['password', 'login', 'account', 'email', 'profile', 'settings'],
    other: [],
};

export function classifyIssue(question: string): IssueType {
    const lower = question.toLowerCase();

    for (const [type, keywords] of Object.entries(KEYWORDS)) {
        if (type === 'other') continue;
        if (keywords.some(kw => lower.includes(kw))) {
            return type as IssueType;
        }
    }

    return 'other';
}