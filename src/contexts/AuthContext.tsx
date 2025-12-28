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
    total_points?: number;
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

        // Backup timeout to prevent infinite loading state
        const loadingTimeout = setTimeout(() => {
            if (mounted && loading) setLoading(false);
        }, 10000); // 10s generous timeout

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

        const initializeAuth = async () => {
            try {
                // 1. Get initial session
                const { data: { session: initialSession }, error } = await supabase.auth.getSession();

                // Only throw if it's a real error, not just "no session"
                if (error) {
                    console.error("Error getting session:", error);
                    // Don't sign out automatically here, just assume no user for now.
                    // Let onAuthStateChange handle the definitive state.
                }

                if (mounted && initialSession) {
                    setSession(initialSession);
                    setUser(initialSession.user);

                    // Fetch profile immediately if we have a session
                    if (initialSession.user) {
                        try {
                            const p = await fetchProfile(initialSession.user.id);
                            if (mounted) setProfile(p);
                        } catch (err) {
                            console.error("Profile fetch failed:", err);
                        }
                    }
                }
            } catch (err) {
                console.error("Auth initialization unexpected error:", err);
            } finally {
                if (mounted) {
                    // We don't verify loading=false here yet, we wait for the listener or just set it.
                    // Actually, getting session is enough to stop loading if we have mapped it.
                    // But onAuthStateChange will fire immediately after this usually.
                    // Let's rely on the listener to finalize 'loading' state if possible, 
                    // but we must ensure we unset loading if there is NO session.

                    // If we have no initial session, we might be done loading (viewer is guest).
                    // But let's verify with the listener.
                }
            }
        };

        initializeAuth();

        // 2. Set up auth state listener
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
            // console.log("Auth State Change:", event, currentSession?.user?.id);

            if (mounted) {
                setSession(currentSession);
                setUser(currentSession?.user ?? null);

                if (currentSession?.user) {
                    // Optimized: Only fetch profile if ID changed or we don't have it
                    // But to be safe for "refresh" button logic, we can fetch.
                    // We'll rely on the internal profile check inside fetchProfile or simple overwrite.
                    fetchProfile(currentSession.user.id).then(p => {
                        if (mounted) setProfile(p);
                    });
                } else {
                    setProfile(null);
                    // If we signed out, ensure we clear data
                    if (event === 'SIGNED_OUT') {
                        setUser(null);
                        setSession(null);
                        setProfile(null);
                    }
                }

                // This is the most reliable place to stop loading
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
