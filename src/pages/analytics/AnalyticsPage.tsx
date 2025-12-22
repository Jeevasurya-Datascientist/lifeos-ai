import { ProductivityChart } from "@/components/dashboard/ProductivityChart";
import { SmartInsights } from "@/components/dashboard/SmartInsights";
import { SleepSpendChart } from "@/components/dashboard/SleepSpendChart";
import { FocusHeatmap } from "@/components/dashboard/FocusHeatmap";

export default function AnalyticsPage() {
    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <header className="bg-white p-6 rounded-xl border shadow-sm mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">Analytics & Insights</h1>
                <p className="text-muted-foreground">AI-driven analysis of your life patterns.</p>
            </header>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Financial Intelligence</h2>
                    <SmartInsights />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Productivity Trends</h2>
                    <ProductivityChart />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Correlation Analysis</h2>
                    <SleepSpendChart />
                </div>
                <div>
                    <h2 className="text-xl font-semibold mb-4">Focus Intensity</h2>
                    <FocusHeatmap />
                </div>
            </div>
        </div>
    );
}
