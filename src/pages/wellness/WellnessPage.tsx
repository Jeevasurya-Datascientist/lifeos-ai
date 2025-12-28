import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Sun, Moon, Droplets, CheckCircle2, Smile, ArrowRight, Book } from "lucide-react";
import { WellnessScoreCard } from "@/components/dashboard/WellnessScoreCard";

export default function WellnessPage() {
    const navigate = useNavigate();

    const features = [
        {
            title: "Wake Up Routine",
            description: "Start your day with energy.",
            icon: Sun,
            color: "text-orange-500",
            bg: "bg-orange-50 hover:bg-orange-100",
            path: "/wellness/routine"
        },
        {
            title: "Daily Journal",
            description: "Log your thoughts & memories.",
            icon: Book,
            color: "text-violet-500",
            bg: "bg-violet-50 hover:bg-violet-100",
            path: "/wellness/journal"
        },
        {
            title: "Sleep Tracker",
            description: "Monitor rest and recovery.",
            icon: Moon,
            color: "text-indigo-500",
            bg: "bg-indigo-50 hover:bg-indigo-100",
            path: "/wellness/sleep"
        },
        {
            title: "Hydration",
            description: "Track daily water intake.",
            icon: Droplets,
            color: "text-blue-500",
            bg: "bg-blue-50 hover:bg-blue-100",
            path: "/wellness/water"
        },
        {
            title: "Habit Builder",
            description: "Build consistent daily habits.",
            icon: CheckCircle2,
            color: "text-green-500",
            bg: "bg-green-50 hover:bg-green-100",
            path: "/wellness/habits"
        },
        {
            title: "Mindfulness",
            description: "Mood tracking & breathing.",
            icon: Smile,
            color: "text-rose-500",
            bg: "bg-rose-50 hover:bg-rose-100",
            path: "/wellness/mindfulness"
        }
    ];

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto pb-20">
            <header className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 text-transparent bg-clip-text">
                    Health & Wellness
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-2">
                    Your hub for physical and mental well-being.
                </p>
            </header>

            {/* Score Card (Always Visible Summary) */}
            <div className="mb-6 md:mb-8">
                <WellnessScoreCard />
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {features.map((feature) => (
                    <Card
                        key={feature.title}
                        className={`cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${feature.bg} border-none shadow-sm`}
                        onClick={() => navigate(feature.path)}
                    >
                        <CardContent className="p-5 md:p-6 flex flex-col h-full justify-between min-h-[160px] md:min-h-[180px]">
                            <div>
                                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4 ${feature.color}`}>
                                    <feature.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1">{feature.title}</h3>
                                <p className="text-slate-600 text-xs md:text-sm">{feature.description}</p>
                            </div>
                            <div className="mt-4 flex items-center text-xs md:text-sm font-semibold text-slate-900/60 group">
                                Open <ArrowRight className="w-3 h-3 md:w-4 md:h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
