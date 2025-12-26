import { Button } from "@/components/ui/button";
import { MessageCircle, CreditCard, LineChart } from "lucide-react";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

export function QuickActions() {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-3 gap-4">
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2"
                onClick={() => navigate("/transactions")}
            >
                <CreditCard className="h-6 w-6 text-purple-500" />
                <span className="text-xs">Add Expense</span>
            </Button>
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2"
                onClick={() => navigate("/analytics")}
            >
                <LineChart className="h-6 w-6 text-blue-500" />
                <span className="text-xs">Analytics</span>
            </Button>
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2"
                onClick={() => navigate("/ask-ai")}
            >
                <MessageCircle className="h-6 w-6 text-green-500" />
                <span className="text-xs">Ask LifeOS</span>
            </Button>
        </div>
    );
}
