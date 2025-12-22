import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function FocusHeatmap() {
    // Generate mock data for the last 28 days
    const focusData = Array.from({ length: 28 }, (_, i) => ({
        day: i + 1,
        hours: Math.floor(Math.random() * 8) + 1, // Random focus hours 1-9
    }));

    const getIntensityColor = (hours: number) => {
        if (hours >= 7) return "bg-indigo-600";
        if (hours >= 5) return "bg-indigo-500";
        if (hours >= 3) return "bg-indigo-300";
        return "bg-indigo-100";
    };

    return (
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Monthly Focus Heatmap</h3>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 rounded-md">Last 4 Weeks</span>
            </div>

            <div className="grid grid-cols-7 gap-2">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                    <div key={i} className="text-center text-xs text-muted-foreground font-medium mb-1">
                        {d}
                    </div>
                ))}

                {focusData.map((d, i) => (
                    <TooltipProvider key={i}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div
                                    className={`aspect-square rounded-md ${getIntensityColor(d.hours)} hover:opacity-80 transition-opacity cursor-pointer`}
                                />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="text-xs font-medium">{d.hours} hrs focus</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ))}
            </div>

            <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
                <span>Less</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded bg-indigo-100"></div>
                    <div className="w-3 h-3 rounded bg-indigo-300"></div>
                    <div className="w-3 h-3 rounded bg-indigo-500"></div>
                    <div className="w-3 h-3 rounded bg-indigo-600"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
}
