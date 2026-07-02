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
};

type Postit = {
  id: string;
  aluno_id: string | null;
  conteudo: string;
  created_at: string | null;
  parent_id: string | null;
  aluno?: { nome_completo: string } | null;
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

const formatRelative = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

// =================== MURAL DA TURMA ===================
const MuralTurma = ({ aluno }: { aluno: AlunoRow }) => {
  const turmaId = aluno.turma_id;
  const [postits, setPostits] = useState<Postit[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState("");
  const [respostaPara, setRespostaPara] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    if (!turmaId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("escola_postits")
      .select("id,aluno_id,conteudo,created_at,parent_id, aluno:escola_alunos(nome_completo)")
      .eq("turma_id", turmaId)
      .order("created_at", { ascending: true });
    setPostits((data ?? []) as any as Postit[]);
    setLoading(false);
  }, [turmaId]);

  useEffect(() => {
    load();
  }, [load]);

  const colar = async () => {
    if (!novo.trim() || !turmaId) return;
    setPosting(true);
    const { error } = await supabase
      .from("escola_postits")
      .insert({ turma_id: turmaId, aluno_id: aluno.id, conteudo: novo.trim() });
    setPosting(false);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      setNovo("");
      load();
    }
  };

  const responder = async (parentId: string) => {
    if (!respostaTexto.trim() || !turmaId) return;
    setPosting(true);
    const { error } = await supabase
      .from("escola_postits")
      .insert({
        turma_id: turmaId,
        aluno_id: aluno.id,
        conteudo: respostaTexto.trim(),
        parent_id: parentId,
      });
    setPosting(false);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      setRespostaTexto("");
      setRespostaPara(null);
      load();
    }
  };

  const remover = async (id: string) => {
    if (!confirm("Apagar este post-it?")) return;
    const { error } = await supabase.from("escola_postits").delete().eq("id", id);
    if (error) toast({ title: "Erro", description: error.message });
    else load();
  };

  if (!turmaId) return null;

  const principais = postits.filter((p) => !p.parent_id);
  const respostasDe = (parentId: string) => postits.filter((p) => p.parent_id === parentId);
  const authorName = (p: Postit) => p.aluno?.nome_completo?.split(" ")[0] ?? "Aluno";

  return (
    <section className="space-y-4">
      <div className="pl-3 border-l-4 flex items-center gap-2" style={{ borderColor: branding.primaryColor }}>
        <StickyNote className="w-5 h-5" style={{ color: branding.primaryColor }} />
        <div>
          <h2 className="font-serif text-xl font-bold italic" style={{ color: branding.darkColor }}>
            Mural da turma
          </h2>
          <p className="text-sm text-muted-foreground">Post-its visíveis para todos da turma — leve e livre.</p>
        </div>
      </div>

      <div
        className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-2"
        style={{ borderColor: `${branding.primaryColor}33` }}
      >
        <Textarea
          value={novo}
          onChange={(e) => setNovo(e.target.value)}
          rows={2}
          placeholder="Cole um post-it para a turma…"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={colar}
            disabled={posting || !novo.trim()}
            className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
            style={{ background: branding.primaryColor, color: "#fff" }}
          >
            <Send className="w-4 h-4" /> Colar
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : principais.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Seja o primeiro a colar um post-it.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {principais.map((p) => {
            const respostas = respostasDe(p.id);
            const own = p.aluno_id === aluno.id;
            return (
              <div key={p.id} className="space-y-2">
                <div
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm p-4 shadow-sm"
                  style={{ background: `${branding.primaryColor}10` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-muted-foreground">
                    <span className="font-medium" style={{ color: branding.darkColor }}>{authorName(p)}</span>
                    <span>{formatRelative(p.created_at)}</span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap font-serif italic" style={{ color: branding.darkColor }}>
                    {p.conteudo}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setRespostaPara(respostaPara === p.id ? null : p.id);
                        setRespostaTexto("");
                      }}
                      className="text-[11px] inline-flex items-center gap-1"
                      style={{ color: branding.primaryColor }}
                    >
                      <MessageCircle className="w-3 h-3" /> responder
                    </button>
                    {own && (
                      <button
                        type="button"
                        onClick={() => remover(p.id)}
                        className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" /> apagar
                      </button>
                    )}
                  </div>
                </div>

                {respostas.length > 0 && (
                  <div className="pl-6 space-y-2">
                    {respostas.map((r) => {
                      const ownR = r.aluno_id === aluno.id;
                      return (
                        <div
                          key={r.id}
                          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border bg-white p-3"
                          style={{ borderColor: `${branding.primaryColor}22` }}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1">
                            <span className="font-medium" style={{ color: branding.darkColor }}>{authorName(r)}</span>
                            <span>{formatRelative(r.created_at)}</span>
                          </div>
                          <p className="text-sm whitespace-pre-wrap text-foreground/85">{r.conteudo}</p>
                          {ownR && (
                            <button
                              type="button"
                              onClick={() => remover(r.id)}
                              className="text-[11px] inline-flex items-center gap-1 text-muted-foreground hover:text-destructive mt-1"
                            >
                              <Trash2 className="w-3 h-3" /> apagar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {respostaPara === p.id && (
                  <div className="pl-6">
                    <div
                      className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border bg-white p-3 space-y-2"
                      style={{ borderColor: `${branding.primaryColor}33` }}
                    >
                      <Input
                        value={respostaTexto}
                        onChange={(e) => setRespostaTexto(e.target.value)}
                        placeholder="Sua resposta…"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") responder(p.id);
                        }}
                      />
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setRespostaPara(null)}>cancelar</Button>
                        <Button
                          size="sm"
                          onClick={() => responder(p.id)}
                          disabled={posting || !respostaTexto.trim()}
                          style={{ background: branding.primaryColor, color: "#fff" }}
                        >
                          enviar
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
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
        .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,slug,liberado")
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

                  const cardInner = (
                    <div className="flex items-start gap-3">
                      <span
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0 font-serif font-bold text-base"
                        style={{
                          background: isCurrent && !locked ? branding.primaryColor : `${branding.primaryColor}15`,
                          color: isCurrent && !locked ? "#fff" : branding.primaryColor,
                        }}
                      >
                        {m.numero}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-serif font-bold italic leading-snug text-base" style={{ color: branding.darkColor }}>
                            {m.titulo}
                          </h3>
                          {locked && (
                            <Badge
                              variant="secondary"
                              className="text-[10px] inline-flex items-center gap-1"
                              style={{ background: `${branding.primaryColor}10`, color: branding.primaryColor }}
                            >
                              <Lock className="w-3 h-3" /> cadeado
                            </Badge>
                          )}
                          {!locked && isCurrent && (
                            <Badge className="text-[10px] uppercase tracking-wide" style={{ background: branding.primaryColor, color: "#fff" }}>
                              Atual
                            </Badge>
                          )}
                          {m.tipo === "presencial" && (
                            <Badge variant="secondary" className="text-[10px]" style={{ background: `${branding.primaryColor}1A`, color: branding.primaryColor }}>
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
                        <Lock className="w-4 h-4 mt-2 shrink-0" style={{ color: branding.primaryColor }} />
                      ) : (
                        <ChevronRight className="w-4 h-4 mt-2 shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: branding.primaryColor }} />
                      )}
                    </div>
                  );

                  const baseClass = `block bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 transition-all ${
                    locked ? "opacity-60 cursor-not-allowed" : isFuture ? "opacity-70 hover:opacity-100" : ""
                  }`;
                  const style = {
                    borderColor: isCurrent && !locked ? branding.primaryColor : `${branding.primaryColor}22`,
                    boxShadow: isCurrent && !locked ? `0 8px 24px -12px ${branding.primaryColor}66` : undefined,
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

      <MuralTurma aluno={aluno} />
    </div>
  );
};

const EscolaAlunoModulos = () => (
  <EscolaAlunoShell>{(aluno) => <Conteudo aluno={aluno} />}</EscolaAlunoShell>
);

export default EscolaAlunoModulos;
