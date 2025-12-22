
import { useState, useEffect } from "react";
import { WellnessScoreCard } from "@/components/dashboard/WellnessScoreCard";
import { ProductivityChart } from "@/components/dashboard/ProductivityChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Activity } from "lucide-react";

// Mock Data for MVP
const MOCK_PRODUCTIVITY_DATA = [
    { date: "Jan 1", focusHours: 4.5, taskCompletion: 75 },
    { date: "Jan 2", focusHours: 5.2, taskCompletion: 80 },
    { date: "Jan 3", focusHours: 4.8, taskCompletion: 78 },
    { date: "Jan 4", focusHours: 6.0, taskCompletion: 85 },
    { date: "Jan 5", focusHours: 5.5, taskCompletion: 82 },
    { date: "Jan 6", focusHours: 5.8, taskCompletion: 88 },
    { date: "Jan 7", focusHours: 6.2, taskCompletion: 90 },
];

export default function EmployerDashboard() {
    const [wellnessScore, setWellnessScore] = useState(78);
    const [activeEmployees, setActiveEmployees] = useState(124);

    // In a real implementation, we would fetch data from Supabase here
    // useEffect(() => { ... }, []);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Employer Dashboard</h2>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Anonymized View</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <WellnessScoreCard score={wellnessScore} trend={5.2} />

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeEmployees}</div>
                        <p className="text-xs text-muted-foreground">
                            +12 from last month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Productivity Index</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">8.4</div>
                        <p className="text-xs text-muted-foreground">
                            -0.2% from last week
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <ProductivityChart data={MOCK_PRODUCTIVITY_DATA} />

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity (Anonymized)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex items-center">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Employee #{1000 + i}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Completed daily wellness check-in
                                        </p>
                                    </div>
                                    <div className="ml-auto font-medium">Just now</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
