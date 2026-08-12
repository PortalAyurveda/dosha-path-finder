import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toPng } from "html-to-image";
import { Download, Play, ArrowUp, ArrowDown, MapPin, Link2, Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SITE = "https://portalayurveda.com";

const LOGO = "https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo.svg";

type Formato = "story" | "feed";

const FORMATOS: Record<Formato, { w: number; h: number; label: string }> = {
  story: { w: 1080, h: 1920, label: "Story 1080×1920" },
  feed: { w: 1080, h: 1350, label: "Feed 1080×1350" },
};

const RENDER_W = 360;

const CREME = "#FBF6EE";
const TINTA = "#352F54";
const CORAL = "#FF7676";
const DOURADO = "#E0A020";
const AZUL = "#6A88FB";

// ---------- temas de fundo (variação de cor entre cards) ----------
type Tema = {
  key: string;
  label: string;
  swatch: string;
  bg: string;
  texto: string;
  escuro: boolean;
  /** filtro aplicado ao símbolo do Portal; null = cores originais */
  logoFilter: string | null;
};

const TEMAS: Tema[] = [
  {
    key: "creme",
    label: "Creme",
    swatch: CREME,
    bg: CREME,
    texto: TINTA,
    escuro: false,
    logoFilter: null,
  },
  {
    key: "roxo",
    label: "Roxo",
    swatch: TINTA,
    bg: `linear-gradient(165deg, #453D70 0%, ${TINTA} 55%, #241F3E 100%)`,
    texto: CREME,
    escuro: true,
    logoFilter: "brightness(0) invert(1)",
  },
  {
    key: "coral",
    label: "Coral",
    swatch: CORAL,
    bg: `linear-gradient(165deg, #FFDCD6 0%, #FFF1EC 45%, ${CREME} 100%)`,
    texto: TINTA,
    escuro: false,
    logoFilter: null,
  },
  {
    key: "dourado",
    label: "Dourado",
    swatch: DOURADO,
    bg: `linear-gradient(165deg, #F8E4BE 0%, #FDF3DF 45%, ${CREME} 100%)`,
    texto: TINTA,
    escuro: false,
    logoFilter: null,
  },
  {
    key: "azul",
    label: "Azul",
    swatch: AZUL,
    bg: `linear-gradient(165deg, #DDE3FF 0%, #EFF2FF 45%, ${CREME} 100%)`,
    texto: TINTA,
    escuro: false,
    logoFilter: null,
  },
];

const TemaCtx = createContext<Tema>(TEMAS[0]);
const useTema = () => useContext(TemaCtx);

/** Cor de acento legível sobre o fundo do tema atual. */
function acento(tema: Tema, cor: string) {
  return tema.escuro ? tema.texto : cor;
}

const DOSHA_COLOR: Record<string, string> = {
  vata: "#6B8FE8",
  pitta: "#F0857F",
  kapha: "#57BE86",
};


// Área segura em px de tela (RENDER_W = 360). No story protege 13% verticais
// (Instagram sobrepõe UI de ~250px em cima/baixo em 1920); no feed protege
// ~11% verticais (grade 4:5 vira quadrado central).
const SAFE: Record<Formato, { x: number; y: number }> = {
  story: { x: 26, y: 44 },
  feed: { x: 24, y: 36 },
};

// Tipografia em px de tela (RENDER_W = 360). Multiplicada por 3 na exportação.
const T: Record<
  Formato,
  {
    eyebrow: number;
    titulo: number;
    tituloG: number;
    corpo: number;
    rotulo: number;
    numeroHero: number;
    rodape: number;
    selo: number;
  }
> = {
  story: {
    eyebrow: 11,
    titulo: 26,
    tituloG: 32,
    corpo: 14,
    rotulo: 12,
    numeroHero: 64,
    rodape: 11,
    selo: 11,
  },
  feed: {
    eyebrow: 10,
    titulo: 22,
    tituloG: 28,
    corpo: 13,
    rotulo: 11,
    numeroHero: 56,
    rodape: 10,
    selo: 10,
  },
};

const Serif: React.CSSProperties = { fontFamily: "'Roboto Serif', Georgia, serif" };

// ---------- helpers ----------
const IS_IOS =
  typeof navigator !== "undefined" &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1));

function decodeSafe(img: HTMLImageElement): Promise<void> {
  return (img.decode?.() ?? Promise.resolve()).then(
    () => undefined,
    () => undefined,
  );
}

