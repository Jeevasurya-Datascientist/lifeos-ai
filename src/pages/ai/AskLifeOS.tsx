import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User as UserIcon, Loader2, Sparkles, Lightbulb, Wallet, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Message {
    role: "user" | "assistant";
    content: string;
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export default function AskLifeOS() {
    const { user, profile } = useAuth();

    // Pro Gating Logic
    const isPro = profile?.subscription_tier === 'pro' || profile?.subscription_tier === 'lifetime';
    const MODEL = isPro ? "mixtral-8x7b-32768" : "llama-3.3-70b-versatile"; // Use Mixtral for Pro (simulating "Advanced")

    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: `Hi! I'm your LifeOS Assistant. I can help you analyze your spending, suggest budget tips, or just chat about your financial wellness.` }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        if (!GROQ_API_KEY) {
            toast.error("Groq API Key is missing.");
            return;
        }

        const userMsg = text;
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setLoading(true);

        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: MODEL,
                    messages: [
                        { role: "system", content: "You are 'Life OS Assistant', a helpful, friendly, and motivational AI assistant for personal life management. user_context: { balance: 'fetch_if_asked' }. Keep answers concise and actionable." },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: "user", content: userMsg }
                    ],
                    max_tokens: 300
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error("Groq API Error:", response.status, errorText);
                throw new Error(`AI Error ${response.status}`);
            }

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                setMessages(prev => [...prev, { role: "assistant", content: data.choices[0].message.content }]);
            } else {
                throw new Error("No response from AI");
            }

        } catch (error) {
            console.error("AI Error:", error);
            setMessages(prev => [...prev, { role: "assistant", content: "I'm having a little trouble connecting to my brain right now. Can we try that again?" }]);
        } finally {
            setLoading(false);
        }
    };

    const quickPrompts = [
        { icon: Wallet, text: "How is my spending this week?" },
        { icon: Lightbulb, text: "Give me a money-saving tip." },
        { icon: TrendingUp, text: "What should I focus on today?" },
    ];

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] md:h-[calc(100vh-1rem)] max-w-5xl mx-auto p-2 md:p-6 gap-4">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border shadow-sm">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <Bot className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                    <h1 className="font-bold text-lg">Ask LifeOS <span className="text-xs font-normal text-slate-500">
                        ({isPro ? 'Pro • Mixtral 8x7B' : 'Basic • Llama 3'})
                    </span></h1>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online & Ready
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 bg-white rounded-xl border shadow-sm overflow-hidden flex flex-col relative">
                <ScrollArea className="flex-1 p-4 md:p-6">
                    <div className="space-y-6 max-w-3xl mx-auto">
                        {messages.map((m, i) => (
                            <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <Avatar className="w-8 h-8 mt-1 border">
                                    <AvatarFallback className={m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-600'}>
                                        {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                    </AvatarFallback>
                                </Avatar>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm max-w-[85%] md:max-w-[75%] ${m.role === 'user'
                                    ? 'bg-slate-900 text-white rounded-tr-sm'
                                    : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-sm'
                                    }`}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-4">
                                <Avatar className="w-8 h-8 mt-1 border">
                                    <AvatarFallback className="bg-indigo-100 text-indigo-600"><Bot className="w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <div className="bg-slate-50 p-4 rounded-2xl rounded-tl-sm border border-slate-100 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                    <span className="text-xs text-muted-foreground">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Quick Prompts (only show if few messages or idle) */}
                {messages.length < 3 && !loading && (
                    <div className="px-4 pb-2 flex gap-2 justify-center flex-wrap">
                        {quickPrompts.map((p, i) => (
                            <Button
                                key={i}
                                variant="outline"
                                size="sm"
                                className="rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-600 border-indigo-100 transition-colors text-xs"
                                onClick={() => handleSend(p.text)}
                            >
                                <p.icon className="w-3 h-3 mr-2" />
                                {p.text}
                            </Button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 bg-slate-50 border-t">
                    <form
                        className="max-w-3xl mx-auto relative flex items-center"
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                    >
                        <div className="absolute left-3 p-1.5 bg-indigo-100 rounded-md">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                        </div>
                        <Input
                            placeholder="Ask anything about your finances..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={loading}
                            className="pl-12 pr-12 py-6 rounded-full border-slate-200 shadow-sm focus-visible:ring-indigo-500 bg-white"
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={loading || !input.trim()}
                            className="absolute right-2 rounded-full h-8 w-8 bg-indigo-600 hover:bg-indigo-700"
                        >
                            <Send className="w-4 h-4" />
                        </Button>
                    </form>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                        LifeOS AI can make mistakes. Consider checking important financial info.
                    </p>
                </div>
            </div>
        </div>
    );
}
