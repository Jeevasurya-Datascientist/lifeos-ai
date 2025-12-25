import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Profile {
    id: string;
    email: string;
    subscription_tier: 'free' | 'pro' | 'lifetime';
    razorpay_customer_id?: string;
    razorpay_subscription_id?: string;
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
    subscription_tier: 'free'
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
            await supabase.auth.signOut();
            setProfile(null);
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const p = await fetchProfile(user.id);
            setProfile(p);
        }
    };

    useEffect(() => {
        // Check for mock auth first
        if (localStorage.getItem("lifeos_mock_auth")) {
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
            return;
        }

        // Check active sessions and sets the user
        const initSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user) {
                    const p = await fetchProfile(session.user.id);
                    setProfile(p);
                }
            } catch (error) {
                console.error("Auth initialization error:", error);
            } finally {
                setLoading(false);
            }
        };
        initSession();

        // Listen for changes on auth state (logged in, signed out, etc.)
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                const p = await fetchProfile(session.user.id);
                setProfile(p);
            } else {
                setProfile(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, signOut, refreshProfile }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
