// Texto de cada página para o HTML do build (o bloco seo-corpo).
//
// REGRA: aqui entra só o que a página React já mostra na tela, com os mesmos campos do banco.
// Nada de texto, link ou seção que só o robô veria.
//
// Os sinais de menor das tags estão escritos como \u003c de propósito: o texto deste arquivo
// passa pelo chat do Lovable, que apaga tudo que parece tag.

import { limparDescricaoVideo } from "../../src/lib/videoDescricao";
import type { LinhaArtigo, LinhaVideo, LinhaReceita } from "./fontes";
import type { Relacionados, Item } from "./relacionados";

const A = "\u003c";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/\u003c/g, "&lt;").replace(/>/g, "&gt;");
}

function tag(nome: string, conteudo: string): string {
  return `${A}${nome}>${conteudo}${A}/${nome}>`;
}

function limpo(texto: unknown): string {
  if (!texto || typeof texto !== "string") return "";
  return texto.replace(/\u003c[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function paragrafos(texto: string): string {
  return texto
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => tag("p", esc(p).replace(/\n/g, " ")))
    .join("");
}

function lista(itens: string[], ordenada = false): string {
  if (!itens.length) return "";
  return tag(ordenada ? "ol" : "ul", itens.map((i) => tag("li", esc(i))).join(""));
}

function links(titulo: string, itens: Item[]): string {
  if (!itens.length) return "";
  return tag("h2", titulo) + tag("ul", itens.map((i) => tag("li", `${A}a href="${esc(i.rota)}">${esc(i.titulo)}${A}/a>`)).join(""));
}

/** Artigo: título, resumo, o texto do artigo e o bloco Leia também / Assista também (como em BlogArticle.tsx). */
export function corpoArtigo(p: LinhaArtigo, rel?: Relacionados): string {
  return [
    tag("h1", esc(limpo(p.title))),
    p.meta_description ? tag("p", esc(limpo(p.meta_description))) : "",
    p.summary ?? "",
    rel ? links("Leia também", rel.artigos) : "",
    rel ? links("Assista também", rel.videos) : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Vídeo: título, índice de minutos e descrição, como em Video.tsx. */
export function corpoVideo(v: LinhaVideo): string {
  const fonte = v.nova_descricao || v.mini_resumo || "";
  const indice: string[] = [];
  const re = /((\d{1,2}:)?\d{1,2}:\d{2})\s*[-–]\s*(.+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(fonte)) !== null && indice.length < 60) indice.push(`${m[1]} ${m[3].trim()}`);

  const partes = [tag("h1", esc(limpo(v.novo_titulo)))];
  if (indice.length) partes.push(tag("h2", "Índice de Minutos"), lista([...new Set(indice)]));
  partes.push(paragrafos(limparDescricaoVideo(fonte)));
  return partes.filter(Boolean).join("\n");
}

/** ingredientes e modo_preparo são jsonb: aceita lista de texto, lista de objeto ou texto. */
export function listaDeJson(valor: unknown): string[] {
  if (!valor) return [];
  if (typeof valor === "string") return valor.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  if (!Array.isArray(valor)) return [];
  return valor
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (item && typeof item === "object") {
        const o = item as Record<string, unknown>;
        const partes = ["quantidade", "qtd", "medida", "nome", "item", "ingrediente", "texto", "passo", "descricao"]
          .map((k) => (typeof o[k] === "string" ? (o[k] as string).trim() : ""))
          .filter(Boolean);
        return partes.length ? [...new Set(partes)].join(" ") : Object.values(o).filter((x) => typeof x === "string").join(" ").trim();
      }
      return "";
    })
    .filter(Boolean);
}

/** Receita: título, resumo, ingredientes e modo de preparo. */
export function corpoReceita(r: LinhaReceita): string {
  const partes = [tag("h1", esc(limpo(r.titulo)))];
  if (r.resumo) partes.push(tag("p", esc(limpo(r.resumo))));
  const ing = listaDeJson(r.ingredientes).map(limpo).filter(Boolean);
  if (ing.length) partes.push(tag("h2", "Ingredientes"), lista(ing));
  const passos = listaDeJson(r.modo_preparo).map(limpo).filter(Boolean);
  if (passos.length) partes.push(tag("h2", "Modo de preparo"), lista(passos, true));
  return partes.join("\n");
}

/** Terapeuta: nome, cidade, especialidade e apresentação. */
export function corpoTerapeuta(t: Record<string, any>): string {
  const local = [limpo(t.cidade), limpo(t.estado)].filter(Boolean).join("/");
  const partes = [tag("h1", esc(limpo(t.nome)))];
  if (local) partes.push(tag("p", esc(local)));
  if (t.especialidade) partes.push(tag("p", esc(limpo(t.especialidade))));
  if (t.resumo) partes.push(paragrafos(String(t.resumo)));
  return partes.join("\n");
}

/** Teste de dosha: o que a tela inicial mostra (título, subtítulo e as dúvidas). */
export function corpoTesteDosha(faq: { q: string; a: string }[]): string {
  return [
    tag("h1", "Seu guia completo para saúde e longevidade."),
    tag("p", "Descubra e cuide dos seus Doshas por meio da medicina milenar."),
    tag("p", "Comece seu Teste de Dosha Gratuito"),
    tag("h2", "Dúvidas sobre o teste"),
    ...faq.flatMap((f) => [tag("h3", esc(f.q)), tag("p", esc(f.a))]),
  ].join("\n");
}

/**
 * Bloco que entra logo depois do div root (por isso aparece no fim da página enquanto existe).
 * Só some quando o conteúdo de verdade está montado dentro do #root: um h1 lá dentro cujo texto,
 * comparado só pelas letras e números (minúsculas, sem acento, sem espaço nem pontuação), é igual
 * ao h1 deste bloco. No esqueleto de carregamento (sem h1) e nas telas de erro / "não encontrada"
 * (h1 diferente) o bloco FICA, sem relógio nenhum: a página nunca fica idêntica às outras do mesmo
 * tipo, mesmo que a busca de dados falhe no renderizador do Google.
 * Também some quando a URL aberta deixa de ser a rota carimbada em data-rota (navegação dentro do
 * site) e no primeiro toque de uma pessoa (roda do mouse, dedo, tecla, clique) depois que o React
 * montou. Robô não toca na página. Bloco sem h1 some no primeiro h1 do React.
 * O script não usa sinal de menor nem barra invertida de propósito.
 */
export function blocoCorpo(rota: string, corpo: string): string {
  const script =
    "(function(){var c=document.getElementById('seo-corpo'),r=document.getElementById('root');if(!c||!r)return;" +
    "var norm=function(s){s=s||'';if(s.normalize)s=s.normalize('NFD');return s.toLowerCase().replace(/[^a-z0-9]/g,'');};" +
    "var caminho=function(p){p=p||'';try{p=decodeURIComponent(p);}catch(e){}p=p.toLowerCase();while(p.length>1&&p.charAt(p.length-1)==='/')p=p.slice(0,-1);return p||'/';};" +
    "var h=c.querySelector('h1'),alvo=norm(h?h.textContent:''),rota=caminho(c.getAttribute('data-rota'));" +
    "var evs=['wheel','touchstart','keydown','pointerdown'],op={capture:true,passive:true},o;" +
    "var toque=function(){if(r.firstChild)tirar();};" +
    "var tirar=function(){if(c.parentNode)c.parentNode.removeChild(c);if(o)o.disconnect();for(var i=0;i!==evs.length;i++)window.removeEventListener(evs[i],toque,op);};" +
    "var ver=function(){" +
    "if(caminho(location.pathname)!==rota){tirar();return;}" +
    "var hs=r.querySelectorAll('h1');" +
    "for(var i=0;i!==hs.length;i++){if(!alvo||norm(hs[i].textContent)===alvo){tirar();return;}}" +
    "};" +
    "for(var i=0;i!==evs.length;i++)window.addEventListener(evs[i],toque,op);" +
    "o=new MutationObserver(ver);o.observe(r,{childList:true,subtree:true,characterData:true});ver();})();";
  return `\n    ${A}div id="seo-corpo" data-rota="${esc(rota)}">${corpo}${A}/div>\n    ${A}script>${script}${A}/script>`;
}
