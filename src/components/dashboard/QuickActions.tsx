import { Button } from "@/components/ui/button";
import { MessageCircle, CreditCard, LineChart, StickyNote } from "lucide-react";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

export function QuickActions() {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-2 gap-4">
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2 hover:bg-slate-50 border-slate-200"
                onClick={() => navigate("/transactions")}
            >
                <CreditCard className="h-6 w-6 text-purple-500" />
                <span className="text-xs font-medium text-slate-600">Add Expense</span>
            </Button>
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2 hover:bg-slate-50 border-slate-200"
                onClick={() => navigate("/analytics")}
            >
                <LineChart className="h-6 w-6 text-blue-500" />
                <span className="text-xs font-medium text-slate-600">Analytics</span>
            </Button>
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2 hover:bg-slate-50 border-slate-200"
                onClick={() => navigate("/notes")}
            >
                <StickyNote className="h-6 w-6 text-yellow-500" />
                <span className="text-xs font-medium text-slate-600">Sticky Notes</span>
            </Button>
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2 hover:bg-slate-50 border-slate-200"
                onClick={() => navigate("/ask-ai")}
            >
                <MessageCircle className="h-6 w-6 text-green-500" />
                <span className="text-xs font-medium text-slate-600">Ask LifeOS</span>
            </Button>
        </div>
    );
}
