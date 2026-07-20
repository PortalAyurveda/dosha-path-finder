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

// Visual escalado — largura de ~360px na tela.
const RENDER_W = 360;

const CREME = "#FBF6EE";
const TINTA = "#352F54";
const CORAL = "#FF7676";
const DOURADO = "#E0A020";

const DOSHA_COLOR: Record<string, string> = {
  vata: "#6B8FE8",
  pitta: "#F0857F",
  kapha: "#57BE86",
};

type Dados = {
  metricas: any;
  testes_total: number;
  conversas: { pergunta: string; resposta: string }[];
  videos: { titulo: string; resumo: string; thumb: string; slug: string }[];
  artigos: { titulo: string; resumo: string; imagem: string; slug: string }[];
  receitas: { titulo: string; imagem: string; resumo: string; efeito: string; ingredientes: string }[];
  cursos: { titulo: string; capa: string; slug: string; aulas: number }[];
};

// ---------- helpers ----------
async function baixarCard(el: HTMLElement, filename: string, formato: Formato) {
  const target = FORMATOS[formato];
  const pixelRatio = target.w / el.offsetWidth; // → saída 1080px de largura
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
      <div className="w-full h-full flex flex-col">{children}</div>
      <div className="absolute bottom-2 right-3 flex items-center gap-1.5 opacity-70">
        <img src={LOGO} alt="" width={14} height={14} style={{ filter: "brightness(0.3)" }} />
        <span style={{ fontSize: 10, color: TINTA }}>portalayurveda.com</span>
      </div>
    </div>
  );
}

const Serif: React.CSSProperties = { fontFamily: "'Roboto Serif', Georgia, serif" };

const Selo = ({ children, color = DOURADO }: { children: React.ReactNode; color?: string }) => (
  <span
    style={{
      background: color,
      color: "#fff",
      padding: "3px 8px",
      fontSize: 9,
      letterSpacing: 1.5,
      fontWeight: 700,
      textTransform: "uppercase",
      display: "inline-block",
    }}
  >
    {children}
  </span>
);

// ---------- cards ----------
function CardClima({ m, testesTotal, formato }: { m: any; testesTotal: number; formato: Formato }) {
  if (!m) return null;
  const agr = (m.dosha_agravando || "vata").toLowerCase();
  const color = DOSHA_COLOR[agr] || CORAL;
  const sintoma = m[`sintoma_${agr}`];
  const pillar = (nome: string, v: number) => {
    const up = Number(v) >= 0;
    return (
      <div
        key={nome}
        className="flex items-center gap-1 px-2.5 py-1 rounded-full"
        style={{ background: DOSHA_COLOR[nome], color: "#fff", fontSize: 11, fontWeight: 600 }}
      >
        {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
        {nome} {Math.abs(Number(v) || 0)}%
      </div>
    );
  };
  return (
    <Card formato={formato} bg={`linear-gradient(160deg, ${color}22, ${CREME} 60%)`}>
      <div className="p-6 flex-1 flex flex-col">
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.7 }}>
          Clima × Doshas
        </div>
        <div style={{ ...Serif, fontSize: 28, lineHeight: 1.15, marginTop: 10, fontWeight: 600 }}>
          {m.estacao}: o {agr} da base subiu {m.dosha_agravando_pct}%
        </div>
        {sintoma && (
          <div style={{ fontSize: 13, marginTop: 12, opacity: 0.85 }}>
            sintoma mais comum: <em>{sintoma}</em>
          </div>
        )}
        <div style={{ fontSize: 10, marginTop: 10, opacity: 0.6, lineHeight: 1.4 }}>
          observado na comparação entre centenas de pessoas que refizeram o teste
        </div>
        <div className="flex flex-wrap gap-1.5 mt-4">
          {pillar("vata", m.var_vata)}
          {pillar("pitta", m.var_pitta)}
          {pillar("kapha", m.var_kapha)}
        </div>
        <div className="mt-auto pt-4" style={{ fontSize: 11, opacity: 0.65 }}>
          dados de {Number(testesTotal).toLocaleString("pt-BR")} testes de dosha
        </div>
      </div>
    </Card>
  );
}

function CardConversa({ p, r, formato }: { p: string; r: string; formato: Formato }) {
  return (
    <Card formato={formato}>
      <div className="p-5 flex-1 flex flex-col" style={{ justifyContent: formato === "story" ? "center" : "flex-start" }}>
        <div style={{ fontSize: 9, letterSpacing: 2, textTransform: "uppercase", opacity: 0.6, marginBottom: 14 }}>
          conversa real · anônima
        </div>
        <div
          className="self-end max-w-[85%] px-3.5 py-2.5 rounded-2xl rounded-br-sm mb-3"
          style={{ background: "#EEEEEE", fontSize: 13, lineHeight: 1.45 }}
        >
          {p}
        </div>
        <div
          className="self-start max-w-[90%] px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
          style={{ background: "#EDE7FA", fontSize: 13, lineHeight: 1.45 }}
        >
          {r}
        </div>
      </div>
    </Card>
  );
}

