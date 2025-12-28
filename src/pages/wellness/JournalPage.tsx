import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Book, Smile, Frown, Meh, Zap, Moon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const moods = [
    { id: 'happy', icon: Smile, label: 'Happy', color: 'text-green-500 bg-green-50' },
    { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-yellow-500 bg-yellow-50' },
    { id: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-500 bg-blue-50' },
    { id: 'energetic', icon: Zap, label: 'Energetic', color: 'text-purple-500 bg-purple-50' },
    { id: 'tired', icon: Moon, label: 'Tired', color: 'text-slate-500 bg-slate-50' },
];

export default function JournalPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [content, setContent] = useState("");
    const [mood, setMood] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user && date) {
            fetchEntry(date);
        }
    }, [user, date]);

    const fetchEntry = async (selectedDate: Date) => {
        setLoading(true);
        try {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', user?.id)
                .eq('date', dateStr)
                .maybeSingle();

            if (error) throw error;

            if (data) {
                setContent(data.content || "");
                setMood(data.mood || null);
            } else {
                setContent("");
                setMood(null);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load entry");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!user || !date) return;
        setSaving(true);
        try {
            const dateStr = format(date, 'yyyy-MM-dd');
            const payload = {
                user_id: user.id,
                date: dateStr,
                content,
                mood,
                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('journal_entries')
                .upsert(payload, { onConflict: 'user_id, date' });

            if (error) throw error;
            toast.success("Entry saved successfully");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save entry");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 pb-20">
            {/* Sidebar / Calendar */}
            <div className="md:col-span-1 space-y-4 md:space-y-6">
                <Button variant="ghost" onClick={() => navigate("/wellness")} className="gap-2 -ml-2 text-slate-500 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> Back to Wellness
                </Button>

                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border-0"
                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    />
                </div>

                <div className="hidden md:block bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-3xl border border-indigo-100">
                    <h3 className="font-bold text-indigo-900 flex items-center gap-2 mb-2">
                        <Book className="w-5 h-5" /> Why Journal?
                    </h3>
                    <p className="text-sm text-indigo-700/80 leading-relaxed">
                        Writing down your thoughts helps clear your mind.
                    </p>
                </div>
            </div>

            {/* Main Editor */}
            <div className="md:col-span-2 space-y-4 md:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                            {date ? format(date, 'EEEE, MMM do') : 'Select a Date'}
                        </h1>
                        <p className="text-sm md:text-base text-slate-500">Daily Diary</p>
                    </div>
                    <Button onClick={handleSave} disabled={saving || !date} className="w-full sm:w-auto bg-indigo-600">
                        {saving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Entry</>}
                    </Button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 md:p-6 min-h-[400px] md:min-h-[500px] flex flex-col relative">
                    {/* Mood Selector */}
                    <div className="flex gap-2 mb-4 md:mb-6 overflow-x-auto pb-2 scrollbar-none">
                        {moods.map((m) => (
                            <button
                                key={m.id}
                                onClick={() => setMood(m.id)}
                                className={cn(
                                    "px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-2 text-xs md:text-sm font-medium transition-all border whitespace-nowrap",
                                    mood === m.id
                                        ? `${m.color} border-transparent ring-2 ring-offset-1 ring-slate-200`
                                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                                )}
                            >
                                <m.icon className="w-3 h-3 md:w-4 md:h-4" />
                                {m.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">Loading entry...</div>
                    ) : (
                        <Textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Dear Diary, today was..."
                            className="flex-1 resize-none border-none text-base md:text-lg leading-relaxed focus-visible:ring-0 p-0 placeholder:text-slate-300 font-medium text-slate-700"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
