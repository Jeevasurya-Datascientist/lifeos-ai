import { StickyWall } from "@/components/notes/StickyWall";

export default function NotesPage() {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
            <div className="relative mb-12 text-center md:text-left">
                <div className="absolute top-0 left-0 -z-10 w-72 h-72 bg-yellow-200 rounded-full blur-3xl opacity-20" />
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-4">
                    Brain Dump
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl">
                    Capture your thoughts, set reminders, and organize your day with sticky notes.
                </p>
            </div>

            <StickyWall />
        </div>
    );
}
