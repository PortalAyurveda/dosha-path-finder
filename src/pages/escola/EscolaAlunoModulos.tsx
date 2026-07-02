import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronRight, Lock, MessageCircle, Send, StickyNote, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EscolaAlunoShell, { escolaBranding as branding } from "./EscolaAlunoShell";
import { formatModuloFimDeSemana, formatModuloHorarios } from "@/lib/escolaModuloDatas";
import type { AlunoRow } from "@/hooks/useEscolaAluno";
import { getPaletteBranding, type LandingPaletteKey } from "@/data/landingPalettes";

const SIMBOLO_MONO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo-mono.webp";


type Modulo = {
  id: string;
  numero: number;
  semestre: number | null;
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  slug: string | null;
  liberado: boolean;
  palette_key: string | null;
};


type Postit = {
  id: string;
  aluno_id: string | null;
  conteudo: string;
  created_at: string | null;
  parent_id: string | null;
  autor?: { nome_completo: string | null; foto_url: string | null } | null;
};


const SEMESTRES = [
  { num: 1, titulo: "Semestre 1", subtitulo: "Fundamentos (1–5)" },
  { num: 2, titulo: "Semestre 2", subtitulo: "Aprofundamento (6–10)" },
  { num: 3, titulo: "Semestre 3", subtitulo: "Especialização (11–15)" },
];

const findCurrentId = (mods: Modulo[]): string | null => {
  if (mods.length === 0) return null;
  const now = Date.now();
  const emCurso = mods.find((m) => {
    const s = new Date(m.data_inicio).getTime();
    const e = new Date(m.data_fim).getTime();
    return s <= now && now <= e;
  });
  if (emCurso) return emCurso.id;
  const futuros = mods
    .filter((m) => new Date(m.data_inicio).getTime() > now)
    .sort((a, b) => +new Date(a.data_inicio) - +new Date(b.data_inicio));
  if (futuros[0]) return futuros[0].id;
  const passados = mods
    .filter((m) => new Date(m.data_fim).getTime() < now)
    .sort((a, b) => +new Date(b.data_fim) - +new Date(a.data_fim));
  return passados[0]?.id ?? null;
};




// =================== LISTA ===================
const Conteudo = ({ aluno }: { aluno: AlunoRow }) => {
  const [loading, setLoading] = useState(true);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const currentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("escola_modulos")
        .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,slug,liberado,palette_key")
        .order("numero", { ascending: true });

      setModulos((data ?? []) as Modulo[]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading && currentRef.current) {
      currentRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [loading]);

  const currentId = findCurrentId(modulos);
  const now = Date.now();

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-3">
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
          style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
        >
          <Link to="/escola/aluno">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </Button>
        <h1
          className="font-serif text-2xl md:text-3xl font-bold italic"
          style={{ color: branding.darkColor }}
        >
          Os 15 módulos
        </h1>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        SEMESTRES.map((s) => {
          const itens = modulos.filter((m) => (m.semestre ?? 0) === s.num);
          return (
            <section key={s.num} className="space-y-3">
              <div className="pl-3 border-l-4" style={{ borderColor: branding.primaryColor }}>
                <h2 className="font-serif text-xl font-bold italic" style={{ color: branding.darkColor }}>
                  {s.titulo}
                </h2>
                <p className="text-sm text-muted-foreground">{s.subtitulo}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {itens.map((m) => {
                  const isCurrent = m.id === currentId;
                  const isFuture = new Date(m.data_inicio).getTime() > now && !isCurrent;
                  const locked = !m.liberado;
                  const slugOrId = m.slug ?? m.id;
                  const theme = getPaletteBranding((m.palette_key as LandingPaletteKey) || "formacao-azul");
                  const activeTheme = locked
                    ? { primaryColor: "#94a3b8", darkColor: "#475569", lightColor: "#e5e7eb" }
                    : theme;

                  const cardInner = (
                    <div className="relative flex items-start gap-3">
                      <span
                        className="relative z-10 inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 font-serif font-bold text-base text-white"
                        style={{ background: activeTheme.primaryColor }}
                      >
                        {m.numero}
                      </span>
                      <div className="min-w-0 flex-1 relative z-10">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-bold italic leading-snug text-base" style={{ color: activeTheme.darkColor }}>
                            {m.titulo}
                          </h3>
                          {locked && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] inline-flex items-center gap-1"
                              style={{ background: `${activeTheme.primaryColor}20`, color: activeTheme.darkColor }}
                            >
                              <Lock className="w-3 h-3" /> cadeado
                            </Badge>
                          )}
                          {!locked && isCurrent && (
                            <Badge className="text-[10px] uppercase tracking-wide" style={{ background: activeTheme.primaryColor, color: "#fff" }}>
                              Atual
                            </Badge>
                          )}
                          {m.tipo === "presencial" && (
                            <Badge variant="secondary" className="text-[10px]" style={{ background: `${activeTheme.primaryColor}1A`, color: activeTheme.darkColor }}>
                              Presencial em SP
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-foreground/80 mt-1">{formatModuloFimDeSemana(m.data_inicio)}</p>
                        <p className="text-xs text-muted-foreground">{formatModuloHorarios(m.tipo)}</p>
                        {locked && (
                          <p className="text-[11px] italic text-muted-foreground mt-1">Este módulo ainda será liberado.</p>
                        )}
                      </div>
                      {locked ? (
                        <Lock className="w-4 h-4 mt-2 shrink-0 relative z-10" style={{ color: activeTheme.darkColor }} />
                      ) : (
                        <ChevronRight className="w-4 h-4 mt-2 shrink-0 group-hover:translate-x-1 transition-transform relative z-10" style={{ color: activeTheme.darkColor }} />
                      )}
                      {/* Marca d'água — símbolo Portal, atrás do texto mas nunca sobre o número */}
                      <img
                        src={SIMBOLO_MONO}
                        alt=""
                        aria-hidden
                        className="pointer-events-none absolute -right-2 top-1/2 -translate-y-1/2 w-[72px] h-[72px] object-contain z-0"
                        style={{ opacity: 0.09 }}
                      />
                    </div>
                  );

                  const bgTint = locked ? "#f1f5f9" : `${theme.lightColor}55`;
                  const baseClass = `relative overflow-hidden block rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 transition-all pl-5 ${
                    locked ? "opacity-70 cursor-not-allowed grayscale" : isFuture ? "opacity-80 hover:opacity-100" : ""
                  }`;
                  const style = {
                    background: bgTint,
                    borderColor: isCurrent && !locked ? activeTheme.primaryColor : `${activeTheme.primaryColor}33`,
                    boxShadow: isCurrent && !locked ? `0 8px 24px -12px ${activeTheme.primaryColor}66` : undefined,
                    borderLeft: `4px solid ${activeTheme.primaryColor}`,
                  } as const;

                  return (
                    <div key={m.id} ref={isCurrent ? currentRef : undefined}>
                      {locked ? (
                        <div
                          className={baseClass}
                          style={style}
                          onClick={() => toast({ title: "Este módulo ainda será liberado." })}
                          role="button"
                          aria-disabled
                        >
                          {cardInner}
                        </div>
                      ) : (
                        <Link to={`/escola/aluno/modulo/${slugOrId}`} className={`group ${baseClass}`} style={style}>
                          {cardInner}
                        </Link>
                      )}
                    </div>
                  );
                })}
              </div>

            </section>
          );
        })
      )}
    </div>

  );
};

const EscolaAlunoModulos = () => (
  <EscolaAlunoShell>{(aluno) => <Conteudo aluno={aluno} />}</EscolaAlunoShell>
);

export default EscolaAlunoModulos;
