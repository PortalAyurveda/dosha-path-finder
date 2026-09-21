// "Leia também" e "Assista também" de cada artigo, calculados no build pelo texto.
//
// Método (o mesmo da planilha revisada em 21/09/2026):
// - duas comparações de texto somadas meio a meio: (1) título, resumo e artigo inteiro, com
//   palavras soltas e pares de palavras; (2) só título e resumo;
// - artigos quase iguais (parecença 0,45 ou mais) não se indicam;
// - nenhum artigo é indicado por mais de 8 outros, para o link se espalhar pelo site;
// - vídeos: os 2 mais parecidos com o artigo.

import type { LinhaArtigo, LinhaVideo } from "./fontes";

export type Item = { titulo: string; rota: string; imagem: string };

export type Relacionados = { artigos: Item[]; videos: Item[] };

const LIMITE_ENTRADA = 8;

const QUASE_IGUAL = 0.45;

const PARADAS = new Set(
  `a o e é de da do das dos em no na nos nas um uma uns umas para pra por com sem que se ao aos à às
como mais mas ou sua seu suas seus nosso nossa isso isto esse essa este esta ele ela eles elas você vocês
ser são foi está estão ter tem têm muito muita muitos muitas também já não sim quando onde porque pois
entre sobre até cada todo toda todos todas outro outra outros outras mesmo mesma quem qual quais
ayurveda ayurvédico ayurvédica ayurvédicos ayurvédicas portal vídeo vídeos aula artigo corpo saúde`.split(/\s+/)
);

const ENTIDADES: Record<string, string> = { "&amp;": "&", "&nbsp;": " ", "&quot;": '"', "&#39;": "'", "&lt;": " ", "&gt;": " " };

function texto(...partes: (string | null | undefined)[]): string {
  return partes
    .map((p) => p ?? "")
    .join(" ")
    .replace(/\u003c[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, (e) => ENTIDADES[e.toLowerCase()] ?? " ")
    .replace(/https?:\/\/\S+/g, " ")
    .toLowerCase();
}

function termos(t: string, pares: boolean): string[] {
  const palavras = (t.match(/\p{L}{3,}/gu) ?? []).filter((w) => !PARADAS.has(w));
  if (!pares) return palavras;
  const out = [...palavras];
  for (let i = 0; i + 1 < palavras.length; i++) out.push(`${palavras[i]} ${palavras[i + 1]}`);
  return out;
}

type Vetor = Map<string, number>;

/** TF-IDF com tf logarítmico e vetores de tamanho 1. */
function vetorizar(docs: string[][], minDf: number, maxDf: number): Vetor[] {
  const n = docs.length;
  const df = new Map<string, number>();
  for (const d of docs) for (const t of new Set(d)) df.set(t, (df.get(t) ?? 0) + 1);
  const teto = maxDf * n;

  return docs.map((d) => {
    const tf = new Map<string, number>();
    for (const t of d) tf.set(t, (tf.get(t) ?? 0) + 1);

    const v: Vetor = new Map();
    let soma = 0;
    for (const [t, f] of tf) {
      const c = df.get(t) ?? 0;
      if (c < minDf || c > teto) continue;
      const peso = (1 + Math.log(f)) * (Math.log((1 + n) / (1 + c)) + 1);
      v.set(t, peso);
      soma += peso * peso;
    }

    const norma = Math.sqrt(soma) || 1;
    for (const [t, p] of v) v.set(t, p / norma);
    return v;
  });
}

function produto(a: Vetor, b: Vetor): number {
  const [menor, maior] = a.size < b.size ? [a, b] : [b, a];
  let s = 0;
  for (const [t, p] of menor) {
    const q = maior.get(t);
    if (q) s += p * q;
  }
  return s;
}

export function montarRelacionados(artigosBrutos: LinhaArtigo[], videos: LinhaVideo[], ogPadrao: string): Map<string, Relacionados> {
  const artigos = [...artigosBrutos].sort((x, y) => x.title.toLowerCase().localeCompare(y.title.toLowerCase()));

  const nA = artigos.length;

  const longos = artigos.map((a) => termos(texto(a.title, a.title, a.title, a.meta_description, a.meta_description, a.summary), true));
  const dosVideos = videos.map((v) => termos(texto(v.novo_titulo, v.novo_titulo, v.mini_resumo, v.nova_descricao), true));

  const todos = vetorizar([...longos, ...dosVideos], 2, 0.5);
  const A = todos.slice(0, nA);
  const V = todos.slice(nA);

  const C = vetorizar(artigos.map((a) => termos(texto(a.title, a.title, a.meta_description), false)), 1, 1);

  const sim: number[][] = Array.from({ length: nA }, () => new Array(nA).fill(0));
  for (let i = 0; i < nA; i++) {
    for (let j = i + 1; j < nA; j++) {
      const s = 0.5 * produto(A[i], A[j]) + 0.5 * produto(C[i], C[j]);
      sim[i][j] = s;
      sim[j][i] = s;
    }
  }

  // Quem tem menos parentes fortes escolhe primeiro.
  const forca = sim.map((linha) => {
    const top = [...linha].sort((x, y) => y - x).slice(0, 4);
    return top.reduce((s, x) => s + x, 0) / 4;
  });
  const ordem = [...Array(nA).keys()].sort((x, y) => forca[x] - forca[y] || y - x);

  const entrada = new Array(nA).fill(0);
  const escolhas: number[][] = new Array(nA);

  for (const i of ordem) {
    const cand = [...Array(nA).keys()]
      .filter((j) => sim[i][j] > 0 && sim[i][j] < QUASE_IGUAL)
      .sort((x, y) => sim[i][y] - sim[i][x]);

    const pega: number[] = [];
    for (const j of cand) {
      if (entrada[j] >= LIMITE_ENTRADA) continue;
      pega.push(j);
      entrada[j]++;
      if (pega.length === 4) break;
    }
    escolhas[i] = pega;
  }

  const itemArtigo = (a: LinhaArtigo): Item => ({ titulo: a.title, rota: `/blog/${a.link_do_artigo}`, imagem: a.image_url || ogPadrao });
  const itemVideo = (v: LinhaVideo): Item => ({ titulo: v.novo_titulo, rota: `/video/${v.slug}`, imagem: `https://img.youtube.com/vi/${v.video_id}/mqdefault.jpg` });

  const out = new Map<string, Relacionados>();
  for (let i = 0; i < nA; i++) {
    const notas = V.map((v, k) => [produto(A[i], v), k] as [number, number]).sort((x, y) => y[0] - x[0]).slice(0, 2);
    out.set(artigos[i].link_do_artigo, {
      artigos: escolhas[i].map((j) => itemArtigo(artigos[j])),
      videos: notas.filter(([s]) => s > 0).map(([, k]) => itemVideo(videos[k])),
    });
  }

  return out;
}
