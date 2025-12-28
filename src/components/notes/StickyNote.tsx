import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Trash2, Pin, Calendar, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

export interface StickyNoteProps {
    id: string;
    content: string;
    color: string;
    reminder_at?: string | null;
    is_pinned: boolean;
    onUpdate: (id: string, updates: any) => void;
    onDelete: (id: string) => void;
}

const colors = {
    yellow: "bg-yellow-200 border-yellow-300 text-yellow-900",
    blue: "bg-blue-200 border-blue-300 text-blue-900",
    pink: "bg-pink-200 border-pink-300 text-pink-900",
    green: "bg-green-200 border-green-300 text-green-900",
    purple: "bg-purple-200 border-purple-300 text-purple-900",
};

export function StickyNote({ id, content, color, reminder_at, is_pinned, onUpdate, onDelete }: StickyNoteProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(content);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [date, setDate] = useState<Date | undefined>(reminder_at ? new Date(reminder_at) : undefined);

    const handleSave = () => {
        onUpdate(id, { content: editContent });
        setIsEditing(false);
    };

    const handleColorChange = (newColor: string) => {
        onUpdate(id, { color: newColor });
        setShowColorPicker(false);
    };

    const handleReminderSet = (newDate: Date | undefined) => {
        setDate(newDate);
        if (newDate) {
            // Set for 9 AM on that day by default if only date selected, or keep existing logic
            // Ideally we need time picker too, but for MVP standard datetime
            onUpdate(id, { reminder_at: newDate.toISOString() });
        } else {
            onUpdate(id, { reminder_at: null });
        }
    };

    return (
        <Card className={cn("relative w-full h-64 flex flex-col transition-all shadow-md hover:shadow-lg transform hover:-translate-y-1 border-2",
            colors[color as keyof typeof colors] || colors.yellow
        )}>
            {/* Pin Action */}
            <Button
                variant="ghost"
                size="icon"
                className={cn("absolute -top-3 -right-3 rounded-full w-8 h-8 shadow-sm z-10 transition-colors",
                    is_pinned ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-slate-400 hover:text-red-500"
                )}
                onClick={() => onUpdate(id, { is_pinned: !is_pinned })}
            >
                <Pin className={cn("w-4 h-4", is_pinned && "fill-current")} />
            </Button>

            <CardContent className="flex-1 p-4 pt-6 overflow-y-auto custom-scrollbar">
                {isEditing ? (
                    <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-full bg-transparent border-none focus-visible:ring-0 resize-none text-current placeholder:text-current/50 font-medium"
                        placeholder="Type your note..."
                        autoFocus
                    />
                ) : (
                    <div
                        onClick={() => setIsEditing(true)}
                        className="w-full h-full whitespace-pre-wrap font-handwriting text-lg leading-snug cursor-text"
                    >
                        {content || <span className="opacity-50 italic">Empty note...</span>}
                    </div>
                )}
            </CardContent>

            <CardFooter className="p-2 flex justify-between items-center bg-black/5 rounded-b-lg">
                <div className="flex gap-1">
                    {/* Color Picker */}
                    <Popover open={showColorPicker} onOpenChange={setShowColorPicker}>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-black/10">
                                <div className={cn("w-4 h-4 rounded-full border border-black/20", colors[color as keyof typeof colors]?.split(' ')[0])} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2 flex gap-1 bg-white">
                            {Object.keys(colors).map((c) => (
                                <button
                                    key={c}
                                    className={cn("w-6 h-6 rounded-full border border-slate-200 transition-transform hover:scale-110",
                                        colors[c as keyof typeof colors].split(' ')[0]
                                    )}
                                    onClick={() => handleColorChange(c)}
                                />
                            ))}
                        </PopoverContent>
                    </Popover>

                    {/* Reminder */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon" className={cn("h-8 w-8 hover:bg-black/10", reminder_at && "text-red-600")}>
                                <Bell className={cn("w-4 h-4", reminder_at && "fill-current")} />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <CalendarComponent
                                mode="single"
                                selected={date}
                                onSelect={handleReminderSet}
                                initialFocus
                            />
                            {/* Simple Reset */}
                            <div className="p-2 border-t">
                                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => handleReminderSet(undefined)}>Clear Reminder</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="flex gap-1">
                    {isEditing ? (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-green-700 hover:bg-green-700/20" onClick={handleSave}>
                            <Save className="w-4 h-4" />
                        </Button>
                    ) : (
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-red-700 hover:bg-red-700/20" onClick={() => onDelete(id)}>
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            </CardFooter>

            {reminder_at && (
                <div className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider opacity-60">
                    <Bell className="w-3 h-3" />
                    {format(new Date(reminder_at), "MMM d")}
                </div>
            )}
        </Card>
    );
}