// Garante que <img> e backgrounds CSS estejam decodificados antes da captura
async function prepararImagens(el: HTMLElement) {
  const tags = Array.from(el.querySelectorAll("img"));
  const urls = new Set<string>();
  el.querySelectorAll<HTMLElement>("*").forEach((n) => {
    const bg = getComputedStyle(n).backgroundImage;
    if (!bg || bg === "none") return;
    for (const m of bg.matchAll(/url\(["']?(.*?)["']?\)/g)) {
      if (m[1]) urls.add(m[1]);
    }
  });
  await Promise.all([
    ...tags.map((t) => decodeSafe(t)),
    ...Array.from(urls).map((u) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.src = u;
      return decodeSafe(im);
    }),
  ]);
}

async function gerarDataUrl(el: HTMLElement, formato: Formato) {
  const target = FORMATOS[formato];
  const opts = {
    pixelRatio: target.w / el.offsetWidth,
    cacheBust: false,
    backgroundColor: undefined,
    width: el.offsetWidth,
    height: el.offsetHeight,
  };
  await prepararImagens(el);
  // Safari: a primeira captura só aquece o cache interno de imagens
  await toPng(el, opts).catch(() => "");
  return toPng(el, opts);
}

async function gerarArquivo(el: HTMLElement, filename: string, formato: Formato) {
  const dataUrl = await gerarDataUrl(el, formato);
  const blob = await (await fetch(dataUrl)).blob();
  return new File([blob], filename, { type: "image/png" });
}

function baixarArquivo(file: File) {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

// Compartilha (iOS → "Salvar Imagem" na galeria) com fallback pra download
async function salvarArquivo(file: File) {
  const nav = navigator as Navigator & { canShare?: (d: any) => boolean };
  if (nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file] } as ShareData);
      return;
    } catch (e: any) {
      if (e?.name === "AbortError") return;
    }
  }
  baixarArquivo(file);
}

function tituloSize(text: string, t: (typeof T)[Formato]) {
  const len = (text || "").length;
  if (len <= 30) return t.tituloG;
  if (len <= 55) return t.titulo;
  return Math.max(14, t.titulo - 4);
}

// Trunca no último espaço antes do limite, sem partir palavra.
function truncar(text: string | undefined | null, max: number): string {
  const s = (text || "").trim();
  if (!s || s.length <= max) return s;
  const cut = s.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  return (sp > 8 ? cut.slice(0, sp) : cut).replace(/[.,;:!?-]+$/, "") + "…";
}

// Aproxima caracteres/linha considerando fontSize e largura útil.
function limiteLinhas(fontSize: number, larguraUtil: number, linhas: number) {
  const charW = fontSize * 0.52;
  return Math.max(20, Math.floor((larguraUtil / charW) * linhas));
}

function normalizarSintomas(v: unknown): string[] {
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(Boolean).slice(0, 3).map(String);
  return [String(v)];
}

