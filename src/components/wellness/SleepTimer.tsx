import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Moon, History, BedDouble, StopCircle } from "lucide-react";
import { format, differenceInSeconds, differenceInMinutes } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface SleepSession {
    id: string;
    startTime: string;
    endTime: string | null;
    durationMinutes: number;
}

export function SleepTimer() {
    const { user } = useAuth();
    const [isSleeping, setIsSleeping] = useState(false);
    const [currentSession, setCurrentSession] = useState<SleepSession | null>(null);
    const [history, setHistory] = useState<SleepSession[]>([]);
    const [elapsedTime, setElapsedTime] = useState("00:00:00");
    const [loading, setLoading] = useState(true);

    // Initial Load from Cloud
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            // 1. Check for active session (locally first)
            const storedSession = localStorage.getItem("current_sleep_session");
            if (storedSession) {
                const session = JSON.parse(storedSession);
                setCurrentSession(session);
                setIsSleeping(true);
            }

            // 2. Fetch History from Supabase
            const { data } = await supabase
                .from("wellness_entries")
                .select("*")
                .eq("user_id", user.id)
                .eq("type", "sleep")
                .order("created_at", { ascending: false });

            if (data) {
                const mappedHistory = data.map((entry: any) => ({
                    id: entry.id,
                    startTime: entry.metadata?.startTime || entry.created_at,
                    endTime: entry.metadata?.endTime || entry.created_at,
                    durationMinutes: entry.value
                }));
                setHistory(mappedHistory);
            }
            setLoading(false);
        };

        loadData();
    }, [user]);

    // Timer Tick (Seconds)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isSleeping && currentSession) {
            const updateTimer = () => {
                const start = new Date(currentSession.startTime);
                const now = new Date();
                const totalSeconds = differenceInSeconds(now, start);

                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                const fmt = (n: number) => n.toString().padStart(2, '0');
                setElapsedTime(`${fmt(hours)}:${fmt(minutes)}:${fmt(seconds)}`);
            };

            interval = setInterval(updateTimer, 1000); // Update every second
            updateTimer();
        }
        return () => clearInterval(interval);
    }, [isSleeping, currentSession]);

    const handleSleepToggle = async () => {
        if (!user) {
            toast.error("Please log in to track sleep.");
            return;
        }

        if (!isSleeping) {
            // Start Sleep
            const newSession: SleepSession = {
                id: crypto.randomUUID(),
                startTime: new Date().toISOString(),
                endTime: null,
                durationMinutes: 0
            };
            setCurrentSession(newSession);
            setIsSleeping(true);
            localStorage.setItem("current_sleep_session", JSON.stringify(newSession));
            toast.success("Sleep timer started. Sweet dreams!");
        } else {
            // Wake Up & Save to Cloud
            if (!currentSession) return;

            const endTime = new Date().toISOString();
            const start = new Date(currentSession.startTime);
            const end = new Date(endTime);
            const duration = differenceInMinutes(end, start); // Store minutes in DB

            // Save to Supabase
            const { error } = await supabase.from("wellness_entries").insert({
                user_id: user.id,
                type: "sleep",
                value: duration,
                metadata: { startTime: currentSession.startTime, endTime: endTime },
                date: new Date().toISOString().split('T')[0]
            });

            if (error) {
                console.error("Failed to save sleep:", error);
                toast.error("Failed to save to cloud, but saved locally.");
            } else {
                toast.success(`Wakey wakey! Synced ${Math.floor(duration / 60)}h ${duration % 60}m to cloud.`);
            }

            // Update Local State (History UI)
            const completedSession = { ...currentSession, endTime, durationMinutes: duration };
            setHistory([completedSession, ...history].slice(0, 20));
            setCurrentSession(null);
            setIsSleeping(false);
            setElapsedTime("00:00:00");
            localStorage.removeItem("current_sleep_session");
        }
    };

    const formatDuration = (mins: number) => {
        const hours = Math.floor(mins / 60);
        const minutes = mins % 60;
        return `${hours}h ${minutes}m`;
    };

    return (
        <Card className="w-full border-indigo-100 shadow-md overflow-hidden relative">
            {/* Ambient Background Glow */}
            {isSleeping && (
                <div className="absolute inset-0 bg-indigo-900/5 z-0 animate-pulse pointer-events-none" />
            )}

            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-xl font-bold flex items-center gap-2 text-indigo-950">
                    <BedDouble className="w-5 h-5 text-indigo-500" />
                    Sleep Cloud
                </CardTitle>
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${isSleeping ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-500'}`}>
                    {isSleeping && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
                    {isSleeping ? 'Tracking' : 'Idle'}
                </div>
            </CardHeader>
            <CardContent className="space-y-6 relative z-10">
                {/* Interactive Timer Circle */}
                <div className="flex flex-col items-center justify-center py-8">
                    <div className={`relative flex items-center justify-center w-48 h-48 rounded-full border-4 transition-all duration-700 ${isSleeping ? 'border-indigo-500 bg-white shadow-2xl shadow-indigo-200' : 'border-slate-100 bg-slate-50'}`}>
                        {/* Time Display */}
                        <div className="text-center z-10">
                            <span className={`block text-3xl font-bold font-mono ${isSleeping ? 'text-indigo-600' : 'text-slate-300'}`}>
                                {isSleeping ? elapsedTime : "00:00:00"}
                            </span>
                            <span className="text-xs uppercase tracking-widest text-slate-400 mt-1">
                                {isSleeping ? 'Elapsed' : 'Sleep Time'}
                            </span>
                        </div>

                        {/* Pulsing Ring Effect */}
                        {isSleeping && (
                            <div className="absolute inset-0 rounded-full border-4 border-indigo-100 animate-ping opacity-20" />
                        )}
                    </div>

                    <p className="text-sm text-slate-500 mt-6 mb-4 h-5">
                        {isSleeping
                            ? `Started at ${format(new Date(currentSession!.startTime), 'h:mm a')}`
                            : "Ready to recharge your energy?"}
                    </p>

                    <Button
                        size="lg"
                        onClick={handleSleepToggle}
                        className={`rounded-full px-10 py-6 text-lg font-semibold shadow-xl transition-all transform hover:scale-105 active:scale-95 ${isSleeping
                            ? "bg-white text-indigo-600 border-2 border-indigo-100 hover:bg-slate-50"
                            : "bg-indigo-600 text-white hover:bg-indigo-700 ring-4 ring-indigo-50"
                            }`}
                    >
                        {isSleeping ? (
                            <span className="flex items-center"><StopCircle className="w-6 h-6 mr-2" /> Wake Up</span>
                        ) : (
                            <span className="flex items-center"><Moon className="w-6 h-6 mr-2" /> Start Sleep</span>
                        )}
                    </Button>
                </div>

                {/* Cloud History */}
                <div className="pt-4 border-t border-dashed border-slate-200">
                    <h4 className="font-semibold text-xs uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                        <History className="w-3 h-3" /> Cloud History (All Time)
                    </h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {loading ? (
                            <div className="text-center text-xs text-slate-400">Syncing with cloud...</div>
                        ) : history.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 py-4 italic">No sessions synced yet.</div>
                        ) : (
                            history.map((session) => (
                                <div key={session.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl hover:border-indigo-200 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-500 rounded-lg group-hover:bg-indigo-100 transition-colors">
                                            <Moon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-slate-700">
                                                {format(new Date(session.startTime), 'EEE, MMM d')}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {format(new Date(session.startTime), 'h:mm a')} • Synced
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-slate-800 text-sm">{formatDuration(session.durationMinutes)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
