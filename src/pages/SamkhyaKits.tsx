import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ChevronLeft } from "lucide-react";
import { lojaSupabase, type LojaKit } from "@/integrations/supabase/loja-client";
import SamkhyaLayout from "@/components/samkhya/SamkhyaLayout";
import KitCard from "@/components/samkhya/KitCard";
import { samkhyaTokens } from "@/components/samkhya/tokens";

const TIPO_ORDEM: Record<string, number> = {
  mini_kit: 1,
  anti_dosha: 2,
  especial: 3,
  viagem: 4,
  gold: 5,
};

const SamkhyaKits = () => {
  const [kits, setKits] = useState<LojaKit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await lojaSupabase
        .from("kits")
        .select("*")
        .eq("ativo", true)
        .order("ordem_exibicao", { ascending: true, nullsFirst: false });
      if (cancelled) return;
      const sorted = ((data ?? []) as unknown as LojaKit[]).slice().sort((a, b) => {
        const ta = TIPO_ORDEM[a.tipo_kit ?? ""] ?? 99;
        const tb = TIPO_ORDEM[b.tipo_kit ?? ""] ?? 99;
        if (ta !== tb) return ta - tb;
        return Number(a.preco_normal) - Number(b.preco_normal);
      });
      setKits(sorted);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>Kits & Combos — Loja Samkhya</title>
        <meta
          name="description"
          content="Todos os kits Samkhya: Mini Kits Anti-Dosha, Kits Completos, Kit Viagem, Kit Madhus e mais."
        />
      </Helmet>

      <SamkhyaLayout>
        <Link
          to="/samkhya"
          className="inline-flex items-center gap-1 text-sm mb-6 hover:underline"
          style={{ color: samkhyaTokens.roxo }}
        >
          <ChevronLeft className="h-4 w-4" /> Voltar para a loja
        </Link>

        <div className="text-center mb-10">
          <h1
            className="text-3xl md:text-4xl italic font-light tracking-wide"
            style={{
              color: samkhyaTokens.roxo,
              fontFamily: "Georgia, 'Times New Roman', serif",
            }}
          >
            ✦ Kits & Combos ✦
          </h1>
          <p className="mt-3 text-base" style={{ color: samkhyaTokens.textoSec }}>
            Combinações pensadas para potencializar resultados — economize comprando em conjunto.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-sm animate-pulse"
                style={{ background: samkhyaTokens.roxoLight }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {kits.map((k) => (
              <KitCard key={k.id} kit={k} />
            ))}
          </div>
        )}
      </SamkhyaLayout>
    </>
  );
};

export default SamkhyaKits;
