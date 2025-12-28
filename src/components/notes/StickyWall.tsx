import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { StickyNote, StickyNoteProps } from "./StickyNote";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

export function StickyWall() {
    const { user } = useAuth();
    const [notes, setNotes] = useState<StickyNoteProps[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch Notes
    useEffect(() => {
        if (!user) return;
        fetchNotes();

        // Optional: Realtime subscription
        const channel = supabase
            .channel('sticky_notes_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'sticky_notes', filter: `user_id=eq.${user.id}` },
                () => fetchNotes()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    // Reminder Checker
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            notes.forEach(note => {
                if (note.reminder_at) {
                    const reminderTime = new Date(note.reminder_at);
                    // Check if reminder is within the last minute (to avoid spamming)
                    // Simple logic: if absolute diff < 60s
                    // Better: Mark as 'notified' in local state or DB? 
                    // For MVP: Notification logic is complex. 
                    // We'll just check if it matches current minute.
                    if (
                        reminderTime.getDate() === now.getDate() &&
                        reminderTime.getHours() === now.getHours() &&
                        reminderTime.getMinutes() === now.getMinutes() &&
                        reminderTime.getFullYear() === now.getFullYear()
                    ) {
                        toast.message("Reminder!", {
                            description: note.content || "Empty Note",
                            icon: <AlertCircle className="w-5 h-5 text-amber-500" />
                        });
                        // Play sound?
                    }
                }
            });
        }, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, [notes]);

    const fetchNotes = async () => {
        try {
            const { data, error } = await supabase
                .from('sticky_notes')
                .select('*')
                .order('is_pinned', { ascending: false }) // Pinned first
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotes(data || []);
        } catch (err) {
            console.error("Error fetching notes:", err);
            toast.error("Failed to load notes");
        } finally {
            setLoading(false);
        }
    };

    const addNote = async () => {
        if (!user) return;
        try {
            const newNote = {
                user_id: user.id,
                content: "",
                color: "yellow",
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('sticky_notes')
                .insert(newNote)
                .select()
                .single();

            if (error) throw error;
            setNotes([data, ...notes]);
            toast.success("New note added");
        } catch (err) {
            toast.error("Failed to add note");
        }
    };

    const updateNote = async (id: string, updates: any) => {
        // Optimistic UI
        setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));

        try {
            const { error } = await supabase
                .from('sticky_notes')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
        } catch (err) {
            toast.error("Failed to save changes");
            fetchNotes(); // Revert
        }
    };

    const deleteNote = async (id: string) => {
        if (!confirm("Are you sure you want to delete this note?")) return;

        // Optimistic
        setNotes(prev => prev.filter(n => n.id !== id));

        try {
            const { error } = await supabase.from('sticky_notes').delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            toast.error("Failed to delete");
            fetchNotes();
        }
    };

    if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}</div>

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <LayoutGrid className="w-6 h-6 text-indigo-500" />
                    My Sticky Wall
                </h2>
                <Button onClick={addNote} className="bg-indigo-600 hover:bg-indigo-700">
                    <Plus className="w-4 h-4 mr-2" /> Add Note
                </Button>
            </div>

            {notes.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <p className="text-slate-400 mb-4">No notes yet. Add one to remember things!</p>
                    <Button variant="outline" onClick={addNote}>Create First Note</Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {notes.map(note => (
                        <StickyNote
                            key={note.id}
                            {...note}
                            onUpdate={updateNote}
                            onDelete={deleteNote}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
