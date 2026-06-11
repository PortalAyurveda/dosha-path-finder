import { useEffect, useState } from "react";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { useUser } from "@/contexts/UserContext";

export type CupomUsuario = {
  id: string;
  codigo: string;
  tipo_desconto: string; // 'percentual' | 'valor_fixo' | 'frete_gratis'
  valor_desconto: number;
};

/**
 * Retorna o cupom pessoal do usuário logado (cupons criados no fluxo do teste de
 * dosha, com `tipo_cupom = 'uso_unico'` e `descricao = 'teste_dosha:<email>'`).
 */
export function useCupomUsuario() {
  const { user } = useUser();
  const [cupom, setCupom] = useState<CupomUsuario | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const email = user?.email?.toLowerCase();
    if (!email) {
      setCupom(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data } = await lojaSupabase
        .from("cupons")
        .select("id, codigo, tipo_desconto, valor_desconto, ativo, descricao, tipo_cupom")
        .eq("ativo", true)
        .eq("tipo_cupom", "uso_unico")
        .eq("descricao", `teste_dosha:${email}`)
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        setCupom({
          id: String((data as any).id),
          codigo: String((data as any).codigo),
          tipo_desconto: String((data as any).tipo_desconto),
          valor_desconto: Number((data as any).valor_desconto) || 0,
        });
      } else {
        setCupom(null);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  return { cupom, loading };
}
