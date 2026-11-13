import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl, useCashBlack } from "@/lib/cashBlack";
import { samkhyaTokens } from "@/components/samkhya/tokens";

export type MetodoCurso = "cartao" | "pix";

/** Preço do curso no banco; só busca durante a campanha. */
export function useCursoCashBlack(slug: string) {
  const { ativa } = useCashBlack();
  const q = useQuery({
    queryKey: ["curso_preco_cb", slug],
    enabled: ativa,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.from("cursos").select("preco, preco_pix").eq("slug", slug).maybeSingle();
      return data as { preco: number | null; preco_pix: number | null } | null;
    },
  });
  const preco = Number(q.data?.preco ?? 0);
  // Sem preco_pix cadastrado, usa os 20% de desconto à vista da campanha.
  const pix = q.data?.preco_pix != null ? Number(q.data.preco_pix) : Math.round(preco * 80) / 100;
  return ativa && preco > 0 && pix > 0 ? { preco, pix } : null;
}

const CashBlackCurso = ({ preco, pix, onEscolher }: { preco: number; pix: number; onEscolher: (m: MetodoCurso) => void }) => {
  const cartao = { background: "#fff", border: `1px solid ${samkhyaTokens.cardBorder}` };
  const botao = "mt-auto w-full rounded-md px-4 py-3 text-sm font-bold";
  return (
    <div className="grid gap-4 md:grid-cols-2 text-left">
      <div className="flex flex-col gap-2 rounded-xl p-5" style={{ ...cartao, borderColor: samkhyaTokens.roxo, borderWidth: 2 }}>
        <h3 className="font-serif font-bold text-lg" style={{ color: samkhyaTokens.roxo }}>Cash Black no cartão</h3>
        <p className="text-sm text-muted-foreground">Em até 5x no cartão.</p>
        <p className="font-serif font-bold text-3xl" style={{ color: samkhyaTokens.roxoDark }}>{brl(preco)}</p>
        <p className="text-sm text-foreground/80 mb-3">
          Você faz o curso e ganha {brl(preco)} em crédito. Pode usar esse valor em outros cursos do Portal ou em produtos da Samkhya.
        </p>
        <button type="button" onClick={() => onEscolher("cartao")} className={botao} style={{ background: samkhyaTokens.ouro, color: samkhyaTokens.footerTexto }}>
          Aproveitar Cash Black
        </button>
      </div>
      <div className="flex flex-col gap-2 rounded-xl p-5" style={cartao}>
        <h3 className="font-serif font-bold text-lg" style={{ color: samkhyaTokens.roxo }}>Prefere pagar menos?</h3>
        <p className="text-sm text-muted-foreground">20% de desconto à vista no Pix.</p>
        <p className="font-serif font-bold text-3xl" style={{ color: samkhyaTokens.roxoDark }}>
          <span className="text-base font-normal line-through text-muted-foreground mr-2">{brl(preco)}</span>
          {brl(pix)}
        </p>
        <p className="text-sm text-foreground/80 mb-3">
          Você economiza {brl(preco - pix)} agora. Nesta opção, não ganha crédito.
        </p>
        <button type="button" onClick={() => onEscolher("pix")} className={botao} style={{ background: samkhyaTokens.roxo, color: samkhyaTokens.footerTexto }}>
          Pagar com Pix
        </button>
      </div>
    </div>
  );
};
export default CashBlackCurso;
