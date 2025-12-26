import { Brain, Sparkles } from "lucide-react";

export function LoadingScreen() {
    return (
        <div className="fixed inset-0 bg-slate-900 flex flex-col items-center justify-center z-50">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>

            <div className="relative z-10 flex flex-col items-center gap-6">
                {/* Logo / Icon Animation */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-xl blur-lg opacity-50 animate-ping"></div>
                    <div className="w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl relative">
                        <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
                        <Sparkles className="w-4 h-4 text-purple-400 absolute top-3 right-3 animate-bounce" />
                    </div>
                </div>

                {/* Text Animation */}
                <div className="space-y-2 text-center">
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                        LifeOS AI
                    </h2>
                    <div className="flex items-center gap-1 justify-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-bounce"></div>
                    </div>
                </div>

                {/* Quote or Tip (Optional) */}
                <p className="text-slate-500 text-xs mt-4 animate-in fade-in duration-1000">
                    Initializing your digital brain...
                </p>
            </div>
        </div>
    );
}
