import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl, type MeuCashback } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";

/** Bloco "Seus créditos Cash Black" no Meu Perfil; aparece só com total > 0. */
const CreditosCashBlack = () => {
  const { data } = useQuery({
    queryKey: ["meu_cashback"],
    staleTime: 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("meu_cashback");
      if (error) return null;
      return data as unknown as MeuCashback;
    },
  });
  if (!data || !(Number(data.total) > 0)) return null;
  const numeros: [string, number][] = [
    ["Seu crédito total", data.total],
    ["Para usar na Samkhya ou no Portal", data.samkhya_e_portal],
    ["Para usar só no Portal", data.so_portal],
  ];
  return (
    <section className="bg-white border border-border/60 shadow-sm p-6 md:p-8" style={{ borderRadius: "28px 28px 22px 22px" }}>
      <h2 className="font-serif font-bold text-xl mb-4" style={{ color: samkhyaTokens.roxo }}>Seus créditos Cash Black</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        {numeros.map(([r, v]) => (
          <div key={r} className="rounded-xl p-4" style={{ background: samkhyaTokens.roxoLight }}>
            <div className="text-xs text-foreground/70">{r}</div>
            <div className="font-serif font-bold text-2xl" style={{ color: samkhyaTokens.roxoDark }}>{brl(Number(v))}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-foreground/80">Disponível para usar de 28/11/2026 até 31/05/2027.</p>
      {data.movimentos?.length > 0 && (
        <ul className="mt-4 divide-y divide-border/60">
          {data.movimentos.map((m, i) => (
            <li key={i} className="py-2 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-foreground">{m.descricao || "—"}</span>
                <span className="font-semibold whitespace-nowrap" style={{ color: samkhyaTokens.ouroText }}>+ {brl(Number(m.valor))}</span>
              </div>
              <div className="text-xs text-muted-foreground">
                {m.vale_em === "portal" ? "Crédito para usar no Portal." : m.vale_em === "ambos" ? "Crédito para usar no Portal ou na Samkhya." : ""}
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
        Seu crédito já aparece aqui. A partir de 28/11, você poderá usá-lo nas compras. Não precisa gastar tudo de uma vez. O que sobrar continua valendo até 31/05/2027.
      </p>
    </section>
  );
};
export default CreditosCashBlack;
