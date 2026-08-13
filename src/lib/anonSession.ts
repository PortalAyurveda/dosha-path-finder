import { supabase } from "@/integrations/supabase/client";

/**
 * Cria uma sessão anônima do Supabase caso ainda não exista nenhuma sessão.
 * Nunca lança: se falhar, o fluxo do teste segue normalmente sem sessão.
 * Retorna o uid da sessão (existente ou recém-criada) ou null.
 */
export async function ensureAnonSession(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) return data.session.user.id;

    const { data: anon, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("[anonSession] signInAnonymously falhou:", error.message);
      return null;
    }
    return anon.user?.id ?? null;
  } catch (e) {
    console.warn("[anonSession] erro inesperado:", e);
    return null;
  }
}

/** Salva o nome digitado no teste no user_metadata, para o header mostrar na hora. */
export async function setSessionNome(nome: string): Promise<void> {
  const limpo = nome.trim();
  if (!limpo) return;
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) return;
    await supabase.auth.updateUser({ data: { nome: limpo } });
  } catch (e) {
    console.warn("[anonSession] updateUser falhou:", e);
  }
}

/** uid da sessão atual (anônima ou verificada), ou null. */
export async function currentUserId(): Promise<string | null> {
  try {
    const { data } = await supabase.auth.getSession();
    return data.session?.user?.id ?? null;
  } catch {
    return null;
  }
}
