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
  is_premium: boolean | null;
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
  role: UserRole;
  loading: boolean;
  roleLoading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  claimTest: (idPublico?: string | null) => Promise<boolean>;
  setDoshaResultFromId: (idPublico: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [doshaResult, setDoshaResult] = useState<DoshaResult | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);

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

  const fetchRole = async (userId: string) => {
    // Só ativa loading na primeira busca (quando ainda não temos role).
    // Em revalidações (TOKEN_REFRESHED, foco da aba), mantemos o role
    // anterior visível para evitar remount das páginas admin.
    setRole((prev) => {
      if (prev === null) setRoleLoading(true);
      return prev;
    });

    const { data, error } = await supabase
      .from("perfis")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (!error && data) {
      setRole((data.role as UserRole) ?? 'user');
    } else {
      if (error) {
        console.error("[UserContext] Erro ao buscar role do usuário", error);
      }

      setRole('user');
    }

    setRoleLoading(false);
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

  const claimTest = async (idPublico?: string | null): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc(
        "claim_dosha_test",
        idPublico ? { p_id_publico: idPublico } : {}
      );
      if (error) {
        console.error("[UserContext] claim_dosha_test erro:", error);
        return false;
      }
      return (data as any)?.ok === true;
    } catch (e) {
      console.error("[UserContext] claim_dosha_test exceção:", e);
      return false;
    }
  };

  const signOut = async () => {
    // Clear local state BEFORE auth signOut so the onAuthStateChange listener
    // doesn't re-hydrate doshaResult from localStorage and re-trigger the
    // index → /meu-dosha auto-redirect.
    localStorage.removeItem("activeDoshaId");
    setUser(null);
    setSession(null);
    setProfile(null);
    setDoshaResult(null);
    setRole(null);
    // scope: 'local' → desloga apenas neste dispositivo/navegador.
    // Sem isso, o signOut é global e invalida o refresh token de TODOS os
    // dispositivos do usuário, causando logouts inesperados em outras sessões.
    await supabase.auth.signOut({ scope: 'local' });
  };

  useEffect(() => {
    let isMounted = true;

    // Hidrata dados secundários (perfil/role/dosha) de forma assíncrona,
    // SEM bloquear o callback do onAuthStateChange. Bloquear o callback com
    // await causa deadlock com o lock interno do GoTrue durante refresh.
    const hydrateAuthenticatedUser = (currentUser: User) => {
      void fetchProfile(currentUser.id);
      void fetchRole(currentUser.id);
      if (currentUser.email) {
        void fetchDoshaByEmail(currentUser.email);
      }
    };

    // Fonte ÚNICA de verdade de sessão: onAuthStateChange.
    // O SDK dispara INITIAL_SESSION na inscrição com a sessão já hidratada
    // do storage, então NÃO chamamos getSession() em paralelo (isso causava
    // race condition e flash de "deslogado").
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        hydrateAuthenticatedUser(newSession.user);

        if (event === "SIGNED_IN") {
          const pendingId = localStorage.getItem("pendingClaimIdPublico");
          const urlId = new URLSearchParams(window.location.search).get("id");
          const activeId = localStorage.getItem("activeDoshaId");
          const idToClaim = pendingId || urlId || activeId || null;
          const visitorId = localStorage.getItem("visitorId");

          setTimeout(async () => {
            await claimTest(idToClaim);
            if (pendingId) localStorage.removeItem("pendingClaimIdPublico");
          }, 500);

          if (visitorId) {
            setTimeout(async () => {
              await supabase
                .from("user_profiles")
                .update({ visitor_id: visitorId } as any)
                .eq("id", newSession.user.id);
            }, 500);
          }
        }
      } else if (event === "INITIAL_SESSION" || event === "SIGNED_OUT") {
        // Só limpa estado dependente de login quando temos certeza de que
        // não há sessão (sessão inicial resolvida sem usuário, ou signOut
        // explícito). Evita falso "deslogado" durante eventos intermediários.
        setProfile(null);
        setRole(null);
        setRoleLoading(false);
        localStorage.removeItem("activeDoshaId");
        setDoshaResult(null);
      }

      // loading só vira false quando o SDK confirmou a sessão inicial.
      if (event === "INITIAL_SESSION") {
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider
      value={{ user, session, profile, doshaResult, role, loading, roleLoading, signOut, refreshProfile, claimTest, setDoshaResultFromId }}
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
