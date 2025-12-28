import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Profile {
    id: string;
    email: string;
    avatar_url?: string | null;
    subscription_tier: 'free' | 'pro' | 'lifetime';
    razorpay_customer_id?: string;
    razorpay_subscription_id?: string;
    skills?: string[] | null;
    points?: number;
}

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const MOCK_USER: User = {
    id: "11111111-1111-4111-8111-111111111111", // Valid UUID v4-ish
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
    phone: "+919999999999",
    role: "authenticated",
    updated_at: new Date().toISOString(),
};

const MOCK_PROFILE: Profile = {
    id: "11111111-1111-4111-8111-111111111111",
    email: "demo@lifeos.ai",
    subscription_tier: 'free',
    skills: [],
    points: 0
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    signOut: async () => { },
    refreshProfile: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return null;
            }
            return data as Profile;
        } catch (error) {
            console.error('Error in fetchProfile:', error);
            return null;
        }
    };

    const signOut = async () => {
        if (localStorage.getItem("lifeos_mock_auth")) {
            localStorage.removeItem("lifeos_mock_auth");
            setUser(null);
            setSession(null);
            setProfile(null);
        } else {
            try {
                await supabase.auth.signOut();
            } catch (error) {
                console.error("Error signing out:", error);
            } finally {
                // Always clear local state
                setUser(null);
                setSession(null);
                setProfile(null);
                setLoading(false);
            }
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const p = await fetchProfile(user.id);
            setProfile(p);
        }
    };

    useEffect(() => {
        let mounted = true;

        // Backup timeout to prevent infinite loading
        const loadingTimeout = setTimeout(() => {
            if (mounted) setLoading(false);
        }, 2500);

        // Check for mock auth first
        if (localStorage.getItem("lifeos_mock_auth")) {
            if (mounted) {
                setUser(MOCK_USER);
                setSession({
                    user: MOCK_USER,
                    access_token: "mock-token",
                    refresh_token: "mock-refresh-token",
                    token_type: "bearer",
                    expires_in: 3600,
                    expires_at: Math.floor(Date.now() / 1000) + 3600,
                });
                setProfile(MOCK_PROFILE);
                setLoading(false);
                clearTimeout(loadingTimeout);
            }
            return;
        }

        const initAuth = async () => {
            try {
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (mounted) {
                    setSession(session);
                    setUser(session?.user ?? null);

                    if (session?.user) {
                        try {
                            const p = await fetchProfile(session.user.id);
                            if (mounted) setProfile(p);
                        } catch (err) {
                            console.error("Profile fetch failed:", err);
                        }
                    }
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
                // If the refresh token is invalid, force a sign out to clear stale data
                if (error instanceof Error && (error.message.includes("Invalid Refresh Token") || error.message.includes("Refresh Token Not Found"))) {
                    console.warn("Detected invalid refresh token, clearing session.");
                    await supabase.auth.signOut();
                    // Fallback: Clear all Supabase tokens from local storage
                    Object.keys(localStorage).forEach(key => {
                        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
                            localStorage.removeItem(key);
                        }
                    });
                }
            } finally {
                if (mounted) {
                    setLoading(false);
                    clearTimeout(loadingTimeout);
                }
            }
        };

        initAuth();

        // Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // We don't await this to block UI updates for auth state change? 
                    // Actually better to show generic UI then pop in profile data if slow.
                    // But for consistent auth state, we might want to wait. 
                    // For now, let's fetch.
                    fetchProfile(session.user.id).then(p => {
                        if (mounted) setProfile(p);
                    });
                } else {
                    setProfile(null);
                }
                setLoading(false);
                clearTimeout(loadingTimeout);
            }
        });

        return () => {
            mounted = false;
            clearTimeout(loadingTimeout);
            subscription.unsubscribe();
        };
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
