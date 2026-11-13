import { Check } from "lucide-react";
import { samkhyaTokens } from "@/components/samkhya/tokens";

export type EscolhaOpcao = { produto_id: number; slug: string; nome: string; imagem_url: string | null; resumo: string | null; padrao?: boolean };
export type EscolhaGrupo = { grupo: string; rotulo: string; opcoes: EscolhaOpcao[] };

/** Seletor das escolhas de um kit (mesmo da página do kit). */
export function escolhasPadrao(grupos: EscolhaGrupo[]) {
  const r: Record<string, number> = {};
  grupos.forEach((g) => { const p = g.opcoes.find((o) => o.padrao) ?? g.opcoes[0]; if (p) r[g.grupo] = p.produto_id; });
  return r;
}
export function rotuloEscolhas(grupos: EscolhaGrupo[], sel: Record<string, number>) {
  const n = grupos.map((g) => g.opcoes.find((o) => o.produto_id === sel[g.grupo])?.nome).filter(Boolean);
  return n.length ? n.join(" · ") : undefined;
}

const KitEscolhas = ({ grupos, selecoes, onChange }: { grupos: EscolhaGrupo[]; selecoes: Record<string, number>; onChange: (s: Record<string, number>) => void }) => (
  <>
    {grupos.map((grupo) => (
      <div key={grupo.grupo}>
        <h2 className="text-base mb-3" style={{ color: samkhyaTokens.roxo, fontFamily: samkhyaTokens.fonteTitulo }}>{grupo.rotulo}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {grupo.opcoes.map((op) => {
            const selecionado = selecoes[grupo.grupo] === op.produto_id;
            return (
              <button
                key={op.produto_id}
                type="button"
                onClick={() => onChange({ ...selecoes, [grupo.grupo]: op.produto_id })}
                className="relative text-left rounded-md p-3 transition-colors"
                style={{
                  background: selecionado ? "#fff" : samkhyaTokens.cardBg,
                  border: `2px solid ${selecionado ? samkhyaTokens.ouro : samkhyaTokens.cardBorder}`,
                  boxShadow: selecionado ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                }}
                aria-pressed={selecionado}
              >
                {selecionado && (
                  <span className="absolute top-2 right-2 rounded-full p-0.5" style={{ background: samkhyaTokens.ouro, color: "#fff" }}>
                    <Check className="h-3 w-3" />
                  </span>
                )}
                <div className="flex gap-3 items-start">
                  <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-white flex items-center justify-center">
                    {op.imagem_url ? <img src={op.imagem_url} alt={op.nome} className="max-w-full max-h-full object-contain" loading="lazy" decoding="async" /> : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: samkhyaTokens.roxo }}>{op.nome}</p>
                    {op.resumo && <p className="text-xs mt-1 leading-snug" style={{ color: samkhyaTokens.textoSec }}>{op.resumo}</p>}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </>
);
export default KitEscolhas;
