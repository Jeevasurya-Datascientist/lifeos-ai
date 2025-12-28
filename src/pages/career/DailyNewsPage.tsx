import { useState, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Share2, ExternalLink, TrendingUp, Newspaper, ChevronRight, Clock, MapPin, Calendar, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsItem {
    id: string;
    title: string;
    summary: string;
    source: string;
    trend: 'up' | 'down' | 'neutral';
    url?: string;
    date?: string;
    time?: string;
    location?: string;
    image?: string;
    timestamp: number; // For sorting
}

// Fallback images if extraction completely fails
const FALLBACK_IMAGES = [
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800"
];

const STATIC_NEWS: NewsItem[] = [
    {
        id: "static-1",
        title: "Tech Jobs Recession vs. AI Boom",
        summary: "Traditional tech roles see a downturn, but AI specialized roles like AI Engineers and Product Managers are surging with 56% wage premiums.",
        source: "Industry Report 2025",
        trend: "down",
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&q=80&w=800",
        date: "Dec 28, 2025",
        time: "09:00 AM",
        location: "Silicon Valley, USA",
        timestamp: Date.now()
    }
];

// RSS Feed URLs - Expanded for massive variety
const FEEDS = [
    // Tech & AI
    { url: 'https://techcrunch.com/feed/', name: 'TechCrunch' },
    { url: 'https://www.theverge.com/rss/index.xml', name: 'The Verge' },
    { url: 'https://www.wired.com/feed/category/tech/latest/rss', name: 'Wired' },
    { url: 'https://venturebeat.com/feed/', name: 'VentureBeat' },
    { url: 'https://www.artificialintelligence-news.com/feed/', name: 'AI News' },
    { url: 'https://readwrite.com/feed/', name: 'ReadWrite' },

    // Career & Business
    { url: 'https://www.fastcompany.com/work-life/rss', name: 'FastCompany' },
    { url: 'https://feeds.feedburner.com/Entrepreneur-latest', name: 'Entrepreneur' },
    { url: 'https://www.businessinsider.com/rss', name: 'Business Insider' },

    // Skills & Dev
    { url: 'https://dev.to/feed', name: 'Dev.to' },
    { url: 'https://www.smashingmagazine.com/feed', name: 'Smashing Mag' },
    { url: 'https://www.freecodecamp.org/news/rss/', name: 'FreeCodeCamp' },
    { url: 'https://hackernoon.com/feed', name: 'HackerNoon' },
    { url: 'https://stackoverflow.blog/feed/', name: 'Stack Overflow' },

    // Science & Future
    { url: 'https://www.sciencealert.com/feed', name: 'ScienceAlert' },
    { url: 'https://futurism.com/feed', name: 'Futurism' }
];

// Fisher-Yates Shuffle to mix sources
const shuffleArray = (array: NewsItem[]) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

export default function DailyNewsPage() {
    const navigate = useNavigate();
    const [newsItems, setNewsItems] = useState<NewsItem[]>(STATIC_NEWS);
    const [emblaRef] = useEmblaCarousel({ loop: false, align: 'center' });
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const extractImage = (item: Element): string => {
        // 1. Try media:content or enclosure
        const mediaContent = item.getElementsByTagNameNS("*", "content");
        if (mediaContent.length > 0) {
            for (let i = 0; i < mediaContent.length; i++) {
                const url = mediaContent[i].getAttribute("url");
                if (url && url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return url;
            }
        }

        const enclosure = item.querySelector("enclosure");
        if (enclosure) {
            const url = enclosure.getAttribute("url");
            if (url) return url;
        }

        // 2. Try parsing description/content:encoded for <img>
        const description = item.querySelector("description")?.textContent || "";
        const contentEncoded = item.getElementsByTagNameNS("*", "encoded")[0]?.textContent || "";
        const htmlContent = description + contentEncoded;

        const imgMatch = htmlContent.match(/<img[^>]+src="([^">]+)"/);
        if (imgMatch && imgMatch[1]) return imgMatch[1];

        // 3. Fallback
        return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
    };

    const fetchRSS = async (feedUrl: string, sourceName: string): Promise<NewsItem[]> => {
        const fetchWithProxy = async (proxyUrl: string) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000); // Reduced to 3s for speed
            try {
                const res = await fetch(proxyUrl, { signal: controller.signal });
                clearTimeout(id);
                if (!res.ok) throw new Error(`Status ${res.status}`);
                return await res.text();
            } catch (e) {
                clearTimeout(id);
                throw e;
            }
        };

        try {
            let text = "";
            try {
                // Proxy 1: AllOrigins (Often heavily cached but stable)
                text = await fetchWithProxy(`https://api.allorigins.win/raw?url=${encodeURIComponent(feedUrl)}`);
            } catch (err1) {
                try {
                    // Proxy 2: CodeTabs (Good alternative)
                    // console.warn(`Proxy 1 failed for ${sourceName}, trying backup...`);
                    text = await fetchWithProxy(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(feedUrl)}`);
                } catch (err2) {
                    // Proxy 3: CORSProxy.io (Fast, direct)
                    // console.warn(`Proxy 2 failed for ${sourceName}, trying final backup...`);
                    text = await fetchWithProxy(`https://corsproxy.io/?${encodeURIComponent(feedUrl)}`);
                }
            }

            const parser = new DOMParser();
            const xml = parser.parseFromString(text, "text/xml");

            const items = xml.querySelectorAll("item");
            if (items.length === 0) throw new Error("No items found");

            return Array.from(items).slice(0, 20).map((item) => {
                const title = item.querySelector("title")?.textContent || "No Title";
                const link = item.querySelector("link")?.textContent || "";

                // Handle various date formats
                const pubDateStr = item.querySelector("pubDate")?.textContent ||
                    item.querySelector("dc\\:date")?.textContent || "";
                const pubDate = pubDateStr ? new Date(pubDateStr) : new Date();

                const description = item.querySelector("description")?.textContent || "";
                // Strip HTML from description for summary
                const summary = description.replace(/<[^>]+>/g, '').slice(0, 140) + '...';

                return {
                    id: link || Math.random().toString(36),
                    title: title,
                    summary: summary,
                    source: sourceName,
                    trend: 'neutral',
                    url: link,
                    date: pubDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                    time: pubDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
                    location: "Global / Online",
                    image: extractImage(item),
                    timestamp: pubDate.getTime()
                };
            });
        } catch (e) {
            // console.warn(`Failed to fetch ${sourceName}`); // keep log clean
            return [];
        }
    };

    const fetchAllNews = async () => {
        // Only blocking load if we have no news (first load)
        if (newsItems.length === 0) setLoading(true);
        else setIsRefreshing(true);

        try {
            const promises = FEEDS.map(feed => fetchRSS(feed.url, feed.name));
            const results = await Promise.all(promises);

            // Flatten and Sort
            let allNews = results.flat();

            // Deduplicate by URL or Title
            const seen = new Set();
            const uniqueNews = allNews.filter(item => {
                const isDuplicate = seen.has(item.title) || seen.has(item.url);
                seen.add(item.title);
                seen.add(item.url);
                return !isDuplicate;
            });

            if (uniqueNews.length > 0) {
                // Mix them up so we don't just see 10 TechCrunch articles in a row
                const mixedNews = shuffleArray(uniqueNews);
                setNewsItems(mixedNews.slice(0, 300)); // Huge limit: 300 items
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Error aggregating news", error);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // Initial Fetch & Interval
    useEffect(() => {
        fetchAllNews();
        // With 15+ feeds, polling every 10s is too aggressive and might get blocked. 
        // 60s is safer and still very fresh.
        const intervalId = setInterval(fetchAllNews, 60000);
        return () => clearInterval(intervalId);
    }, []);

    const handleShare = async (news: NewsItem) => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: news.title,
                    text: news.summary,
                    url: news.url || window.location.href,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        }
    };

    const { t } = useLanguage();

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden text-slate-100 font-sans selection:bg-indigo-500/30">
            {/* Reduced Glare: Warmer/Darker Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-950/40 to-transparent pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 z-20 sticky top-0 bg-slate-950/80 backdrop-blur-md">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full bg-slate-800/50 hover:bg-slate-700 text-white border border-white/10">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
                        <Newspaper className="w-5 h-5 text-indigo-400" />
                        <span className="bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">{t("daily_pulse") || "Daily Pulse"}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/50 backdrop-blur-sm">
                        {isRefreshing ? (
                            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                        ) : (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                        <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">
                            {isRefreshing ? "Updating..." : `Updated: ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                        </span>
                    </div>
                </div>
                <div className="w-10" />
            </header>

            {/* Carousel Content */}
            <div className="flex-1 flex flex-col justify-center overflow-hidden pb-8">
                {loading && newsItems.length === 1 ? (
                    <div className="flex justify-center items-center h-full text-indigo-300 animate-pulse">
                        Fetching latest headlines...
                    </div>
                ) : (
                    <div className="embla overflow-hidden h-full" ref={emblaRef}>
                        <div className="embla__container flex touch-pan-y pl-4 h-full items-center">
                            {newsItems.map((news, index) => (
                                <div className="embla__slide flex-[0_0_85%] md:flex-[0_0_400px] min-w-0 px-3 h-[70vh] md:h-[600px]" key={`${news.id}-${index}`}>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        className="h-full relative rounded-[32px] overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 group"
                                    >
                                        {/* Image Section */}
                                        <div className="h-[55%] w-full relative overflow-hidden">
                                            <div className="absolute inset-0 bg-slate-800 animate-pulse" /> {/* Placeholder */}
                                            <img
                                                src={news.image}
                                                alt={news.title}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                                                loading="lazy"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0];
                                                }}
                                            />
                                            {/* Improved Gradient Overlay for Text Readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

                                            <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md text-white text-[10px] px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest font-bold shadow-lg">
                                                {news.source}
                                            </div>

                                            {/* Date/Time badge over image */}
                                            <div className="absolute bottom-4 left-4 flex gap-2">
                                                <div className="bg-black/40 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5 font-medium">
                                                    <Calendar className="w-3 h-3 text-indigo-400" /> {news.date}
                                                </div>
                                                <div className="bg-black/40 backdrop-blur-md text-slate-200 text-[10px] px-2.5 py-1 rounded-lg border border-white/5 flex items-center gap-1.5 font-medium">
                                                    <Clock className="w-3 h-3 text-indigo-400" /> {news.time}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="h-[45%] p-5 flex flex-col justify-between relative bg-slate-900 overflow-hidden">

                                            <div
                                                className="space-y-2 cursor-pointer group/text"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (news.url) window.open(news.url, '_blank', 'noopener,noreferrer');
                                                }}
                                            >
                                                <h2 className="text-lg md:text-xl font-bold leading-snug text-slate-50 line-clamp-3 font-display group-hover/text:text-indigo-400 transition-colors">
                                                    {news.title}
                                                    <ExternalLink className="w-3.5 h-3.5 inline ml-2 opacity-0 -translate-x-2 group-hover/text:opacity-100 group-hover/text:translate-x-0 transition-all text-indigo-400" />
                                                </h2>

                                                <p className="text-slate-400 text-xs md:text-sm leading-relaxed line-clamp-3 font-light group-hover/text:text-slate-300 transition-colors">
                                                    {news.summary}
                                                </p>
                                                <span className="text-[10px] md:text-xs text-indigo-400 font-medium opacity-0 group-hover/text:opacity-100 transition-opacity block pt-1">
                                                    {t("read_full_story") || "Read Full Story"} &rarr;
                                                </span>
                                            </div>

                                            <div className="space-y-3 mt-auto pt-2">
                                                <div className="h-px w-full bg-slate-800" />
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-slate-500">
                                                        <Globe className="w-3 h-3" /> {news.location}
                                                    </div>
                                                    <Button size="icon" variant="ghost" onClick={() => handleShare(news)} className="hover:bg-slate-800 hover:text-white text-slate-400 rounded-full h-8 w-8">
                                                        <Share2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            ))}

                            {/* Refresh Card */}
                            <div className="embla__slide flex-[0_0_85%] md:flex-[0_0_400px] px-3 h-[70vh] md:h-[600px] flex items-center justify-center">
                                <div className="text-center space-y-6 p-8 bg-slate-900/50 rounded-[32px] border border-slate-800">
                                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto animate-bounce">
                                        <TrendingUp className="w-8 h-8 text-indigo-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-white">All caught up!</h3>
                                        <p className="text-slate-400">We'll have fresh stories in a moment.</p>
                                    </div>
                                    <Button onClick={() => navigate(-1)} variant="outline" className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full rounded-xl py-6">
                                        Back to Career <ArrowLeft className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <p className="text-center text-[10px] text-slate-600 pb-8 uppercase tracking-[0.2em] font-medium">Swipe for next story</p>
        </div>
    );
}
