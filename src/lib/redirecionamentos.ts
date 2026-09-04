import { supabase } from "@/integrations/supabase/client";

/**
 * Busca um redirecionamento ativo para o caminho informado.
 * Retorna o destino (para_path) ou null quando não houver.
 */
export async function buscarRedirecionamento(path: string): Promise<string | null> {
  if (!path) return null;
  const semBarraFinal = path.length > 1 ? path.replace(/\/+$/, "") : path;
  const candidatos = Array.from(new Set([path, semBarraFinal]));

  const { data, error } = await supabase
    .from("redirecionamentos")
    .select("para_path")
    .eq("ativo", true)
    .in("de_path", candidatos)
    .limit(1)
    .maybeSingle();

  if (error || !data?.para_path) return null;
  return data.para_path;
}

/** Executa o redirect (interno ou externo), sem tela intermediária. */
export function aplicarRedirecionamento(destino: string) {
  if (/^https?:\/\//i.test(destino)) {
    window.location.replace(destino);
  } else {
    window.location.replace(destino.startsWith("/") ? destino : `/${destino}`);
  }
}
