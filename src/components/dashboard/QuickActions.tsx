import { Button } from "@/components/ui/button";
import { Zap, Receipt, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { useNavigate } from "react-router-dom";

export function QuickActions() {
    const navigate = useNavigate();
    return (
        <div className="grid grid-cols-3 gap-4">
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2"
                onClick={() => navigate("/recharge")}
            >
                <Zap className="h-6 w-6 text-yellow-500" />
                <span className="text-xs">Recharge</span>
            </Button>
            <Button
                variant="outline"
                className="flex flex-col items-center h-auto py-4 space-y-2"
                onClick={() => navigate("/recharge")}
            >
                <Receipt className="h-6 w-6 text-blue-500" />
                <span className="text-xs">Pay Bills</span>
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
