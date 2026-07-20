import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import PrecoDisplay from "@/components/samkhya/PrecoDisplay";
import BotaoWhatsApp from "@/components/samkhya/BotaoWhatsApp";
import BotaoAdicionarCarrinho from "@/components/samkhya/BotaoAdicionarCarrinho";
import { samkhyaTokens } from "@/components/samkhya/tokens";

type ItemFixo = {
  produto_id: number;
  slug: string;
  nome: string;
  quantidade: number;
  imagem_url: string | null;
  resumo: string | null;
};

type EscolhaOpcao = {
  produto_id: number;
  slug: string;
  nome: string;
  imagem_url: string | null;
  resumo: string | null;
  padrao?: boolean;
};

type EscolhaGrupo = {
  grupo: string;
  rotulo: string;
  opcoes: EscolhaOpcao[];
};

type KitDetalhe = {
  slug: string;
  nome: string;
  descricao_curta: string | null;
  preco_pix: number;
  preco_normal: number;
  imagem_url: string | null;
  peso_gramas: number;
  stripe_price_id?: string | null;
  id?: number;
  itens_fixos: ItemFixo[];
  escolhas: EscolhaGrupo[];
};

const SamkhyaKit = () => {
  const { slug } = useParams<{ slug: string }>();
  const [kit, setKit] = useState<KitDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selecoes, setSelecoes] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data, error } = await supabase.rpc("kit_detalhe" as never, { p_slug: slug } as never);
      if (cancelled) return;
      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      const k = (Array.isArray(data) ? data[0] : data) as KitDetalhe | null;
      if (!k) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setKit(k);
      // Inicializa escolhas com o padrão de cada grupo
      const iniciais: Record<string, number> = {};
      (k.escolhas ?? []).forEach((g) => {
        const padrao = g.opcoes.find((o) => o.padrao) ?? g.opcoes[0];
        if (padrao) iniciais[g.grupo] = padrao.produto_id;
      });
      setSelecoes(iniciais);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const escolhasLabel = useMemo(() => {
    if (!kit || !kit.escolhas?.length) return undefined;
    const nomes: string[] = [];
    kit.escolhas.forEach((g) => {
      const sel = selecoes[g.grupo];
      const op = g.opcoes.find((o) => o.produto_id === sel);
      if (op) nomes.push(op.nome);
    });
    return nomes.length ? nomes.join(" · ") : undefined;
  }, [kit, selecoes]);

  return (
    <>
      <Helmet>
        <title>{kit ? `${kit.nome} — Loja Samkhya` : "Kit — Loja Samkhya"}</title>
        {kit && (
          <meta
            name="description"
            content={`${kit.nome} — kit Ayurvédico Samkhya. ${kit.descricao_curta ?? ""}`.trim()}
          />
        )}
      </Helmet>

      <SamkhyaLayout>
        <Link
          to="/samkhya#kits"
          className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
          style={{ color: samkhyaTokens.roxo }}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar aos kits
        </Link>

        {loading ? (
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-square rounded-lg" style={{ background: samkhyaTokens.roxoLight }} />
            <div className="space-y-4">
              <div className="h-8 w-2/3 rounded" style={{ background: samkhyaTokens.roxoLight }} />
              <div className="h-32 rounded" style={{ background: samkhyaTokens.roxoLight }} />
            </div>
          </div>
        ) : notFound || !kit ? (
          <p style={{ color: samkhyaTokens.textoSec }}>
            Kit não encontrado. <Link to="/samkhya#kits" className="underline">Ver todos os kits</Link>.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div className="aspect-square rounded-lg flex items-center justify-center p-4 md:p-6">
              {kit.imagem_url ? (
                <img src={kit.imagem_url} alt={kit.nome} className="max-h-full max-w-full object-contain" />
              ) : (
                <span style={{ color: samkhyaTokens.textoSec }}>Sem imagem</span>
              )}
            </div>

            <div className="flex flex-col gap-10">
              <h1
                className="text-2xl md:text-3xl leading-tight"
                style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {kit.nome}
              </h1>

              {kit.descricao_curta && (
                <p style={{ color: samkhyaTokens.textoSec }} className="text-sm leading-relaxed">
                  {kit.descricao_curta}
                </p>
              )}

              <div>
                <h2
                  className="text-base mb-3"
                  style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  O que vem no kit
                </h2>
                <ul className="space-y-2">
                  {kit.itens_fixos?.map((item) => (
                    <li key={item.produto_id} className="text-sm flex gap-2" style={{ color: samkhyaTokens.texto }}>
                      <span style={{ color: samkhyaTokens.ouro }}>•</span>
                      <span>
                        {item.quantidade}x {item.nome}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {kit.escolhas?.map((grupo) => (
                <div key={grupo.grupo}>
                  <h2
                    className="text-base mb-3"
                    style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
                  >
                    {grupo.rotulo}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {grupo.opcoes.map((op) => {
                      const selecionado = selecoes[grupo.grupo] === op.produto_id;
                      return (
                        <button
                          key={op.produto_id}
                          type="button"
                          onClick={() =>
                            setSelecoes((prev) => ({ ...prev, [grupo.grupo]: op.produto_id }))
                          }
                          className="relative text-left rounded-md p-3 transition-colors"
                          style={{
                            background: selecionado ? "#fff" : samkhyaTokens.cardBg,
                            border: `2px solid ${selecionado ? samkhyaTokens.ouro : samkhyaTokens.cardBorder}`,
                            boxShadow: selecionado ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
                          }}
                          aria-pressed={selecionado}
                        >
                          {selecionado && (
                            <span
                              className="absolute top-2 right-2 rounded-full p-0.5"
                              style={{ background: samkhyaTokens.ouro, color: "#fff" }}
                            >
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                          <div className="flex gap-3 items-start">
                            <div className="w-14 h-14 flex-shrink-0 rounded overflow-hidden bg-white flex items-center justify-center">
                              {op.imagem_url ? (
                                <img
                                  src={op.imagem_url}
                                  alt={op.nome}
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : null}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="text-sm font-medium"
                                style={{ color: samkhyaTokens.roxo }}
                              >
                                {op.nome}
                              </p>
                              {op.resumo && (
                                <p
                                  className="text-xs mt-1 leading-snug"
                                  style={{ color: samkhyaTokens.textoSec }}
                                >
                                  {op.resumo}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <PrecoDisplay
                precoNormal={Number(kit.preco_normal)}
                precoPix={Number(kit.preco_pix)}
                showParcelas
                size="md"
              />

              <div className="flex flex-col gap-3">
                <BotaoAdicionarCarrinho
                  item={{
                    id: kit.id ?? 0,
                    slug: kit.slug,
                    nome: kit.nome,
                    preco_normal: Number(kit.preco_normal),
                    preco_pix: Number(kit.preco_pix),
                    stripe_price_id: kit.stripe_price_id ?? null,
                    imagem_url: kit.imagem_url,
                    peso_gramas: kit.peso_gramas ?? 0,
                    tipo: "kit",
                    ...(Object.keys(selecoes).length > 0
                      ? { escolhas: selecoes, escolhas_label: escolhasLabel }
                      : {}),
                  }}
                  size="sm"
                  fullWidth
                />
                <BotaoWhatsApp
                  produtoNome={escolhasLabel ? `${kit.nome} — ${escolhasLabel}` : kit.nome}
                  size="sm"
                  fullWidth
                />
              </div>
            </div>
          </div>
        )}
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaKit;
