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

type UserRole = 'admin' | 'user' | null;

export interface DoshaResult {
  idPublico: string;
  nome: string | null;
  doshaprincipal: string | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
}

interface UserContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  doshaResult: DoshaResult | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  claimTest: (idPublico: string) => Promise<boolean>;
  setDoshaResultFromId: (idPublico: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [doshaResult, setDoshaResult] = useState<DoshaResult | null>(null);
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

  const fetchDoshaByEmail = async (email: string) => {
    const { data, error } = await supabase
      .from("doshas_registros")
      .select("idPublico, nome, doshaprincipal, vatascore, pittascore, kaphascore")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!error && data && data.idPublico) {
      const result: DoshaResult = {
        idPublico: data.idPublico,
        nome: data.nome,
        doshaprincipal: data.doshaprincipal,
        vatascore: data.vatascore,
        pittascore: data.pittascore,
        kaphascore: data.kaphascore,
      };
      setDoshaResult(result);
      localStorage.setItem("activeDoshaId", data.idPublico);
    }
  };

  const setDoshaResultFromId = async (idPublico: string) => {
    const { data, error } = await supabase
      .from("doshas_registros")
      .select("idPublico, nome, doshaprincipal, vatascore, pittascore, kaphascore")
      .eq("idPublico", idPublico)
      .limit(1)
      .single();

    if (!error && data && data.idPublico) {
      setDoshaResult({
        idPublico: data.idPublico,
        nome: data.nome,
        doshaprincipal: data.doshaprincipal,
        vatascore: data.vatascore,
        pittascore: data.pittascore,
        kaphascore: data.kaphascore,
      });
      localStorage.setItem("activeDoshaId", data.idPublico);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const claimTest = async (_idPublico: string): Promise<boolean> => {
    // doshas_registros doesn't have user_id column; claim is a no-op
    return true;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setDoshaResult(null);
    localStorage.removeItem("activeDoshaId");
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          setTimeout(() => fetchProfile(newSession.user.id), 0);

          if (newSession.user.email) {
            setTimeout(() => fetchDoshaByEmail(newSession.user.email!), 0);
          }

          if (event === "SIGNED_IN") {
            const pendingId = localStorage.getItem("pendingClaimIdPublico");
            const visitorId = localStorage.getItem("visitorId");

            if (pendingId) {
              setTimeout(async () => {
                await claimTest(pendingId);
                localStorage.removeItem("pendingClaimIdPublico");
              }, 500);
            }

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
          // Keep doshaResult from localStorage if exists
        }

        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      if (existingSession) {
        setSession(existingSession);
        setUser(existingSession.user);
        fetchProfile(existingSession.user.id);
        if (existingSession.user.email) {
          fetchDoshaByEmail(existingSession.user.email);
        }
      } else {
        // No auth session — try loading from localStorage
        const storedId = localStorage.getItem("activeDoshaId");
        if (storedId) {
          setDoshaResultFromId(storedId);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, session, profile, doshaResult, loading, signOut, refreshProfile, claimTest, setDoshaResultFromId }}
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
