import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Leaf, Library, Loader2, Search, Shuffle, Star } from "lucide-react";
import Seo from "@/components/Seo";
import BannerSlot from "@/components/banners/BannerSlot";
import { Button } from "@/components/ui/button";
import VersoCard, { type Verso } from "@/components/textos/VersoCard";
import { rpcClassicos, numero, type ObraLista } from "@/lib/classicos";
import { supabase } from "@/integrations/supabase/client";

type LinhaPagina = {
  chave: string; bloco: string; icone: string | null;
  titulo: string | null; texto: string | null; rota: string | null; ordem: number;
};
type Tema = { tema: string; rotulo: string; total: number };

const ICONES: Record<string, typeof Library> = {
  library: Library, star: Star, leaf: Leaf, search: Search, book: BookOpen,
};

export default function TextosClassicos() {
  const [verso, setVerso] = useState<Verso | null>(null);
  const [carregandoVerso, setCarregandoVerso] = useState(true);

  const carregarVerso = useCallback(async (aleatorio: boolean) => {
    setCarregandoVerso(true);
    const { data } = await supabase.rpc(aleatorio ? "random_curated_verse" : "verse_of_the_day", {} as never);
    const linha = Array.isArray(data) ? (data[0] as Verso | undefined) : undefined;
    setVerso(linha ?? null);
    setCarregandoVerso(false);
  }, []);

  useEffect(() => { void carregarVerso(false); }, [carregarVerso]);

  const pagina = useQuery({
    queryKey: ["classicos-pagina"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classicos_pagina")
        .select("chave, bloco, icone, titulo, texto, rota, ordem")
        .eq("ativo", true)
        .order("ordem");
      if (error) throw error;
      return (data ?? []) as LinhaPagina[];
    },
  });

  const estante = useQuery({
    queryKey: ["classicos-estante"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<ObraLista>("classicos_estante"),
  });

  const temas = useQuery({
    queryKey: ["classicos-temas"],
    staleTime: 5 * 60 * 1000,
    queryFn: () => rpcClassicos<Tema>("classicos_temas"),
  });

  const linhas = pagina.data ?? [];
  const topo = linhas.find((l) => l.bloco === "topo");
  const portas = linhas.filter((l) => l.bloco === "porta");
  const secaoTemas = linhas.find((l) => l.chave === "secao-temas");
  const secaoRoteiro = linhas.find((l) => l.chave === "secao-roteiro");

  const obras = estante.data ?? [];
  const totalObras = obras.length;
  const totalVersos = obras.reduce((s, o) => s + (o.total_versos ?? 0), 0);
  const totalCapitulos = obras.reduce((s, o) => s + (o.total_capitulos ?? 0), 0);

  return (
    <>
      <Seo
        title="Textos Clássicos"
        description="Biblioteca clássica de Ayurveda: as obras traduzidas, o índice de cada livro, as plantas dos dicionários antigos e a busca em todos os versos."
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif+Devanagari:wght@400;600&display=swap" />
      </Helmet>

      <div className="bg-classics-soft">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-classics">
            <span aria-hidden className="mr-2">॥</span>
            {topo?.texto ?? "Biblioteca Clássica de Ayurveda"}
          </p>
          <h1 className="mt-2">{topo?.titulo ?? "Textos Clássicos"}</h1>
          {totalObras > 0 && (
            <p className="mt-3 text-base text-muted-foreground">
              {numero(totalObras)} obras traduzidas, {numero(totalVersos)} versos, {numero(totalCapitulos)} capítulos.
            </p>
          )}
        </div>
      </div>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
        <section className="mx-auto max-w-2xl">
          <h2 className="mb-5">Verso do dia</h2>
          {carregandoVerso ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-classics" /></div>
          ) : verso ? (
            <VersoCard verso={verso} />
          ) : (
            <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-base text-muted-foreground">
              Nenhum verso em destaque ainda.
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <Button
              onClick={() => void carregarVerso(true)}
              disabled={carregandoVerso}
              className="min-h-[48px] bg-classics text-base text-white hover:bg-classics/90"
            >
              <Shuffle className="mr-2 h-5 w-5" />
              Sortear outro verso
            </Button>
          </div>
        </section>

        <BannerSlot slot="classicos_topo" className="my-8 [&:empty]:hidden" />

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {portas.map((porta) => {
            const Icone = ICONES[porta.icone ?? "book"] ?? BookOpen;
            return (
              <Link
                key={porta.chave}
                to={porta.rota ?? "/textos-classicos"}
                className="flex min-h-[96px] items-start gap-3 rounded-2xl border border-classics bg-card p-4 transition-colors hover:bg-classics-soft"
              >
                <Icone className="mt-0.5 h-7 w-7 shrink-0 text-classics" strokeWidth={1.8} />
                <span className="min-w-0">
                  <span className="block font-serif text-lg font-bold text-primary">{porta.titulo}</span>
                  <span className="mt-1 block text-base text-muted-foreground">{porta.texto}</span>
                </span>
              </Link>
            );
          })}
        </section>

        <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-bold text-primary">{secaoTemas?.titulo ?? "Por tema"}</h2>
            <p className="mt-1 text-base text-muted-foreground">{secaoTemas?.texto}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(temas.data ?? []).map((t) => (
                <Link
                  key={t.tema}
                  to={`/textos-classicos/tema/${t.tema}`}
                  className="inline-flex min-h-[48px] items-center rounded-full bg-classics-soft px-4 text-base text-primary transition-colors hover:bg-classics hover:text-white"
                >
                  {t.rotulo} <span className="ml-2 text-muted-foreground">{numero(t.total)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-bold text-primary">{secaoRoteiro?.titulo ?? "Roteiro de estudo"}</h2>
            <p className="mt-1 text-base text-muted-foreground">{secaoRoteiro?.texto}</p>
            <Link
              to={secaoRoteiro?.rota ?? "/textos-classicos/roteiro"}
              className="mt-4 inline-flex min-h-[48px] items-center rounded-xl border border-classics/40 px-5 text-base font-medium text-classics transition-colors hover:bg-classics-soft"
            >
              Abrir o roteiro
            </Link>
          </div>
        </section>

        <BannerSlot slot="classicos_rodape" className="my-8 [&:empty]:hidden" />
      </main>
    </>
  );
}