// ---------- shell do card ----------
function Card({
  formato,
  children,
  bg,
  innerRef,
}: {
  formato: Formato;
  children: React.ReactNode;
  bg?: string;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  const f = FORMATOS[formato];
  const tema = useTema();
  const ratio = f.h / f.w;
  const marcaSize = formato === "story" ? 26 : 22;
  return (
    <div
      ref={innerRef}
      className="relative overflow-hidden shadow-sm"
      style={{
        width: RENDER_W,
        height: RENDER_W * ratio,
        background: bg ?? tema.bg,
        color: tema.texto,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* símbolo no canto superior direito */}
      <img
        src={LOGO}
        width={marcaSize}
        height={marcaSize}
        alt=""
        style={{
          position: "absolute",
          top: SAFE[formato].y - 2,
          right: SAFE[formato].x,
          opacity: 1,
          filter: tema.logoFilter ?? undefined,
          zIndex: 2,
        }}
      />
      {children}
    </div>
  );
}


// bloco de conteúdo dentro da área segura (para texto/selo/rodapé)
function SafeArea({
  formato,
  children,
  style,
}: {
  formato: Formato;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  const s = SAFE[formato];
  return (
    <div
      className="w-full h-full flex flex-col"
      style={{
        paddingLeft: s.x,
        paddingRight: s.x,
        paddingTop: s.y,
        paddingBottom: s.y,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const Selo = ({
  children,
  color = DOURADO,
  formato,
}: {
  children: React.ReactNode;
  color?: string;
  formato: Formato;
}) => (
  <span
    style={{
      background: color,
      color: "#fff",
      padding: formato === "story" ? "5px 12px" : "4px 10px",
      fontSize: T[formato].selo,
      letterSpacing: 1.5,
      fontWeight: 700,
      textTransform: "uppercase",
      display: "inline-block",
      borderRadius: 999,
      alignSelf: "flex-start",
    }}
  >
    {children}
  </span>
);

function Eyebrow({ children, formato }: { children: React.ReactNode; formato: Formato }) {
  return (
    <div
      style={{
        fontSize: T[formato].eyebrow,
        letterSpacing: 2,
        textTransform: "uppercase",
        opacity: 0.65,
        fontWeight: 600,
      }}
    >
      {children}
    </div>
  );
}

// Rodapé removido: o rodapé (logo + portalayurveda.com + CTA) é inserido
// manualmente no Instagram. Mantemos só o espaçador flexível.
function Rodape(_props: { formato: Formato; cta?: string; ctaColor?: string }) {
  return <div className="w-full mt-auto" />;
}



// ---------- tipos ----------
type Dados = {
  metricas: any;
  testes_total: number;
  conversas: { pergunta: string; resposta: string }[];
  videos: { titulo: string; resumo: string; thumb: string; slug: string; tags?: string | null }[];
  artigos: { titulo: string; resumo: string; imagem: string; slug: string; tags?: string | null }[];
  receitas: {
    titulo: string;
    imagem: string;
    resumo: string;
    efeito: string;
    ingredientes: string;
    tags?: string[] | null;
    slug?: string | null;
    video_slug?: string | null;
  }[];
  cursos: { titulo: string; capa: string; slug: string; aulas: number }[];
};

// ---------- cards ----------
function CardClima({ m, testesTotal, formato }: { m: any; testesTotal: number; formato: Formato }) {
  const tema = useTema();
  if (!m) return null;

  const agr = (m.dosha_agravando || "vata").toLowerCase();
  const color = DOSHA_COLOR[agr] || CORAL;
  const sintomas = normalizarSintomas(m[`sintoma_${agr}`]);
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  const titulo = `${m.estacao}: o ${agr} da base subiu ${m.dosha_agravando_pct}%`;
  const tSize = tituloSize(titulo, T[formato]);

  const pillar = (nome: string, v: number) => {
    const up = Number(v) >= 0;
    return (
      <div
        key={nome}
        className="flex items-center rounded-full"
        style={{
          background: DOSHA_COLOR[nome],
          color: "#fff",
          fontSize: T[formato].rotulo,
          fontWeight: 600,
          padding: "5px 11px",
          gap: 4,
        }}
      >
        {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {nome} {Math.abs(Number(v) || 0)}%
      </div>
    );
  };

  return (
    <Card
      formato={formato}
      bg={tema.key === "creme" ? `linear-gradient(160deg, ${color}22, ${CREME} 60%)` : undefined}
    >

      <SafeArea formato={formato}>
        <Eyebrow formato={formato}>Clima × Doshas</Eyebrow>
        <div
          style={{
            ...Serif,
            fontSize: tSize,
            lineHeight: 1.12,
            marginTop: 16,
            fontWeight: 600,
          }}
        >
          {truncar(titulo, 90)}
        </div>

        {sintomas.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <Eyebrow formato={formato}>sintoma mais comum</Eyebrow>
            {sintomas.length === 1 ? (
              <div
                style={{
                  ...Serif,
                  fontSize: T[formato].titulo - 4,
                  lineHeight: 1.2,
                  marginTop: 6,
                  fontStyle: "italic",
                  color: color,
                }}
              >
                {truncar(sintomas[0], limiteLinhas(T[formato].titulo - 4, larguraUtil, 2))}
              </div>
            ) : (
              <ul style={{ marginTop: 8, paddingLeft: 0, listStyle: "none" }}>
                {sintomas.map((s, i) => (
                  <li
                    key={i}
                    style={{
                      fontSize: T[formato].corpo,
                      lineHeight: 1.35,
                      marginTop: 4,
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span style={{ color }}>•</span>
                    <span>{truncar(s, limiteLinhas(T[formato].corpo, larguraUtil - 16, 1))}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {formato === "feed" && (
          <div
            style={{
              fontSize: T[formato].rodape,
              marginTop: 14,
              opacity: 0.6,
              lineHeight: 1.4,
            }}
          >
            observado na comparação entre centenas de pessoas que refizeram o teste
          </div>
        )}

        <div className="flex flex-wrap" style={{ gap: 8, marginTop: 20 }}>
          {pillar("vata", m.var_vata)}
          {pillar("pitta", m.var_pitta)}
          {pillar("kapha", m.var_kapha)}
        </div>

        <div style={{ marginTop: 16, fontSize: T[formato].rodape, opacity: 0.7 }}>
          dados de {Number(testesTotal).toLocaleString("pt-BR")} testes de dosha
        </div>

        <Rodape formato={formato} cta="faça seu teste" ctaColor={color} />
      </SafeArea>
    </Card>
  );
}

function CardConversa({ p, r, formato }: { p: string; r: string; formato: Formato }) {
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  const limP = limiteLinhas(T[formato].corpo, larguraUtil * 0.85, 4);
  const limR = limiteLinhas(T[formato].corpo, larguraUtil * 0.9, formato === "story" ? 8 : 6);
  return (
    <Card formato={formato}>
      <SafeArea formato={formato}>
        <Eyebrow formato={formato}>conversa real · anônima</Eyebrow>
        <div
          className="flex-1 flex flex-col"
          style={{ justifyContent: "center", marginTop: 16 }}
        >
          <div
            className="self-end px-3.5 py-2.5 rounded-2xl rounded-br-sm"
            style={{
              background: "#EEEEEE",
              fontSize: T[formato].corpo,
              lineHeight: 1.45,
              maxWidth: "85%",
              marginBottom: 12,
            }}
          >
            {truncar(p, limP)}
          </div>
          <div
            className="self-start px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
            style={{
              background: "#EDE7FA",
              fontSize: T[formato].corpo,
              lineHeight: 1.45,
              maxWidth: "90%",
            }}
          >
            {truncar(r, limR)}
          </div>
        </div>
        <Rodape formato={formato} cta="converse com a akasha" ctaColor={TINTA} />
      </SafeArea>
    </Card>
  );
}

// Normaliza tags vindas como string ("a, b, c") ou array; remove emojis e "#".
function normalizarTags(v: unknown, max = 3): string[] {
  let bruto: string[] = [];
  if (Array.isArray(v)) bruto = v.map((x) => String(x ?? ""));
  else if (typeof v === "string") bruto = v.split(/[,;|]/);
  return bruto
    .map((s) =>
      s
        .replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, "")
        .replace(/#/g, "")
        .trim(),
    )
    .filter((s) => s.length > 1 && s.length <= 28)
    .slice(0, max);
}

function Chips({ tags, formato, color }: { tags: string[]; formato: Formato; color: string }) {
  const tema = useTema();
  if (!tags.length) return null;
  const c = acento(tema, color);
  return (
    <div className="flex flex-wrap" style={{ gap: 6, marginTop: 14 }}>
      {tags.map((tag, i) => (
        <span
          key={i}
          style={{
            fontSize: T[formato].rotulo - 1,
            fontWeight: 600,
            color: c,
            border: `1px solid ${c}55`,
            background: `${c}14`,
            borderRadius: 999,
            padding: formato === "story" ? "4px 10px" : "3px 9px",
            lineHeight: 1.2,
          }}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}

// Card padrão de conteúdo: selo → título → descrição → tags → foto na base → rodapé.
function CardConteudo({
  formato,
  selo,
  cor,
  titulo,
  descricao,
  extra,
  tags,
  imagem,
  play,
  cta,
  fallbackBg = "#ddd",
}: {
  formato: Formato;
  selo: string;
  cor: string;
  titulo: string;
  descricao?: string | null;
  extra?: React.ReactNode;
  tags: string[];
  imagem?: string | null;
  play?: boolean;
  cta: string;
  fallbackBg?: string;
}) {
  const t = T[formato];
  const story = formato === "story";
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  // No story o texto ganha escala maior e a foto cresce ocupando o espaço que
  // sobra — evita o vão vazio entre bloco de texto e imagem.
  const tSize = tituloSize(titulo, t) + (story ? 5 : 0);
  const corpoSize = story ? t.corpo + 2 : t.corpo;
  const linhasDesc = story ? 7 : 3;

  return (
    <Card formato={formato}>
      <SafeArea formato={formato}>
        <Selo formato={formato} color={cor}>
          {selo}
        </Selo>

        <div
          style={{
            ...Serif,
            fontSize: tSize,
            lineHeight: 1.12,
            fontWeight: 600,
            marginTop: 14,
          }}
        >
          {truncar(titulo, 90)}
        </div>

        {descricao ? (
          <div
            style={{
              fontSize: corpoSize,
              lineHeight: 1.5,
              opacity: 0.85,
              marginTop: 10,
            }}
          >
            {truncar(descricao, limiteLinhas(corpoSize, larguraUtil, linhasDesc))}
          </div>
        ) : null}

        {extra}

        <Chips tags={tags} formato={formato} color={cor} />

        {imagem ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 18,
              overflow: "hidden",
              background: `url(${imagem}) center/cover no-repeat, ${fallbackBg}`,
              ...(story
                ? { marginTop: 22, flexGrow: 1, flexShrink: 1, minHeight: "42%" }
                : { marginTop: "auto", height: "34%", flexShrink: 0 }),
            }}
          >
            {play ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "linear-gradient(180deg, #0000, #0003)" }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: 64, height: 64, background: "#fffc", color: TINTA }}
                >
                  <Play size={26} fill={TINTA} />
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div style={{ marginTop: "auto" }} />
        )}


        <Rodape formato={formato} cta={cta} ctaColor={cor} />
      </SafeArea>
    </Card>
  );
}

function CardReceita({ r, formato }: { r: Dados["receitas"][number]; formato: Formato }) {
  const t = T[formato];
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  return (
    <CardConteudo
      formato={formato}
      selo="Receita do Portal"
      cor={DOURADO}
      titulo={r.titulo}
      descricao={r.resumo || r.efeito}
      tags={normalizarTags(r.tags)}
      imagem={r.imagem}
      cta="receba a receita"
      extra={
        formato === "feed" && r.ingredientes ? (
          <div style={{ marginTop: 10 }}>
            <Eyebrow formato={formato}>ingredientes</Eyebrow>
            <div
              style={{
                fontSize: t.corpo - 1,
                lineHeight: 1.4,
                opacity: 0.8,
                marginTop: 4,
              }}
            >
              {truncar(r.ingredientes, limiteLinhas(t.corpo - 1, larguraUtil, 2))}
            </div>
          </div>
        ) : null
      }
    />
  );
}

function CardVideo({ v, formato }: { v: Dados["videos"][number]; formato: Formato }) {
  return (
    <CardConteudo
      formato={formato}
      selo="Vídeo"
      cor={CORAL}
      titulo={v.titulo}
      descricao={v.resumo}
      tags={normalizarTags(v.tags)}
      imagem={v.thumb}
      play
      fallbackBg="#333"
      cta="assista no portal"
    />
  );
}

function CardArtigo({ a, formato }: { a: Dados["artigos"][number]; formato: Formato }) {
  return (
    <CardConteudo
      formato={formato}
      selo="Artigo"
      cor={AZUL}
      titulo={a.titulo}
      descricao={a.resumo}
      tags={normalizarTags(a.tags)}
      imagem={a.imagem}
      fallbackBg="#ccc"
      cta="leia no portal"
    />
  );
}


function CardCurso({ c, formato }: { c: Dados["cursos"][number]; formato: Formato }) {
  const t = T[formato];
  const tSize = tituloSize(c.titulo, t);
  // Dimensão de capa fixa (independente de título) para uniformidade entre cards.
  const capaSize = formato === "story" ? 180 : 150;
  return (
    <Card formato={formato}>
      <SafeArea formato={formato} style={{ alignItems: "center", textAlign: "center" }}>
        <Selo color={AZUL} formato={formato}>
          Curso do Portal
        </Selo>
        <div
          style={{
            width: capaSize,
            height: capaSize,
            marginTop: 24,
            background: c.capa ? `url(${c.capa}) center/cover no-repeat, #eee` : "#eee",
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
        <div
          style={{
            ...Serif,
            fontSize: tSize,
            lineHeight: 1.15,
            fontWeight: 600,
            marginTop: 24,
          }}
        >
          {truncar(c.titulo, 70)}
        </div>
        <div style={{ fontSize: t.corpo, opacity: 0.8, marginTop: 10 }}>
          {c.aulas} aulas com o professor Edson Osorio
        </div>
        <Rodape formato={formato} cta="quero o curso" ctaColor={AZUL} />
      </SafeArea>
    </Card>
  );
}

function CardNumeros({ d, formato }: { d: Dados; formato: Formato }) {
  const t = T[formato];
  return (
    <Card formato={formato}>
      <SafeArea formato={formato}>
        <Eyebrow formato={formato}>Números do Portal</Eyebrow>
        <div className="flex-1 flex flex-col justify-center" style={{ gap: 28 }}>
          <div>
            <div
              style={{
                ...Serif,
                fontSize: t.numeroHero,
                lineHeight: 1,
                fontWeight: 700,
                color: TINTA,
              }}
            >
              {Number(d.testes_total).toLocaleString("pt-BR")}
            </div>
            <div style={{ fontSize: t.corpo, marginTop: 8 }}>testes de dosha realizados</div>
          </div>
          <div>
            <div
              style={{
                ...Serif,
                fontSize: t.numeroHero * 0.5,
                fontWeight: 600,
                color: CORAL,
              }}
            >
              {d.metricas?.terapeutas ?? 0}
            </div>
            <div style={{ fontSize: t.corpo, marginTop: 4 }}>terapeutas pelo Brasil</div>
          </div>
          <div>
            <div
              style={{
                ...Serif,
                fontSize: t.numeroHero * 0.5,
                fontWeight: 600,
                color: DOURADO,
              }}
            >
              {d.metricas?.testes_7d ?? 0}
            </div>
            <div style={{ fontSize: t.corpo, marginTop: 4 }}>
              pessoas se conheceram esta semana
            </div>
          </div>
        </div>
        <Rodape formato={formato} cta="conheça o portal" ctaColor={CORAL} />
      </SafeArea>
    </Card>
  );
}

function CardConviteTerapeutas({ formato }: { formato: Formato }) {
  const t = T[formato];
  const tema = useTema();
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  // Convite é chamada pra ação: ganha fundo com cor da marca (coral → dourado),
  // exceto quando o tema escolhido já é escuro.
  const bg = tema.escuro
    ? undefined
    : `linear-gradient(160deg, ${CORAL}3D 0%, ${DOURADO}33 45%, ${CREME} 100%)`;
  return (
    <Card formato={formato} bg={bg}>
      <SafeArea formato={formato}>
        <MapPin size={formato === "story" ? 40 : 32} color={acento(tema, CORAL)} />
        <div style={{ marginTop: 16 }}>
          <Eyebrow formato={formato}>Convite</Eyebrow>
        </div>
        <div
          style={{
            ...Serif,
            fontSize: t.tituloG,
            lineHeight: 1.15,
            fontWeight: 600,
            marginTop: 12,
          }}
        >
          Você é terapeuta de Ayurveda?
        </div>
        <div style={{ fontSize: t.corpo, lineHeight: 1.5, marginTop: 16 }}>
          {truncar(
            "Cadastre-se nos Terapeutas do Brasil e seja encontrada por quem procura cuidado na sua cidade.",
            limiteLinhas(t.corpo, larguraUtil, 4),
          )}
        </div>
        <Rodape formato={formato} cta="cadastre-se" ctaColor={CORAL} />
      </SafeArea>
    </Card>

  );
}

// ---------- cards de oferta (levam para /assinar) ----------
const VERDE = "#57BE86";

const IMG_RECEITA =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/receita-kitchari-com-salsa-e-oleo-vegetal.webp";
const IMG_AKASHA =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/akasha-versao-4-1.webp";
const IMG_PROFESSOR =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/b8f47f-5f003e6165b44645b7163ec3dd646d32mv2-1.jpg";

type Oferta = {
  key: string;
  selo: string;
  cor: string;
  titulo: string;
  descricao: string;
  precoRiscado?: string;
  preco: string;
  precoSufixo?: string;
  nota: string;
  bullets: string[];
  prova: string;
  imagem: string;
};

function ofertas(dados: Dados | null): Oferta[] {
  const capaCurso =
    (dados?.cursos || []).find((c) => (c.slug || "").includes("rotina"))?.capa || IMG_PROFESSOR;
  return [
    {
      key: "oferta-rotina",
      selo: "Minha Rotina",
      cor: VERDE,
      titulo: "Sua semana inteira, já montada.",
      descricao:
        "Café, almoço, jantar, lanches e tônicos — montados para o seu dosha, com o preparo e o porquê de cada item.",
      preco: "R$ 30",
      precoSufixo: "/mês",
      nota: "menos de R$ 1 por dia",
      bullets: [
        "Rotina dos 7 dias, pronta",
        "Feita para o seu dosha",
        "Revisão mensal do seu quadro",
      ],
      prova: "2.700+ testes de dosha já feitos no Portal",
      imagem: IMG_RECEITA,
    },
    {
      key: "oferta-premium",
      selo: "Portal Premium",
      cor: CORAL,
      titulo: "O Ayurveda inteiro, moldado a você.",
      descricao:
        "Sua rotina, a Akasha para conversar a qualquer hora e 900+ aulas do professor Edson Osorio.",
      preco: "R$ 79,90",
      precoSufixo: "/mês",
      nota: "ou R$ 49,75/mês assinando o ano",
      bullets: [
        "Rotina completa da semana",
        "Akasha ilimitada, dia e madrugada",
        "Acervo com 900+ aulas",
        "Cancele quando quiser",
      ],
      prova: "4.500+ alunas formadas pelo professor",
      imagem: IMG_AKASHA,
    },
    {
      key: "oferta-anual",
      selo: "Premium Anual",
      cor: DOURADO,
      titulo: "Um ano inteiro de Ayurveda.",
      descricao:
        "R$ 597 cobrados uma vez por ano — com o curso Rotinas Diárias incluso (valor R$ 99).",
      precoRiscado: "R$ 79,90",
      preco: "R$ 49,75",
      precoSufixo: "/mês",
      nota: "R$ 597 cobrados uma vez por ano",
      bullets: [
        "Tudo do Premium",
        'Curso "Rotinas Diárias" incluso',
        "Revisão mensal do seu quadro",
        "12 meses garantidos",
      ],
      prova: "O plano mais vantajoso do Portal",
      imagem: capaCurso,
    },
  ];
}

function CardOferta({ o, formato }: { o: Oferta; formato: Formato }) {
  const t = T[formato];
  const tema = useTema();
  const story = formato === "story";
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  const cor = acento(tema, o.cor);
  const tSize = tituloSize(o.titulo, t) + (story ? 4 : 0);
  const corpoSize = story ? t.corpo + 1 : t.corpo;

  return (
    <Card formato={formato}>
      <SafeArea formato={formato}>
        <Selo formato={formato} color={o.cor}>
          {o.selo}
        </Selo>

        <div
          style={{
            ...Serif,
            fontSize: tSize,
            lineHeight: 1.12,
            fontWeight: 600,
            marginTop: 14,
          }}
        >
          {o.titulo}
        </div>

        <div style={{ fontSize: corpoSize, lineHeight: 1.5, opacity: 0.85, marginTop: 10 }}>
          {truncar(o.descricao, limiteLinhas(corpoSize, larguraUtil, story ? 4 : 3))}
        </div>

        {/* preço */}
        <div style={{ marginTop: story ? 18 : 14 }}>
          {o.precoRiscado ? (
            <div
              style={{
                fontSize: t.rotulo,
                opacity: 0.55,
                textDecoration: "line-through",
                marginBottom: 2,
              }}
            >
              {o.precoRiscado}
            </div>
          ) : null}
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ ...Serif, fontSize: story ? 40 : 34, fontWeight: 700, color: cor }}>
              {o.preco}
            </span>
            {o.precoSufixo ? (
              <span style={{ fontSize: t.corpo, opacity: 0.7 }}>{o.precoSufixo}</span>
            ) : null}
          </div>
          <div style={{ fontSize: t.rotulo, marginTop: 3, color: cor, fontWeight: 600 }}>
            {o.nota}
          </div>
        </div>

        {/* bullets */}
        <ul style={{ listStyle: "none", padding: 0, margin: 0, marginTop: story ? 16 : 12 }}>
          {o.bullets.map((b, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: corpoSize,
                lineHeight: 1.4,
                marginTop: i === 0 ? 0 : 7,
              }}
            >
              <Check size={14} color={cor} style={{ marginTop: 3, flexShrink: 0 }} />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <div style={{ fontSize: t.rodape, opacity: 0.6, marginTop: 12 }}>{o.prova}</div>

        <div
          style={{
            width: "100%",
            borderRadius: 18,
            overflow: "hidden",
            background: `url(${o.imagem}) center/cover no-repeat, #e5e0d6`,
            ...(story
              ? { marginTop: 20, flexGrow: 1, flexShrink: 1, minHeight: "26%" }
              : { marginTop: "auto", height: "24%", flexShrink: 0 }),
          }}
        />

        <Rodape formato={formato} cta="assine no portal" ctaColor={o.cor} />
      </SafeArea>
    </Card>
  );
}

// ---------- card exportável ----------
function CardExport({
  item,
  formato,
  copiado,
  onCopiar,
}: {
  item: { key: string; filename: string; node: React.ReactNode };
  formato: Formato;
  copiado: boolean;
  onCopiar: () => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const pronto = useRef<File | null>(null);
  const [gerando, setGerando] = useState(false);
  const [visivel, setVisivel] = useState(false);

  // só pré-gera quando o card está na tela
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setVisivel(true)),
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // pré-gera o PNG em segundo plano (debounce) para o share funcionar no iOS
  useEffect(() => {
    if (!visivel) return;
    let cancelado = false;
    pronto.current = null;
    const t = setTimeout(async () => {
      const el = ref.current;
      if (!el) return;
      try {
        const file = await gerarArquivo(el, item.filename, formato);
        if (!cancelado) pronto.current = file;
      } catch {
        /* silencioso: gera na hora do clique */
      }
    }, 600);
    return () => {
      cancelado = true;
      clearTimeout(t);
    };
  }, [visivel, formato, item.filename, item.node]);

  const salvar = async () => {
    if (pronto.current) {
      await salvarArquivo(pronto.current);
      return;
    }
    const el = ref.current;
    if (!el) return;
    setGerando(true);
    try {
      const file = await gerarArquivo(el, item.filename, formato);
      pronto.current = file;
      await salvarArquivo(file);
    } catch {
      toast({ title: "Não consegui gerar a imagem", variant: "destructive" });
    } finally {
      setGerando(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div ref={ref}>{item.node}</div>
      <Button size="sm" variant="outline" className="gap-2" onClick={salvar} disabled={gerando}>
        {gerando ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        {IS_IOS ? "Salvar / Compartilhar" : "Baixar PNG"}
      </Button>
      <Button size="sm" variant="ghost" className="gap-2" onClick={onCopiar}>
        {copiado ? <Check className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
        Copiar link
      </Button>
    </div>
  );
}

// ---------- grupo ----------
function Grupo({
  titulo,
  formato,
  itens,
  busca,
}: {
  titulo: string;
  formato: Formato;
  itens: { key: string; filename: string; texto?: string; url?: string; node: React.ReactNode }[];
  busca?: string;
}) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  const [copiado, setCopiado] = useState<string | null>(null);
  const copiarUrl = async (key: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiado(key);
    toast({ title: "Link copiado", description: url });
    setTimeout(() => setCopiado((k) => (k === key ? null : k)), 2000);
  };
  const q = (busca || "").trim().toLowerCase();
  const visiveis = q
    ? itens.filter(
        (it) =>
          (it.texto || "").toLowerCase().includes(q) || titulo.toLowerCase().includes(q),
      )
    : itens;
  if (!visiveis.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-lg font-heading font-bold text-foreground mb-4">{titulo}</h2>
      <div className="flex flex-wrap gap-6">
        {visiveis.map((it) => (
          <CardExport
            key={it.key}
            item={it}
            formato={formato}
            copiado={copiado === it.key}
            onCopiar={() => copiarUrl(it.key, it.url || SITE)}
          />
        ))}
      </div>
    </section>
  );
}

// ---------- página ----------
const AdminMockups = () => {
  const [formato, setFormato] = useState<Formato>("story");
  const [temaKey, setTemaKey] = useState<string>(TEMAS[0].key);
  const tema = TEMAS.find((t) => t.key === temaKey) ?? TEMAS[0];

  const [busca, setBusca] = useState("");
  const [dados, setDados] = useState<Dados | null>(null);
  const [restrito, setRestrito] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelado = false;
    (async () => {
      try {
        const { data, error } = await supabase.rpc("mockups_dados" as any);
        if (cancelado) return;
        if (error) {
          console.error("[AdminMockups] erro em mockups_dados:", error);
          setErro(error.message || "Erro ao carregar mockups.");
        } else if (data === null) {
          setRestrito(true);
        } else {
          setDados(data as unknown as Dados);
        }
      } catch (e: any) {
        if (cancelado) return;
        console.error("[AdminMockups] exceção em mockups_dados:", e);
        setErro(e?.message || "Erro ao carregar mockups.");
      } finally {
        if (!cancelado) setLoading(false);
      }
    })();
    return () => {
      cancelado = true;
    };
  }, []);

  const grupos = useMemo(() => {
    if (!dados) return [];
    return [
      {
        titulo: "Clima × Doshas",
        itens: [
          {
            key: "clima",
            filename: `clima-${formato}.png`,
            url: `${SITE}/metricas`,
            node: <CardClima m={dados.metricas} testesTotal={dados.testes_total} formato={formato} />,
          },
        ],
      },
      {
        titulo: "Números do Portal",
        itens: [
          {
            key: "numeros",
            filename: `numeros-${formato}.png`,
            url: `${SITE}/metricas`,
            node: <CardNumeros d={dados} formato={formato} />,
          },
        ],
      },
      {
        titulo: "Convite terapeutas",
        itens: [
          {
            key: "convite-terapeutas",
            filename: `convite-terapeutas-${formato}.png`,
            url: `${SITE}/terapeutas-do-brasil`,
            node: <CardConviteTerapeutas formato={formato} />,
          },
        ],
      },
      {
        titulo: "Ofertas",
        itens: ofertas(dados).map((o) => ({
          key: o.key,
          filename: `${o.key}-${formato}.png`,
          texto: `${o.selo} ${o.titulo} ${o.descricao} ${o.bullets.join(" ")}`,
          url: `${SITE}/assinar`,
          node: <CardOferta o={o} formato={formato} />,
        })),
      },

      {
        titulo: "Conversas da Akasha",
        itens: (dados.conversas || []).map((c, i) => ({
          key: `conv-${i}`,
          filename: `akasha-${i + 1}-${formato}.png`,
          texto: `${c.pergunta} ${c.resposta}`,
          url: SITE,
          node: <CardConversa p={c.pergunta} r={c.resposta} formato={formato} />,
        })),
      },
      {
        titulo: "Receitas",
        itens: (dados.receitas || []).map((r, i) => ({
          key: `rec-${i}`,
          filename: `receita-${i + 1}-${formato}.png`,
          texto: `${r.titulo} ${r.resumo || ""} ${(r.tags || []).join(" ")}`,
          url: r.video_slug
            ? `${SITE}/video/${r.video_slug}`
            : r.slug
              ? `${SITE}/minha-rotina?item=${r.slug}`
              : SITE,
          node: <CardReceita r={r} formato={formato} />,
        })),
      },
      {
        titulo: "Vídeos",
        itens: (dados.videos || []).map((v, i) => ({
          key: `vid-${i}`,
          filename: `video-${i + 1}-${formato}.png`,
          texto: `${v.titulo} ${v.resumo || ""} ${v.tags || ""}`,
          url: `${SITE}/video/${v.slug}`,
          node: <CardVideo v={v} formato={formato} />,
        })),
      },
      {
        titulo: "Artigos",
        itens: (dados.artigos || []).map((a, i) => ({
          key: `art-${i}`,
          filename: `artigo-${i + 1}-${formato}.png`,
          texto: `${a.titulo} ${a.resumo || ""} ${a.tags || ""}`,
          url: `${SITE}/blog/${a.slug}`,
          node: <CardArtigo a={a} formato={formato} />,
        })),
      },
      {
        titulo: "Cursos",
        itens: (dados.cursos || []).map((c, i) => ({
          key: `cur-${i}`,
          filename: `curso-${i + 1}-${formato}.png`,
          url: `${SITE}/cursos/${c.slug}`,
          node: <CardCurso c={c} formato={formato} />,
        })),
      },
    ];
  }, [dados, formato]);

  return (
    <TemaCtx.Provider value={tema}>
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="sticky top-[64px] z-[5] bg-card/80 backdrop-blur border-b border-border">
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">Formato:</span>
            <div className="flex gap-2">
              {(Object.keys(FORMATOS) as Formato[]).map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={formato === f ? "default" : "outline"}
                  onClick={() => setFormato(f)}
                >
                  {FORMATOS[f].label}
                </Button>
              ))}
            </div>

            <span className="text-sm font-medium ml-2">Cor:</span>
            <div className="flex gap-2">
              {TEMAS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemaKey(t.key)}
                  title={t.label}
                  aria-label={`Fundo ${t.label}`}
                  aria-pressed={temaKey === t.key}
                  className={`h-7 w-7 rounded-full border-2 transition ${
                    temaKey === t.key ? "border-foreground scale-110" : "border-border"
                  }`}
                  style={{ background: t.swatch }}
                />
              ))}
            </div>

            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por título, texto ou tag…"
              className="ml-auto h-9 w-full sm:w-72 rounded-md border border-border bg-background px-3 text-sm"
            />
          </div>
        </div>

        <main className="max-w-6xl mx-auto px-4 py-6">
          {!loading && erro && (
            <div className="text-center text-destructive py-20">Erro ao carregar: {erro}</div>
          )}
          {!loading && !erro && restrito && (
            <div className="text-center text-muted-foreground py-20">Página restrita.</div>
          )}
          {loading && (
            <div className="flex flex-wrap gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton
                  key={i}
                  style={{ width: RENDER_W, height: RENDER_W * (FORMATOS[formato].h / FORMATOS[formato].w) }}
                />
              ))}
            </div>
          )}
          {!loading &&
            !restrito &&
            !erro &&
            dados &&
            grupos.map((g) => (
              <Grupo key={g.titulo} titulo={g.titulo} formato={formato} itens={g.itens} busca={busca} />
            ))}
        </main>
      </div>
    </TemaCtx.Provider>
  );

};

export default AdminMockups;
