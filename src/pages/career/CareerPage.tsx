import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, BookOpen, GraduationCap, TrendingUp, Search, ExternalLink, PlayCircle, Plus, X, Newspaper } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

// Real Course Data (Dec 2025)
const COURSES = [
    {
        id: 1,
        title: "Google AI Essentials",
        provider: "Google (Coursera)",
        category: "AI & Tech",
        duration: "10 Hours",
        level: "Beginner",
        url: "https://www.coursera.org/learn/google-ai-essentials",
        image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 2,
        title: "CS50's Introduction to AI with Python",
        provider: "Harvard University (edX)",
        category: "Computer Science",
        duration: "7 Weeks",
        level: "Intermediate",
        url: "https://cs50.harvard.edu/ai/",
        image: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 3,
        title: "Generative AI for Beginners",
        provider: "Microsoft",
        category: "AI & Tech",
        duration: "12 Lessons",
        level: "Beginner",
        url: "https://microsoft.github.io/generative-ai-for-beginners/",
        image: "https://images.unsplash.com/photo-1678911820864-e2c567c65530?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 4,
        title: "Introduction to Large Language Models",
        provider: "Google Cloud Skills Boost",
        category: "AI & Tech",
        duration: "1 Day",
        level: "Intermediate",
        url: "https://www.cloudskillsboost.google/course_templates/539",
        image: "https://images.unsplash.com/photo-1692316682497-2007e260902c?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 5,
        title: "Digital Marketing Strategy",
        provider: "Google Digital Garage",
        category: "Marketing",
        duration: "40 Hours",
        level: "Beginner",
        url: "https://skillshop.exceedlms.com/student/collection/64838-digital-marketing",
        image: "https://images.unsplash.com/photo-1557838923-2985c318be48?auto=format&fit=crop&q=80&w=800"
    },
    {
        id: 6,
        title: "Financial Markets",
        provider: "Yale University",
        category: "Finance",
        duration: "33 Hours",
        level: "Beginner",
        url: "https://www.coursera.org/learn/financial-markets-global",
        image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800"
    }
];

interface NewsItem {
    title: string;
    summary: string;
    source: string;
    trend: 'up' | 'down' | 'neutral';
    url?: string;
}

const STATIC_NEWS: NewsItem[] = [
    {
        title: "Tech Jobs Recession vs. AI Boom",
        summary: "Traditional tech roles see a downturn, but AI specialized roles like AI Engineers and Product Managers are surging with 56% wage premiums.",
        source: "Industry Report 2025",
        trend: "down"
    },
    {
        title: "Rise of the AI Architect",
        summary: "Companies are prioritizing 'Quality over Quantity', seeking senior architects who can integrate GenAI into enterprise workflows.",
        source: "Forbes",
        trend: "up"
    },
    {
        title: "Skills over Degrees",
        summary: "Major tech firms are shifting to skills-based hiring, valuing certifications and portfolios over traditional 4-year degrees.",
        source: "LinkedIn",
        trend: "neutral"
    }
];

