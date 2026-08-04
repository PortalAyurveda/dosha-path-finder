import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toPng } from "html-to-image";
import { Download, Play, ArrowUp, ArrowDown, MapPin } from "lucide-react";

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

const DOSHA_COLOR: Record<string, string> = {
  vata: "#6B8FE8",
  pitta: "#F0857F",
  kapha: "#57BE86",
};

// Área segura em px de tela (RENDER_W = 360). No story protege 13% verticais
// (Instagram sobrepõe UI de ~250px em cima/baixo em 1920); no feed protege
// ~11% verticais (grade 4:5 vira quadrado central).
const SAFE: Record<Formato, { x: number; y: number }> = {
  story: { x: 26, y: 88 },
  feed: { x: 24, y: 50 },
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
async function baixarCard(el: HTMLElement, filename: string, formato: Formato) {
  const target = FORMATOS[formato];
  const pixelRatio = target.w / el.offsetWidth;
  const dataUrl = await toPng(el, {
    pixelRatio,
    cacheBust: true,
    backgroundColor: CREME,
    width: el.offsetWidth,
    height: el.offsetHeight,
  });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
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
  const ratio = f.h / f.w;
  return (
    <div
      ref={innerRef}
      className="relative overflow-hidden shadow-sm"
      style={{
        width: RENDER_W,
        height: RENDER_W * ratio,
        background: bg ?? CREME,
        color: TINTA,
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
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

function Rodape({
  formato,
  cta,
  ctaColor = TINTA,
}: {
  formato: Formato;
  cta: string;
  ctaColor?: string;
}) {
  const logoSize = formato === "story" ? 22 : 18;
  const font = T[formato].rodape;
  return (
    <div
      className="flex items-center justify-between w-full mt-auto"
      style={{ paddingTop: formato === "story" ? 20 : 14, gap: 12 }}
    >
      <div className="flex items-center" style={{ gap: 8 }}>
        <img
          src={LOGO}
          width={logoSize}
          height={logoSize}
          alt=""
          style={{ filter: "brightness(0.28)" }}
        />
        <span style={{ fontSize: font, opacity: 0.75, color: TINTA }}>portalayurveda.com</span>
      </div>
      <span
        style={{
          fontSize: font,
          fontWeight: 700,
          color: ctaColor,
          textTransform: "lowercase",
          letterSpacing: 0.3,
        }}
      >
        {cta} →
      </span>
    </div>
  );
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
  }[];
  cursos: { titulo: string; capa: string; slug: string; aulas: number }[];
};

// ---------- cards ----------
function CardClima({ m, testesTotal, formato }: { m: any; testesTotal: number; formato: Formato }) {
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
    <Card formato={formato} bg={`linear-gradient(160deg, ${color}22, ${CREME} 60%)`}>
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
  if (!tags.length) return null;
  return (
    <div className="flex flex-wrap" style={{ gap: 6, marginTop: 14 }}>
      {tags.map((tag, i) => (
        <span
          key={i}
          style={{
            fontSize: T[formato].rotulo - 1,
            fontWeight: 600,
            color,
            border: `1px solid ${color}55`,
            background: `${color}14`,
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
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  const tSize = tituloSize(titulo, t);
  const alturaFoto = formato === "story" ? "40%" : "34%";
  const linhasDesc = formato === "story" ? 4 : 3;

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
              fontSize: t.corpo,
              lineHeight: 1.5,
              opacity: 0.85,
              marginTop: 10,
            }}
          >
            {truncar(descricao, limiteLinhas(t.corpo, larguraUtil, linhasDesc))}
          </div>
        ) : null}

        {extra}

        <Chips tags={tags} formato={formato} color={cor} />

        {imagem ? (
          <div
            style={{
              position: "relative",
              marginTop: "auto",
              width: "100%",
              height: alturaFoto,
              borderRadius: 18,
              overflow: "hidden",
              background: `url(${imagem}) center/cover no-repeat, ${fallbackBg}`,
              flexShrink: 0,
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
  const larguraUtil = RENDER_W - SAFE[formato].x * 2;
  return (
    <Card formato={formato}>
      <SafeArea formato={formato}>
        <MapPin size={formato === "story" ? 40 : 32} color={CORAL} />
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
        <div
          style={{
            marginTop: 20,
            padding: "10px 12px",
            background: TINTA,
            color: CREME,
            fontSize: t.rodape,
            fontFamily: "monospace",
            wordBreak: "break-all",
            alignSelf: "flex-start",
            borderRadius: 4,
          }}
        >
          portalayurveda.com/terapeutas-do-brasil/cadastro
        </div>
        <Rodape formato={formato} cta="cadastre-se" ctaColor={CORAL} />
      </SafeArea>
    </Card>
  );
}

// ---------- grupo ----------
function Grupo({
  titulo,
  formato,
  itens,
}: {
  titulo: string;
  formato: Formato;
  itens: { key: string; filename: string; node: React.ReactNode }[];
}) {
  const refs = useRef<Record<string, HTMLDivElement | null>>({});
  if (!itens.length) return null;
  return (
    <section className="mb-10">
      <h2 className="text-lg font-heading font-bold text-foreground mb-4">{titulo}</h2>
      <div className="flex flex-wrap gap-6">
        {itens.map((it) => (
          <div key={it.key} className="flex flex-col gap-2">
            <div ref={(el) => (refs.current[it.key] = el)}>{it.node}</div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => {
                const el = refs.current[it.key];
                if (el) baixarCard(el, it.filename, formato);
              }}
            >
              <Download className="w-3.5 h-3.5" /> Baixar PNG
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------- página ----------
const AdminMockups = () => {
  const [formato, setFormato] = useState<Formato>("story");
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
            node: <CardConviteTerapeutas formato={formato} />,
          },
        ],
      },
      {
        titulo: "Conversas da Akasha",
        itens: (dados.conversas || []).map((c, i) => ({
          key: `conv-${i}`,
          filename: `akasha-${i + 1}-${formato}.png`,
          node: <CardConversa p={c.pergunta} r={c.resposta} formato={formato} />,
        })),
      },
      {
        titulo: "Receitas",
        itens: (dados.receitas || []).map((r, i) => ({
          key: `rec-${i}`,
          filename: `receita-${i + 1}-${formato}.png`,
          node: <CardReceita r={r} formato={formato} />,
        })),
      },
      {
        titulo: "Vídeos",
        itens: (dados.videos || []).map((v, i) => ({
          key: `vid-${i}`,
          filename: `video-${i + 1}-${formato}.png`,
          node: <CardVideo v={v} formato={formato} />,
        })),
      },
      {
        titulo: "Artigos",
        itens: (dados.artigos || []).map((a, i) => ({
          key: `art-${i}`,
          filename: `artigo-${i + 1}-${formato}.png`,
          node: <CardArtigo a={a} formato={formato} />,
        })),
      },
      {
        titulo: "Cursos",
        itens: (dados.cursos || []).map((c, i) => ({
          key: `cur-${i}`,
          filename: `curso-${i + 1}-${formato}.png`,
          node: <CardCurso c={c} formato={formato} />,
        })),
      },
    ];
  }, [dados, formato]);

  return (
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
            <Grupo key={g.titulo} titulo={g.titulo} formato={formato} itens={g.itens} />
          ))}
      </main>
    </div>
  );
};

export default AdminMockups;
