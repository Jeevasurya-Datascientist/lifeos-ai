import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "ta" | "hi" | "te" | "kn" | "ml" | "od";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    en: {
        "hello": "Hello",
        "daily_pulse": "Daily Pulse",
        "read_full_story": "Read Full Story",
        "welcome": "Welcome to your LifeOS",
        "wallet_balance": "Wallet Balance",
        "ai_focus": "AI Focus",
        "quick_actions": "Quick Actions",
        "recharge": "Recharge",
        "pay_bills": "Pay Bills",
        "recent_transactions": "Recent Transactions",
        "upgrade": "Upgrade",
        "logout": "Logout",
        "profile": "Profile"
    },
    ta: {
        "hello": "வணக்கம்",
        "welcome": "உங்கள் LifeOS க்கு வரவேற்கிறோம்",
        "wallet_balance": "பணப்பை இருப்பு",
        "ai_focus": "AI கவனம்",
        "quick_actions": "விரைவு செயல்கள்",
        "recharge": "ரீசார்ஜ்",
        "pay_bills": "பில்களை செலுத்துங்கள்",
        "recent_transactions": "சமீபத்திய பரிவர்த்தனைகள்",
        "upgrade": "மேம்படுத்தவும்",
        "logout": "வெளியேறு",
        "profile": "சுயவிவரம்"
    },
    hi: {
        "hello": "नमस्ते",
        "welcome": "LifeOS में आपका स्वागत है",
        "wallet_balance": "वॉलेट बैलेंस",
        "ai_focus": "AI फोकस",
        "quick_actions": "त्वरित कार्रवाई",
        "recharge": "रिचार्ज",
        "pay_bills": "बिल चुकाएं",
        "recent_transactions": "हालिया लेनदेन",
        "upgrade": "अपग्रेड",
        "logout": "लॉग आउट",
        "profile": "प्रोफ़ाइल"
    },
    te: {
        "hello": "హలో",
        "welcome": "LifeOS కి స్వాగతం",
        "wallet_balance": "వాలెట్ బ్యాలెన్స్",
        "ai_focus": "AI ఫోకస్",
        "quick_actions": "త్వరిత చర్యలు",
        "recharge": "రీఛార్జ్",
        "pay_bills": "బిల్లులు చెల్లించండి",
        "recent_transactions": "ఇటీవలి లావాదేవీలు",
        "upgrade": "అప్‌గ్రేడ్",
        "logout": "లాగ్ అవుట్",
        "profile": "ప్రొఫైల్"
    },
    kn: {
        "hello": "ನಮಸ್ಕಾರ",
        "welcome": "LifeOS ಗೆ ಸ್ವಾಗತ",
        "wallet_balance": "ವಾಲೆಟ್ ಬಾಕಿ",
        "ai_focus": "AI ಗಮನ",
        "quick_actions": "ತ್ವರಿತ ಕ್ರಮಗಳು",
        "recharge": "ರೀಚಾರ್ಜ್",
        "pay_bills": "ಬಿಲ್ ಪಾವತಿಸಿ",
        "recent_transactions": "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
        "upgrade": "ಅಪ್‌ಗ್ರೇಡ್",
        "logout": "ಲಾಗ್ ಔಟ್",
        "profile": "ಪ್ರೊಫೈಲ್"
    },
    ml: {
        "hello": "നമസ്കാരം",
        "welcome": "LifeOS-ലേക്ക് സ്വാഗതം",
        "wallet_balance": "വായന ബാലൻസ്",
        "ai_focus": "AI ഫോക്കസ്",
        "quick_actions": "ദ്രുത നടപടികൾ",
        "recharge": "റീചാർജ്",
        "pay_bills": "ബില്ലുകൾ അടയ്ക്കുക",
        "recent_transactions": "സമീപകാല ഇടപാടുകൾ",
        "upgrade": "അപ്ഗ്രേഡ്",
        "logout": "ലോഗൗട്ട്",
        "profile": "പ്രൊഫൈൽ"
    },
    od: {
        "hello": "ନମସ୍କାର",
        "welcome": "LifeOS କୁ ସ୍ୱାଗତ",
        "wallet_balance": "ୱାଲେଟ୍ ବାଲାନ୍ସ",
        "ai_focus": "AI ଫୋକସ୍",
        "quick_actions": "ତୁରନ୍ତ କାର୍ଯ୍ୟ",
        "recharge": "ରିଚାର୍ଜ",
        "pay_bills": "ବିଲ୍ ପେମେଣ୍ଟ",
        "recent_transactions": "ସାମ୍ପ୍ରତିକ କାରବାର",
        "upgrade": "ଅପଗ୍ରେଡ୍",
        "logout": "ଲଗ୍ ଆଉଟ୍",
        "profile": "ପ୍ରୋଫାଇଲ୍"
    }
};

const LanguageContext = createContext<LanguageContextType>({
    language: "en",
    setLanguage: () => { },
    t: (key) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>("en");

    const t = (key: string) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};
