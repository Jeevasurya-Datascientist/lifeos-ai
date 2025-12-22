import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
    LayoutDashboard,
    CreditCard,
    LineChart,
    Activity,
    Zap,
    Bot,
    Menu,
    Settings,
    LogOut,
    Wallet
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate("/login");
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Home", path: "/" },
        { icon: CreditCard, label: "Transactions", path: "/transactions" },
        { icon: Wallet, label: "Services & Bills", path: "/recharge" },
        { icon: LineChart, label: "Analytics", path: "/analytics" },
        { icon: Activity, label: "Wellness", path: "/wellness" },
        { icon: Bot, label: "Ask LifeOS", path: "/ask-ai" },
        { icon: Zap, label: "Subscription", path: "/subscription" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 text-transparent bg-clip-text">
                    LifeOS AI
                </h1>
                <p className="text-xs text-slate-400 mt-1">v1.2.0</p>
            </div>

            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "text-slate-300 hover:bg-slate-800 hover:text-white"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-2">
                <Link to="/profile" onClick={() => setOpen(false)}>
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white cursor-pointer transition-colors">
                        <Settings className="w-5 h-5" />
                        <span className="font-medium">{t('profile') || "Settings"}</span>
                    </div>
                </Link>
                <div onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 cursor-pointer transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">{t('logout') || "Logout"}</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen w-screen overflow-hidden bg-slate-50 flex flex-col md:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col h-full bg-slate-900 border-r border-slate-800 z-50">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <header className="md:hidden flex-none h-16 bg-white border-b z-40 flex items-center px-4 justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 border-r-0">
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>
                    <span className="font-bold text-lg text-slate-900">LifeOS AI</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                        {user?.phone?.slice(-2) || "U"}
                    </div>
                </Button>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden bg-slate-50 relative scrolling-touch">
                <div className="min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
