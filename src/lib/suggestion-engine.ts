export interface Suggestion {
    id: string;
    text: string;
    type: "financial" | "wellness" | "productivity";
    actionLabel?: string;
    actionLink?: string;
}

export const getDailySuggestion = (hour: number, balance: number): Suggestion => {
    // 1. Time-based Logic
    if (hour < 10) {
        // Morning
        return {
            id: "morning-focus",
            text: "Good morning! Start your day by reviewing your daily goals.",
            type: "productivity",
            actionLabel: "View Goals",
        };
    } else if (hour >= 20) {
        // Night
        return {
            id: "night-reflection",
            text: "It's been a long day. How much did you spend today?",
            type: "financial",
            actionLabel: "Log Expenses",
        };
    }

    // 2. Financial Context Logic
    if (balance < 1000) {
        return {
            id: "low-balance",
            text: "Your wallet balance is getting low. Try to limit discretionary spending today.",
            type: "financial",
        };
    } else if (balance > 10000) {
        return {
            id: "savings-opportunity",
            text: "You have a healthy balance! Consider moving ₹2000 to savings.",
            type: "financial",
            actionLabel: "Save Now",
        };
    }

    // Default Midday
    return {
        id: "midday-wellness",
        text: "Don't forget to drink water and take a quick stretch break!",
        type: "wellness",
        actionLabel: "Got it",
    };
};
