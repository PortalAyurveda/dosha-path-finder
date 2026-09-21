// "Leia também" e "Assista também" no fim do artigo.
// As sugestões são calculadas no build (scripts/seo/relacionados.ts) e gravadas em
// /leia-tambem/{slug}.json, um arquivo pequeno por artigo. Aqui só se lê e mostra.
// Escrito com createElement, sem JSX, de propósito.

import { createElement as h } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

type Item = { titulo: string; rota: string; imagem: string };
type Relacionados = { artigos: Item[]; videos: Item[] };

function Cartao({ item }: { item: Item }) {
  return h(
    Link,
    {
      to: item.rota,
      className:
        "group flex sm:block items-center gap-3 sm:gap-0 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-border bg-card overflow-hidden hover:shadow-md transition-shadow",
    },
    h("img", {
      src: item.imagem,
      alt: "",
      loading: "lazy",
      decoding: "async",
      className: "w-24 h-16 sm:w-full sm:h-auto sm:aspect-video object-cover flex-none",
    }),
    h("span", { className: "block font-serif text-sm md:text-[15px] leading-snug text-primary py-2 pr-3 sm:p-3 line-clamp-3" }, item.titulo)
  );
}

function Bloco({ titulo, itens, colunas }: { titulo: string; itens: Item[]; colunas: string }) {
  if (!itens.length) return null;
  return h(
    "section",
    { className: "mt-8" },
    h("h2", { className: "font-serif text-xl md:text-2xl font-semibold text-primary mb-4" }, titulo),
    h("div", { className: `grid grid-cols-1 ${colunas} gap-3 md:gap-4` }, ...itens.map((i) => h(Cartao, { key: i.rota, item: i })))
  );
}

const LeiaTambem = ({ slug }: { slug: string }) => {
  const { data } = useQuery({
    queryKey: ["leia-tambem", slug],
    enabled: !!slug,
    staleTime: Infinity,
    retry: false,
    queryFn: async (): Promise<Relacionados | null> => {
      const r = await fetch(`/leia-tambem/${slug}.json`);
      if (!r.ok) return null;
      try {
        const d = (await r.json()) as Relacionados;
        return Array.isArray(d?.artigos) && Array.isArray(d?.videos) ? d : null;
      } catch {
        return null;
      }
    },
  });

  if (!data || (!data.artigos.length && !data.videos.length)) return null;
  return h(
    "div",
    { className: "mt-6" },
    h(Bloco, { titulo: "Leia também", itens: data.artigos, colunas: "sm:grid-cols-4" }),
    h(Bloco, { titulo: "Assista também", itens: data.videos, colunas: "sm:grid-cols-2" })
  );
};

export default LeiaTambem;
