import { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signOut: () => Promise<void>;
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

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    const signOut = async () => {
        if (localStorage.getItem("lifeos_mock_auth")) {
            localStorage.removeItem("lifeos_mock_auth");
            setUser(null);
            setSession(null);
        } else {
            await supabase.auth.signOut();
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
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, session, loading, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
