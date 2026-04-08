import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  nome: string | null;
  visitor_id: string | null;
  tokens_akasha: number;
  nivel_evolucao: string;
  pontos_ojas: number;
  created_at: string;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  claimTest: (idPublico: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data as UserProfile);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const claimTest = async (idPublico: string): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase
      .from("doshas_registros2")
      .update({ user_id: user.id } as any)
      .eq("idPublico", idPublico)
      .is("user_id", null);

    return !error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  useEffect(() => {
    // Listen for auth changes FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          // Defer profile fetch to avoid deadlocks
          setTimeout(() => fetchProfile(newSession.user.id), 0);

          // Auto-claim: check localStorage for pending idPublico
          if (event === "SIGNED_IN") {
            const pendingId = localStorage.getItem("pendingClaimIdPublico");
            const visitorId = localStorage.getItem("visitorId");

            if (pendingId) {
              setTimeout(async () => {
                await claimTest(pendingId);
                localStorage.removeItem("pendingClaimIdPublico");
              }, 500);
            }

            // Update visitor_id on profile if available
            if (visitorId) {
              setTimeout(async () => {
                await supabase
                  .from("user_profiles")
                  .update({ visitor_id: visitorId } as any)
                  .eq("id", newSession.user.id);
              }, 500);
            }
          }
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);
        fetchProfile(existingSession.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, session, profile, loading, signOut, refreshProfile, claimTest }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