export default function CareerPage() {
    const { user, profile } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");
    const [skills, setSkills] = useState<string[]>([]);
    const [newSkill, setNewSkill] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [newsItems, setNewsItems] = useState<NewsItem[]>(STATIC_NEWS);

    // Fetch real news on load (Basic Implementation using a public RSS-to-JSON service as proxy for "Daily Updates")
    // In production, this should be a Supabase Edge Function to avoid CORS and rate limits.
    useEffect(() => {
        const fetchNews = async () => {
            try {
                // Fetch live news from TechCrunch via rss2json
                const res = await fetch('https://api.rss2json.com/v1/api.json?rss_url=https://techcrunch.com/feed/');
                const data = await res.json();

                if (data.status === 'ok' && data.items) {
                    const mappedNews: NewsItem[] = data.items.slice(0, 5).map((item: any) => ({
                        title: item.title,
                        summary: item.description ? item.description.replace(/<[^>]*>/g, '').slice(0, 150) + '...' : 'Latest tech update.',
                        source: 'TechCrunch',
                        trend: 'neutral',
                        url: item.link
                    }));
                    setNewsItems(mappedNews);
                } else {
                    setNewsItems(STATIC_NEWS);
                }
            } catch (e) {
                console.error("Failed to fetch daily news", e);
                setNewsItems(STATIC_NEWS);
            }
        };
        fetchNews();
    }, []);

    // Fetch skills on load
    useEffect(() => {
        if (profile?.skills) {
            // Check if skills is array or string
            if (Array.isArray(profile.skills)) {
                setSkills(profile.skills);
            } else if (typeof profile.skills === 'string') {
                // Try parsing if json string, else single item
                try { setSkills(JSON.parse(profile.skills)); } catch { setSkills([profile.skills]); }
            }
        }
    }, [profile]);

    const handleAddSkill = async () => {
        if (!newSkill.trim() || !user) return;

        try {
            setLoading(true);
            const updatedSkills = [...skills, newSkill.trim()];

            const { error } = await supabase
                .from('profiles')
                .update({ skills: updatedSkills })
                .eq('id', user.id);

            if (error) throw error;

            setSkills(updatedSkills);
            setNewSkill("");
            setIsDialogOpen(false);
            toast.success("Skill added successfully!");
        } catch (error) {
            console.error("Error updating skills:", error);
            toast.error("Failed to add skill");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveSkill = async (skillToRemove: string) => {
        if (!user) return;
        try {
            const updatedSkills = skills.filter(s => s !== skillToRemove);
            const { error } = await supabase
                .from('profiles')
                .update({ skills: updatedSkills })
                .eq('id', user.id);

            if (error) throw error;
            setSkills(updatedSkills);
            toast.success("Skill removed");
        } catch (error) {
            toast.error("Failed to remove skill");
        }
    };

    const filteredCourses = COURSES.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto min-h-screen pb-20">
            <header className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900">Career & Skills Growth 🚀</h1>
                <p className="text-muted-foreground">Unlock your potential with free courses and career insights.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Daily News Feed */}
                <Card className="md:col-span-2 border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Newspaper className="w-5 h-5 text-indigo-600" />
                            Daily Tech & AI Job Market News
                        </CardTitle>
                        <CardDescription>Latest trends from December 2025.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4">
                            {newsItems.map((news, i) => (
                                <div key={i} className="flex gap-4 items-start p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                    <div className={`p-2 rounded-full mt-1 ${news.trend === 'up' ? 'bg-green-100 text-green-600' :
                                        news.trend === 'down' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'
                                        }`}>
                                        <TrendingUp className={`w-4 h-4 ${news.trend === 'down' ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{news.title}</h4>
                                        <p className="text-sm text-slate-600 mt-1">{news.summary}</p>
                                        <p className="text-xs text-slate-400 mt-2 font-medium">{news.source}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Skill Stats */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-orange-500" />
                            My Skills
                        </CardTitle>
                        <CardDescription>Manage your professional profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {skills.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground text-sm">
                                No skills added yet. Start building your profile!
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {skills.map((skill, i) => (
                                    <Badge key={i} variant="secondary" className="px-3 py-1 gap-2 hover:bg-slate-200">
                                        {skill}
                                        <button onClick={() => handleRemoveSkill(skill)} className="hover:text-red-500">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        )}

                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" className="w-full gap-2 border-dashed">
                                    <Plus className="w-4 h-4" /> Add New Skill
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add a Skill</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                    <Input
                                        placeholder="e.g. Python, Public Speaking..."
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleAddSkill} disabled={loading}>{loading ? "Adding..." : "Add Skill"}</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </CardContent>
                </Card>
            </div>

            {/* Courses Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-indigo-600" />
                        Top Rated Free Courses (2025)
                    </h2>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Find courses..."
                            className="pl-9 bg-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => (
                        <Card key={course.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 group border-slate-200">
                            <div className="h-44 bg-slate-200 relative overflow-hidden">
                                <img
                                    src={course.image}
                                    alt={course.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <Badge className="absolute top-3 right-3 bg-white/90 text-slate-900 shadow-sm backdrop-blur-md">
                                    {course.level}
                                </Badge>
                                <Badge className="absolute bottom-3 left-3 bg-indigo-600 text-white border-none">
                                    Free Certificate
                                </Badge>
                            </div>
                            <CardHeader className="p-5 pb-2">
                                <div className="text-xs font-bold text-indigo-600 mb-1 uppercase tracking-wider">
                                    {course.category}
                                </div>
                                <CardTitle className="text-lg leading-tight group-hover:text-indigo-700 transition-colors line-clamp-2">
                                    {course.title}
                                </CardTitle>
                                <CardDescription className="font-medium text-slate-500">{course.provider}</CardDescription>
                            </CardHeader>
                            <CardContent className="p-5 pt-2 flex-1">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                        ⏱ {course.duration}
                                    </span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-5 pt-0">
                                <Button asChild className="w-full gap-2 bg-slate-900 hover:bg-indigo-600 text-white transition-colors">
                                    <a href={course.url} target="_blank" rel="noopener noreferrer">
                                        Start Learning <ExternalLink className="w-4 h-4" />
                                    </a>
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

        </div>
    );
}
