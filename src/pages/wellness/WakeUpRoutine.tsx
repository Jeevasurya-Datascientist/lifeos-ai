import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { AlarmClock, CheckCircle, Play, Settings2, Plus, Trash2, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoutineStep {
    id: string;
    title: string;
    duration: number; // minutes
    is_completed: boolean;
}

interface Routine {
    id: string;
    name: string;
    steps: RoutineStep[];
    alarm_time: string | null; // "HH:MM:SS"
    is_enabled: boolean;
}

const DEFAULT_STEPS: RoutineStep[] = [
    { id: "1", title: "Drink Water", duration: 1, is_completed: false },
    { id: "2", title: "Stretch / Yoga", duration: 10, is_completed: false },
    { id: "3", title: "Meditation", duration: 5, is_completed: false },
    { id: "4", title: "Review Goals", duration: 5, is_completed: false },
];

export default function WakeUpRoutine() {
    const { user } = useAuth();
    const [routine, setRoutine] = useState<Routine | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
    const [mode, setMode] = useState<"setup" | "active" | "complete">("setup");

    // Alarm Logic
    useEffect(() => {
        if (!routine?.alarm_time || !routine.is_enabled) return;

        const checkAlarm = () => {
            const now = new Date();
            const [hours, minutes] = routine.alarm_time!.split(':').map(Number);

            if (now.getHours() === hours && now.getMinutes() === minutes && now.getSeconds() < 2) {
                // Trigger Alarm
                sendNotification();
                toast("Wake Up! ☀️", { description: "Time to start your morning routine!", duration: 10000 });
                playAlarmSound();
            }
        };

        const interval = setInterval(checkAlarm, 1000);
        return () => clearInterval(interval);
    }, [routine]);

    useEffect(() => {
        if (user) fetchRoutine();
    }, [user]);

    const fetchRoutine = async () => {
        try {
            const { data, error } = await supabase
                .from('daily_routines')
                .select('*')
                .eq('user_id', user?.id)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setRoutine(data);
            } else {
                // Initialize Default
                setRoutine({
                    id: '', // Placeholder
                    name: 'Morning Routine',
                    steps: DEFAULT_STEPS,
                    alarm_time: '07:00',
                    is_enabled: true
                } as any);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const saveRoutine = async () => {
        if (!user || !routine) return;
        try {
            const payload = {
                user_id: user.id,
                name: routine.name,
                steps: routine.steps,
                alarm_time: routine.alarm_time,
                is_enabled: routine.is_enabled
            };

            const { data, error } = await supabase
                .from('daily_routines')
                .upsert(routine.id ? { ...payload, id: routine.id, updated_at: new Date().toISOString() } : payload)
                .select()
                .single();

            if (error) throw error;
            setRoutine(data);
            setIsEditing(false);
            toast.success("Routine saved");
        } catch (err) {
            toast.error("Failed to save routine");
        }
    };

    const sendNotification = () => {
        if (!("Notification" in window)) return;
        if (Notification.permission === "granted") {
            new Notification("Wake Up! ☀️", { body: "Time to start your morning routine!" });
        } else if (Notification.permission !== "denied") {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    new Notification("Wake Up! ☀️", { body: "Time to start your morning routine!" });
                }
            });
        }
    };

    const playAlarmSound = () => {
        const audio = new Audio('/alarm.mp3'); // Need to ensure file exists or use external
        // Fallback or use standard beep logic if no file
        // For now, just rely on browser notification sound (system default)
    };

    const toggleStep = (index: number) => {
        if (!routine) return;
        const newSteps = [...routine.steps];
        newSteps[index].is_completed = !newSteps[index].is_completed;
        setRoutine({ ...routine, steps: newSteps });

        // Auto-save logic if needed, or wait for manual save? 
        // Better to save progress.
        // updateRoutineProgress(newSteps);

        // Check complete
        if (newSteps.every(s => s.is_completed)) {
            setMode("complete");
            toast.success("Routine Completed! 🎉");
            // Award points here?
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Routine...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Sun className="w-8 h-8 text-orange-500" />
                        {routine?.name || "Morning Routine"}
                    </h1>
                    <p className="text-slate-500 mt-1">Start your day with intention and energy.</p>
                </div>
                {!isEditing && mode === "setup" && (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        <Settings2 className="w-4 h-4 mr-2" /> Settings
                    </Button>
                )}
            </div>

            {/* Editing Mode */}
            {isEditing && routine && (
                <Card className="border-2 border-indigo-100 shadow-lg">
                    <CardHeader>
                        <CardTitle>Customize Routine</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium mb-1 block">Alarm Time</label>
                                <Input
                                    type="time"
                                    value={routine.alarm_time || ''}
                                    onChange={(e) => setRoutine({ ...routine, alarm_time: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <Checkbox
                                    id="enabled"
                                    checked={routine.is_enabled}
                                    onCheckedChange={(checked) => setRoutine({ ...routine, is_enabled: checked === true })}
                                />
                                <label htmlFor="enabled" className="text-sm font-medium">Enable Alarm</label>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium block">Steps</label>
                            {routine.steps.map((step, idx) => (
                                <div key={step.id} className="flex items-center gap-2">
                                    <Input
                                        value={step.title}
                                        onChange={(e) => {
                                            const newSteps = [...routine.steps];
                                            newSteps[idx].title = e.target.value;
                                            setRoutine({ ...routine, steps: newSteps });
                                        }}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        value={step.duration}
                                        onChange={(e) => {
                                            const newSteps = [...routine.steps];
                                            newSteps[idx].duration = parseInt(e.target.value) || 0;
                                            setRoutine({ ...routine, steps: newSteps });
                                        }}
                                        className="w-20"
                                        placeholder="Min"
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => {
                                        const newSteps = routine.steps.filter((_, i) => i !== idx);
                                        setRoutine({ ...routine, steps: newSteps });
                                    }}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            ))}
                            <Button variant="outline" size="sm" onClick={() => {
                                setRoutine({
                                    ...routine,
                                    steps: [...routine.steps, { id: crypto.randomUUID(), title: "", duration: 5, is_completed: false }]
                                });
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Add Step
                            </Button>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={saveRoutine} className="bg-indigo-600">Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Active / Setup Mode */}
            {!isEditing && mode === "setup" && routine && (
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
                        <CardContent className="p-8 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">Ready to start?</h2>
                                <p className="text-indigo-100 mb-4">You have {routine.steps.length} steps scheduled for today.</p>
                                <div className="flex items-center gap-2 text-sm bg-white/10 w-fit px-3 py-1 rounded-full">
                                    <AlarmClock className="w-4 h-4" />
                                    {routine.alarm_time ? `Alarm set for ${routine.alarm_time}` : "No alarm set"}
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-16 w-16 rounded-full shadow-lg"
                                onClick={() => {
                                    setMode("active");
                                    // Request notif permission
                                    if ("Notification" in window && Notification.permission !== "granted") {
                                        Notification.requestPermission();
                                    }
                                }}
                            >
                                <Play className="w-8 h-8 ml-1" />
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Preview List */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                        {routine.steps.map((step, i) => (
                            <div key={step.id} className="p-4 border-b last:border-0 flex items-center justify-between">
                                <span className="font-medium text-slate-700">{i + 1}. {step.title}</span>
                                <span className="text-sm text-slate-400">{step.duration} min</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Execution Mode */}
            {mode === "active" && routine && (
                <div className="max-w-xl mx-auto space-y-8">
                    <div className="text-center">
                        <div className="inline-block p-4 bg-orange-100 rounded-full mb-4 animate-pulse">
                            <Sun className="w-12 h-12 text-orange-500" />
                        </div>
                        <h2 className="text-2xl font-bold">Good Morning! ☀️</h2>
                        <p className="text-slate-500">Let's get this day started right.</p>
                    </div>

                    <div className="space-y-4">
                        {routine.steps.map((step, idx) => (
                            <div
                                key={step.id}
                                onClick={() => toggleStep(idx)}
                                className={cn(
                                    "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                                    step.is_completed
                                        ? "bg-green-50 border-green-200"
                                        : "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                                        step.is_completed ? "bg-green-500 border-green-500" : "border-slate-300 group-hover:border-indigo-400"
                                    )}>
                                        {step.is_completed && <CheckCircle className="w-4 h-4 text-white" />}
                                    </div>
                                    <div>
                                        <h3 className={cn("font-bold text-lg", step.is_completed && "text-slate-400 line-through")}>{step.title}</h3>
                                        <p className="text-sm text-slate-400">{step.duration} minutes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button variant="outline" className="w-full" onClick={() => setMode("setup")}>Exit Routine</Button>
                </div>
            )}

            {mode === "complete" && (
                <div className="text-center py-20 px-4">
                    <div className="mb-6 mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                        <Trophy className="w-12 h-12 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-2">You Crushed It! 🎉</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Your morning routine is complete. Only 18% of people complete their routine consistently!</p>
                    <Button className="bg-indigo-600 px-8" onClick={() => setMode("setup")}>Start My Day</Button>
                </div>
            )}
        </div>
    );
}

import { Trophy } from "lucide-react";
