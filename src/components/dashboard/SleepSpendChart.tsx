import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const data = [
    { day: "Mon", spend: 1200, sleep: 7.5 },
    { day: "Tue", spend: 850, sleep: 8.0 },
    { day: "Wed", spend: 2100, sleep: 5.5 },
    { day: "Thu", spend: 450, sleep: 7.0 },
    { day: "Fri", spend: 3200, sleep: 6.0 },
    { day: "Sat", spend: 4500, sleep: 5.0 },
    { day: "Sun", spend: 900, sleep: 9.0 },
];

export function SleepSpendChart() {
    return (
        <div className="p-6 bg-white border rounded-xl shadow-sm space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-semibold text-slate-800">Sleep vs. Spending</h3>
                <span className="text-xs text-muted-foreground px-2 py-1 bg-slate-100 rounded-md">Last 7 Days</span>
            </div>
            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tickMargin={10} />
                        <YAxis yAxisId="left" orientation="left" stroke="#6366f1" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                        <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}h`} domain={[4, 10]} />
                        <Tooltip
                            contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", fontSize: "12px" }}
                            itemStyle={{ padding: 0 }}
                        />
                        <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                        <Bar yAxisId="left" dataKey="spend" name="Spending (₹)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} fillOpacity={0.8} />
                        <Line yAxisId="right" type="monotone" dataKey="sleep" name="Sleep (h)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#fff", strokeWidth: 2 }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <p className="text-xs text-center text-slate-500">
                Analysis: High spending days often correlate with less sleep (<span className="font-medium text-red-500">-15% sleep correlation</span>).
            </p>
        </div>
    );
}
