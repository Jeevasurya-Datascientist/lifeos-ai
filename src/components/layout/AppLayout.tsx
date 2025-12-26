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
    Wallet,
    BrainCircuit,
    CalendarCheck
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, signOut, profile } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
    };

    const menuItems = [
        { icon: LayoutDashboard, label: "Home", path: "/" },
        { icon: CreditCard, label: "Transactions", path: "/transactions" },
        { icon: Wallet, label: "Services & Bills", path: "/recharge" },
        { icon: LineChart, label: "Analytics", path: "/analytics" },
        { icon: Activity, label: "Wellness", path: "/wellness" },
        { icon: BrainCircuit, label: "Brain Gym", path: "/brain-training" },
        { icon: Bot, label: "Ask LifeOS", path: "/ask-ai" },
        { icon: Zap, label: "Subscription", path: "/subscription" },
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-950 text-white relative">
            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            <div className="p-6 relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            LifeOS AI
                        </h1>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Pro Edition</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-3 space-y-6 overflow-y-auto relative z-10 scrollbar-none">
                <div className="space-y-1">
                    <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Main</h3>
                    {[
                        { icon: LayoutDashboard, label: "Dashboard", path: "/" },
                        { icon: Bot, label: "Ask LifeOS", path: "/ask-ai" },
                        { icon: CalendarCheck, label: "Calendar", path: "/calendar" }, // Assuming this exists or will exist, mostly strictly following existing but grouping
                    ].filter(i => i.path !== "/calendar").map((item) => ( // Filter out Calendar if not exists, but keep structure
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                ? "bg-indigo-600 shadow-lg shadow-indigo-900/20 text-white"
                                : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-indigo-400"}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="space-y-1">
                    <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Finance</h3>
                    {[
                        { icon: CreditCard, label: "Transactions", path: "/transactions" },
                        { icon: Wallet, label: "Services & Bills", path: "/recharge" },
                        { icon: LineChart, label: "Analytics", path: "/analytics" },
                        { icon: Zap, label: "Subscription", path: "/subscription" },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                ? "bg-indigo-600 shadow-lg shadow-indigo-900/20 text-white"
                                : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-cyan-400"}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </div>

                <div className="space-y-1">
                    <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Health & Mind</h3>
                    {[
                        { icon: Activity, label: "Wellness", path: "/wellness" },
                        { icon: BrainCircuit, label: "Brain Gym", path: "/brain-training" },
                    ].map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${location.pathname === item.path
                                ? "bg-indigo-600 shadow-lg shadow-indigo-900/20 text-white"
                                : "text-slate-400 hover:bg-slate-900/50 hover:text-white"
                                }`}
                        >
                            <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-emerald-400"}`} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </nav>

            {/* Profile Section */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/50 mt-auto relative z-10">
                <div onClick={() => { navigate("/profile"); setOpen(false) }} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer group">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-slate-900 group-hover:border-indigo-500/50 transition-colors overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.email?.charAt(0).toUpperCase() || "U"
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{user?.email?.split('@')[0] || "User"}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email || "Guest"}</p>
                    </div>
                    <Settings className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
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
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold overflow-hidden">
                        {profile?.avatar_url ? (
                            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            user?.phone?.slice(-2) || "U"
                        )}
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