function CardReceita({ r, formato }: { r: Dados["receitas"][number]; formato: Formato }) {
  const showEfeito = formato === "story";
  return (
    <Card formato={formato}>
      <div style={{ height: "45%", background: `url(${r.imagem}) center/cover no-repeat, #ddd` }} />
      <div className="p-5 flex-1 flex flex-col gap-2.5 overflow-hidden">
        <Selo>Receita do Portal</Selo>
        <div style={{ ...Serif, fontSize: 20, lineHeight: 1.15, fontWeight: 600 }}>{r.titulo}</div>
        {r.resumo && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.6 }}>o que é</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>{r.resumo}</div>
          </div>
        )}
        {r.ingredientes && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.6 }}>ingredientes</div>
            <div style={{ fontSize: 11, lineHeight: 1.4, opacity: 0.85 }}>{r.ingredientes}</div>
          </div>
        )}
        {showEfeito && r.efeito && (
          <div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.6 }}>pra que serve</div>
            <div style={{ fontSize: 11.5, lineHeight: 1.4 }}>{r.efeito}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

function CardVideo({ v, formato }: { v: Dados["videos"][number]; formato: Formato }) {
  return (
    <Card formato={formato}>
      <div className="relative" style={{ height: "45%", background: `url(${v.thumb}) center/cover no-repeat, #333` }}>
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: "linear-gradient(180deg, #0000, #0004)" }}
        >
          <div
            className="rounded-full flex items-center justify-center"
            style={{ width: 54, height: 54, background: "#fffc", color: TINTA }}
          >
            <Play size={22} fill={TINTA} />
          </div>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col gap-2.5">
        <Selo color={CORAL}>Aula do Professor</Selo>
        <div style={{ ...Serif, fontSize: 20, lineHeight: 1.2, fontWeight: 600 }}>{v.titulo}</div>
        {v.resumo && <div style={{ fontSize: 12, lineHeight: 1.5, opacity: 0.85 }}>{v.resumo}</div>}
      </div>
    </Card>
  );
}

function CardArtigo({ a, formato }: { a: Dados["artigos"][number]; formato: Formato }) {
  return (
    <Card formato={formato}>
      {a.imagem && <div style={{ height: "40%", background: `url(${a.imagem}) center/cover no-repeat, #ccc` }} />}
      <div className="p-5 flex-1 flex flex-col gap-3">
        <Selo>Artigo</Selo>
        <div style={{ ...Serif, fontSize: 22, lineHeight: 1.15, fontWeight: 600 }}>{a.titulo}</div>
        {a.resumo && <div style={{ fontSize: 12.5, lineHeight: 1.55, opacity: 0.85 }}>{a.resumo}</div>}
      </div>
    </Card>
  );
}

function CardCurso({ c, formato }: { c: Dados["cursos"][number]; formato: Formato }) {
  return (
    <Card formato={formato}>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 text-center">
        <Selo color={CORAL}>Curso do Portal</Selo>
        {c.capa && (
          <img
            src={c.capa}
            alt=""
            style={{ width: "70%", aspectRatio: "1", objectFit: "cover", borderRadius: 6 }}
          />
        )}
        <div style={{ ...Serif, fontSize: 22, lineHeight: 1.2, fontWeight: 600 }}>{c.titulo}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          {c.aulas} aulas com o professor Edson Osorio
        </div>
      </div>
    </Card>
  );
}

function CardNumeros({ d, formato }: { d: Dados; formato: Formato }) {
  return (
    <Card formato={formato}>
      <div className="flex-1 flex flex-col justify-center p-7 gap-6">
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.6 }}>
          Números do Portal
        </div>
        <div>
          <div style={{ ...Serif, fontSize: 64, lineHeight: 1, fontWeight: 700, color: TINTA }}>
            {Number(d.testes_total).toLocaleString("pt-BR")}
          </div>
          <div style={{ fontSize: 13, marginTop: 6 }}>testes de dosha realizados</div>
        </div>
        <div>
          <div style={{ ...Serif, fontSize: 30, fontWeight: 600, color: CORAL }}>
            {d.metricas?.terapeutas ?? 0}
          </div>
          <div style={{ fontSize: 12 }}>terapeutas pelo Brasil</div>
        </div>
        <div>
          <div style={{ ...Serif, fontSize: 30, fontWeight: 600, color: DOURADO }}>
            {d.metricas?.testes_7d ?? 0}
          </div>
          <div style={{ fontSize: 12 }}>pessoas se conheceram esta semana</div>
        </div>
      </div>
    </Card>
  );
}

function CardConviteTerapeutas({ formato }: { formato: Formato }) {
  return (
    <Card formato={formato}>
      <div className="flex-1 flex flex-col justify-center p-7 gap-5">
        <MapPin size={38} color={CORAL} />
        <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", opacity: 0.6 }}>
          Convite
        </div>
        <div style={{ ...Serif, fontSize: 28, lineHeight: 1.15, fontWeight: 600 }}>
          Você é terapeuta de Ayurveda?
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5 }}>
          Cadastre-se nos Terapeutas do Brasil e seja encontrada por quem procura cuidado na sua cidade.
        </div>
        <div
          className="mt-2 px-3 py-2 inline-block"
          style={{
            background: TINTA,
            color: CREME,
            fontSize: 11,
            fontFamily: "monospace",
            wordBreak: "break-all",
          }}
        >
          portalayurveda.com/terapeutas-do-brasil/cadastro
        </div>
      </div>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("mockups_dados" as any);
      if (error || data == null) {
        setRestrito(true);
      } else {
        setDados(data as unknown as Dados);
      }
      setLoading(false);
    })();
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
        {restrito && (
          <div className="text-center text-muted-foreground py-20">Página restrita.</div>
        )}
        {loading && !restrito && (
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
          grupos.map((g) => (
            <Grupo key={g.titulo} titulo={g.titulo} formato={formato} itens={g.itens} />
          ))}
      </main>
    </div>
  );
};

export default AdminMockups;
