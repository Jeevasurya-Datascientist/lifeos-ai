import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Wind, Brain, Heart, Activity } from "lucide-react";

type BreathingPhase = 'IDLE' | 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

export function BreathingExercise() {
    const [phase, setPhase] = useState<BreathingPhase>('IDLE');
    const [cycleCount, setCycleCount] = useState(0);

    const PHASE_DURATION = 5000; // 5 seconds (20s Total Cycle)

    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (phase !== 'IDLE') {
            timer = setTimeout(() => {
                switch (phase) {
                    case 'INHALE': setPhase('HOLD_IN'); break;
                    case 'HOLD_IN': setPhase('EXHALE'); break;
                    case 'EXHALE': setPhase('HOLD_OUT'); break;
                    case 'HOLD_OUT': setPhase('INHALE'); setCycleCount(c => c + 1); break;
                }
            }, PHASE_DURATION);
        }

        return () => clearTimeout(timer);
    }, [phase]);

    const toggleExercise = () => {
        if (phase === 'IDLE') {
            setPhase('INHALE');
            setCycleCount(0);
        } else {
            setPhase('IDLE');
        }
    };

    const getConfig = () => {
        switch (phase) {
            case 'IDLE':
                return { text: "Start Cycle", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200", icon: Wind, scale: "scale-100" };
            case 'INHALE':
                return { text: "Inhale... Fill Lungs", color: "text-cyan-600", bg: "bg-cyan-50", border: "border-cyan-400", icon: Wind, scale: "scale-150 duration-[5000ms]" };
            case 'HOLD_IN':
                return { text: "Hold... Oxygenate Brain", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-400", icon: Brain, scale: "scale-150 duration-500 animate-pulse" };
            case 'EXHALE':
                return { text: "Exhale... Calming Heart", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-400", icon: Heart, scale: "scale-100 duration-[5000ms]" };
            case 'HOLD_OUT':
                return { text: "Hold... Relax Body", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-400", icon: Activity, scale: "scale-100 duration-500" };
        }
    };

    const config = getConfig();
    const Icon = config.icon;

    return (
        <div className={`p-6 rounded-xl border shadow-sm flex flex-col items-center text-center space-y-6 transition-colors duration-1000 ${config.bg} ${config.border}`}>
            <h3 className={`font-semibold text-lg flex items-center gap-2 ${config.color}`}>
                Wellness Cycle
                <span className="text-xs font-normal opacity-70 border px-2 rounded-full">Box Breathing</span>
            </h3>

            <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Rotating Timer Ring (SVG) */}
                {phase !== 'IDLE' && (
                    <svg className="absolute inset-0 w-full h-full rotate-[-90deg]">
                        <circle
                            cx="96" cy="96" r="88"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            className={`${config.color} opacity-20`}
                        />
                        <circle
                            cx="96" cy="96" r="88"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeDasharray="553" // 2 * pi * 88
                            strokeDashoffset="0"
                            className={`${config.color} transition-all ease-linear`}
                            style={{
                                animation: `dash ${PHASE_DURATION}ms linear infinite`
                            }}
                        />
                    </svg>
                )}

                {/* Central Visual */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-sm transition-all ease-linear z-10 bg-white ${config.border} ${config.scale}`}>
                    <Icon className={`w-10 h-10 ${config.color} transition-all duration-500`} />
                </div>
            </div>

            <div className="space-y-4 w-full z-10">
                <p className={`text-lg font-medium transition-all duration-300 ${config.color}`}>
                    {config.text}
                </p>
                <div className="text-xs text-muted-foreground mt-1">
                    {phase === 'IDLE' ? "20s Cycle: 5s phases" : `Phase: ${PHASE_DURATION / 1000}s`}
                </div>

                <Button
                    onClick={toggleExercise}
                    className={`w-full transition-colors duration-500 ${phase === 'IDLE' ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-900'}`}
                >
                    {phase === 'IDLE'
                        ? <><Play className="w-4 h-4 mr-2" /> Begin Session</>
                        : <><Square className="w-4 h-4 mr-2" /> End Session ({cycleCount + 1})</>
                    }
                </Button>
            </div>

            {/* CSS Animation Keyframes for the Ring */}
            <style>{`
                @keyframes dash {
                    from { stroke-dashoffset: 553; }
                    to { stroke-dashoffset: 0; }
                }
            `}</style>
        </div>
    );
}
