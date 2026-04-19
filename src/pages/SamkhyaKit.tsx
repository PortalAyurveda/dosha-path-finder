import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import { lojaSupabase, type LojaKitComItens } from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import PrecoDisplay from "@/components/samkhya/PrecoDisplay";
import BotaoWhatsApp from "@/components/samkhya/BotaoWhatsApp";
import BotaoStripe from "@/components/samkhya/BotaoStripe";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const renderItemNome = (
  produtoNome: string | undefined,
  nota: string | null,
  quantidade: number,
): string => {
  if (nota && nota.toLowerCase().includes("cliente_escolhe")) {
    // Heurística — cliente escolhe entre Massala Doce ou Massala Chai
    return `${quantidade}x À sua escolha: Massala Doce ou Massala Chai`;
  }
  const base = produtoNome ?? "Item";
  return `${quantidade}x ${base}${nota ? ` — ${nota}` : ""}`;
};

const SamkhyaKit = () => {
  const { slug } = useParams<{ slug: string }>();
  const [kit, setKit] = useState<LojaKitComItens | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setNotFound(false);
      const { data } = await lojaSupabase
        .from("kits")
        .select(`
          *,
          kit_itens (
            quantidade,
            nota,
            produtos ( nome_display, slug, imagem_url )
          )
        `)
        .eq("slug", slug)
        .eq("ativo", true)
        .maybeSingle();

      if (cancelled) return;
      if (!data) {
        setNotFound(true);
      } else {
        setKit(data as unknown as LojaKitComItens);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
            <div
              className="aspect-square rounded-lg flex items-center justify-center p-8 md:p-12"
              style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}
            >
              {kit.imagem_url ? (
                <img src={kit.imagem_url} alt={kit.nome} className="max-h-full max-w-full object-contain" />
              ) : (
                <span style={{ color: samkhyaTokens.textoSec }}>Sem imagem</span>
              )}
            </div>

            <div className="flex flex-col gap-6">
              <h1
                className="text-4xl md:text-5xl leading-tight"
                style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                {kit.nome}
              </h1>
              {kit.descricao_curta && (
                <p style={{ color: samkhyaTokens.textoSec }} className="text-base leading-relaxed">
                  {kit.descricao_curta}
                </p>
              )}

              <div
                className="rounded-lg p-6"
                style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}
              >
                <h2
                  className="text-lg mb-3"
                  style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  O que vem no kit
                </h2>
                <ul className="space-y-2">
                  {kit.kit_itens?.map((item, i) => (
                    <li key={i} className="text-sm flex gap-2" style={{ color: samkhyaTokens.texto }}>
                      <span style={{ color: samkhyaTokens.ouro }}>•</span>
                      <span>{renderItemNome(item.produtos?.nome_display, item.nota, item.quantidade)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-lg p-6"
                style={{ background: samkhyaTokens.cardBg, border: `1px solid ${samkhyaTokens.cardBorder}` }}
              >
                <PrecoDisplay
                  precoNormal={Number(kit.preco_normal)}
                  precoPix={Number(kit.preco_pix)}
                  showParcelas
                  size="lg"
                />
                <div className="mt-6 flex flex-col gap-3">
                  <BotaoWhatsApp produtoNome={kit.nome} size="lg" fullWidth />
                  <BotaoStripe size="lg" fullWidth />
                </div>
              </div>
            </div>
          </div>
        )}
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaKit;
