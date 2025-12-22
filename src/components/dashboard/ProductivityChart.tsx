import { Bar, BarChart, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const data = [
    { day: "Mon", focus: 4 },
    { day: "Tue", focus: 6 },
    { day: "Wed", focus: 3 },
    { day: "Thu", focus: 7 },
    { day: "Fri", focus: 5 },
    { day: "Sat", focus: 2 },
    { day: "Sun", focus: 4 },
];

export function ProductivityChart() {
    return (
        <div className="p-6 bg-slate-50 border border-slate-100 rounded-xl space-y-4">
            <h3 className="font-semibold text-slate-800">Weekly Focus</h3>
            <div className="h-[150px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }}
                            cursor={{ fill: "transparent" }}
                        />
                        <Bar dataKey="focus" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500">You're slightly below your average this week.</p>
        </div>
    );
}
