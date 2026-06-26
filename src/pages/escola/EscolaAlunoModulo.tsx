import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Download,
  FileText,
  Loader2,
  Lock,
  Save,
  Sparkles,
  Utensils,
  Video as VideoIcon,
  Link2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EscolaAlunoShell, { escolaBranding as branding } from "./EscolaAlunoShell";
import { formatModuloFimDeSemana, formatModuloHorarios } from "@/lib/escolaModuloDatas";
import type { AlunoRow } from "@/hooks/useEscolaAluno";

const BUCKET = "escola";

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
  video_url: string | null;
  zoom_url: string | null;
  slides_url: string | null;
  apostila_url: string | null;
};

type CardapioRow = {
  id: string;
  dia: string;
  refeicao: string;
  conteudo: string | null;
  ordem: number | null;
};

type Recurso = {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  url: string | null;
  ordem: number | null;
};

type Pergunta = { id: string; pergunta: string; ordem: number | null };
type Resposta = { id: string; pergunta_id: string; resposta: string | null };


const RECURSO_GROUPS: { tipo: string; label: string; icon: typeof VideoIcon }[] = [
  { tipo: "video_recomendado", label: "Vídeos recomendados", icon: VideoIcon },
  { tipo: "cardapio", label: "Cardápio prático", icon: Utensils },
  { tipo: "dinacharya", label: "Rotina de dinacharya", icon: Sparkles },
  { tipo: "experiencia", label: "Experiências vivenciais", icon: Sparkles },
];

const formatDateLong = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
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

const extractYoutubeId = (url: string): string | null => {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return v;
      const parts = u.pathname.split("/").filter(Boolean);
      const idx = parts.findIndex((p) => p === "embed" || p === "shorts" || p === "live");
      if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
    }
  } catch {
    return null;
  }
  return null;
};

// ============= SEÇÕES =============

const SectionTitle = ({ icon: Icon, children }: { icon: typeof VideoIcon; children: React.ReactNode }) => (
  <h2
    className="font-serif text-xl font-bold italic flex items-center gap-2"
    style={{ color: branding.darkColor }}
  >
    <Icon className="w-5 h-5" style={{ color: branding.primaryColor }} />
    {children}
  </h2>
);

const MaterialBlock = ({ modulo }: { modulo: Modulo }) => {
  const [apostilaUrl, setApostilaUrl] = useState<string | null>(null);
  const videoId = modulo.video_url ? extractYoutubeId(modulo.video_url) : null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!modulo.apostila_url) {
        setApostilaUrl(null);
        return;
      }
      const { data } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(modulo.apostila_url, 60 * 60);
      if (!cancelled) setApostilaUrl(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [modulo.apostila_url]);

  const hasAny = modulo.video_url || modulo.apostila_url || modulo.slides_url;
  if (!hasAny) {
    return <p className="text-sm text-muted-foreground italic">Ainda não há material aqui.</p>;
  }

  return (
    <div className="space-y-4">
      {modulo.video_url && (
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Gravação da aula</p>
          {videoId ? (
            <div className="aspect-video w-full overflow-hidden rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={modulo.titulo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <a
              href={modulo.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: branding.primaryColor }}
            >
              <VideoIcon className="w-4 h-4" /> abrir vídeo
            </a>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {modulo.apostila_url && (
          <a
            href={apostilaUrl ?? "#"}
            target="_blank"
            rel="noreferrer"
            className={`inline-flex items-center gap-2 text-sm px-4 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border bg-white ${
              apostilaUrl ? "" : "opacity-50 pointer-events-none"
            }`}
            style={{ borderColor: `${branding.primaryColor}55`, color: branding.darkColor }}
          >
            <FileText className="w-4 h-4" style={{ color: branding.primaryColor }} />
            Apostila <Download className="w-3.5 h-3.5" />
          </a>
        )}
        {modulo.slides_url && (
          <a
            href={modulo.slides_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm px-4 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border bg-white"
            style={{ borderColor: `${branding.primaryColor}55`, color: branding.darkColor }}
          >
            <Link2 className="w-4 h-4" style={{ color: branding.primaryColor }} /> Slides
          </a>
        )}
      </div>
    </div>
  );
};

const RecursosBlock = ({ moduloId }: { moduloId: string }) => {
  const [recursos, setRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("escola_modulo_recursos")
        .select("*")
        .eq("modulo_id", moduloId)
        .order("ordem", { ascending: true });
      setRecursos((data ?? []) as Recurso[]);
      setLoading(false);
    })();
  }, [moduloId]);

  if (loading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-8">
      {RECURSO_GROUPS.map((g) => {
        const itens = recursos.filter((r) => r.tipo === g.tipo);
        if (itens.length === 0) return null;
        return (
          <section key={g.tipo} className="space-y-3">
            <SectionTitle icon={g.icon}>{g.label}</SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              {itens.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-2"
                  style={{ borderColor: `${branding.primaryColor}22` }}
                >
                  <h3
                    className="font-serif font-bold text-base leading-snug"
                    style={{ color: branding.darkColor }}
                  >
                    {r.titulo}
                  </h3>
                  {r.descricao && (
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.descricao}</p>
                  )}
                  {r.url && (
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-sm pt-1"
                      style={{ color: branding.primaryColor }}
                    >
                      <Link2 className="w-3.5 h-3.5" /> abrir
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

const AutoavaliacaoBlock = ({ moduloId, alunoId }: { moduloId: string; alunoId: string }) => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<Record<string, Resposta | null>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data: pData } = await supabase
      .from("escola_avaliacao_perguntas")
      .select("id,pergunta,ordem")
      .eq("modulo_id", moduloId)
      .order("ordem", { ascending: true });
    const perg = (pData ?? []) as Pergunta[];
    setPerguntas(perg);

    if (perg.length > 0) {
      const ids = perg.map((p) => p.id);
      const { data: rData } = await supabase
        .from("escola_avaliacao_respostas")
        .select("id,pergunta_id,resposta")
        .eq("aluno_id", alunoId)
        .in("pergunta_id", ids);
      const map: Record<string, Resposta | null> = {};
      const dmap: Record<string, string> = {};
      perg.forEach((p) => {
        const r = (rData ?? []).find((x: any) => x.pergunta_id === p.id) as Resposta | undefined;
        map[p.id] = r ?? null;
        dmap[p.id] = r?.resposta ?? "";
      });
      setRespostas(map);
      setDrafts(dmap);
    }
    setLoading(false);
  }, [moduloId, alunoId]);

  useEffect(() => {
    load();
  }, [load]);

  const salvar = async (perguntaId: string) => {
    setSaving((s) => ({ ...s, [perguntaId]: true }));
    const texto = drafts[perguntaId] ?? "";
    const existente = respostas[perguntaId];
    let error: any = null;
    if (existente) {
      const r = await supabase
        .from("escola_avaliacao_respostas")
        .update({ resposta: texto })
        .eq("id", existente.id);
      error = r.error;
    } else {
      const r = await supabase
        .from("escola_avaliacao_respostas")
        .insert({ aluno_id: alunoId, pergunta_id: perguntaId, resposta: texto })
        .select("id,pergunta_id,resposta")
        .maybeSingle();
      error = r.error;
      if (!error && r.data) {
        setRespostas((m) => ({ ...m, [perguntaId]: r.data as Resposta }));
      }
    }
    setSaving((s) => ({ ...s, [perguntaId]: false }));
    if (error) toast({ title: "Erro ao salvar", description: error.message });
    else toast({ title: "Resposta salva" });
  };

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (perguntas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        Ainda não há perguntas de autoavaliação para este módulo.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground italic">
        Suas respostas são privadas e servem só para sua reflexão. Não há nota nem correção.
      </p>
      {perguntas.map((p, idx) => (
        <div
          key={p.id}
          className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-2"
          style={{ borderColor: `${branding.primaryColor}22` }}
        >
          <p className="font-serif font-bold text-sm" style={{ color: branding.darkColor }}>
            {idx + 1}. {p.pergunta}
          </p>
          <Textarea
            value={drafts[p.id] ?? ""}
            onChange={(e) => setDrafts((d) => ({ ...d, [p.id]: e.target.value }))}
            rows={3}
            placeholder="Sua reflexão…"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={() => salvar(p.id)}
              disabled={saving[p.id]}
              className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
              style={{ background: branding.primaryColor, color: "#fff" }}
            >
              {saving[p.id] ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Salvar
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

const DiarioBlock = ({ moduloId, alunoId }: { moduloId: string; alunoId: string }) => {
  const [rowId, setRowId] = useState<string | null>(null);
  const [conteudo, setConteudo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("escola_diario")
        .select("id,conteudo")
        .eq("aluno_id", alunoId)
        .eq("modulo_id", moduloId)
        .maybeSingle();
      if (data) {
        setRowId(data.id);
        setConteudo(data.conteudo ?? "");
      } else {
        setRowId(null);
        setConteudo("");
      }
      setLoading(false);
    })();
  }, [moduloId, alunoId]);

  const salvar = async () => {
    setSaving(true);
    let error: any = null;
    if (rowId) {
      const r = await supabase.from("escola_diario").update({ conteudo }).eq("id", rowId);
      error = r.error;
    } else {
      const r = await supabase
        .from("escola_diario")
        .insert({ aluno_id: alunoId, modulo_id: moduloId, conteudo })
        .select("id")
        .maybeSingle();
      error = r.error;
      if (!error && r.data) setRowId(r.data.id);
    }
    setSaving(false);
    if (error) toast({ title: "Erro ao salvar", description: error.message });
    else toast({ title: "Diário salvo" });
  };

  if (loading) return <Skeleton className="h-32 w-full" />;

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground italic">
        Registro pessoal da sua evolução neste módulo. Só você vê.
      </p>
      <Textarea
        value={conteudo}
        onChange={(e) => setConteudo(e.target.value)}
        rows={6}
        placeholder="Como tem sido sua experiência com este módulo? O que mudou na sua prática clínica, na sua observação, na sua rotina…"
        className="bg-white"
      />
      <div className="flex justify-end">
        <Button
          onClick={salvar}
          disabled={saving}
          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
          style={{ background: branding.primaryColor, color: "#fff" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar diário
        </Button>
      </div>
    </div>
  );
};

const DIAS: { key: "sexta" | "sabado" | "domingo"; label: string }[] = [
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];
const REFEICAO_LABEL: Record<string, string> = {
  cafe: "Café da manhã",
  almoco: "Almoço",
  jantar: "Jantar",
};

const CardapioBlock = ({ moduloId }: { moduloId: string }) => {
  const [linhas, setLinhas] = useState<CardapioRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("escola_cardapio")
        .select("id,dia,refeicao,conteudo,ordem")
        .eq("modulo_id", moduloId)
        .order("ordem", { ascending: true });
      setLinhas((data ?? []) as CardapioRow[]);
      setLoading(false);
    })();
  }, [moduloId]);

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (linhas.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Cardápio ainda não publicado.</p>;
  }

  const algumComConteudo = linhas.some((l) => (l.conteudo ?? "").trim().length > 0);
  if (!algumComConteudo) {
    return <p className="text-sm text-muted-foreground italic">Cardápio ainda não publicado.</p>;
  }

  return (
    <div className="space-y-5">
      {DIAS.map((d) => {
        const itens = linhas.filter((l) => l.dia === d.key);
        if (itens.length === 0) return null;
        return (
          <div key={d.key} className="space-y-2">
            <h3 className="font-serif font-bold italic text-base" style={{ color: branding.darkColor }}>
              {d.label}
            </h3>
            <div className="grid gap-2 md:grid-cols-3">
              {itens.map((r) => {
                const vazio = !(r.conteudo ?? "").trim();
                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-3"
                    style={{ borderColor: `${branding.primaryColor}22` }}
                  >
                    <p className="text-[11px] uppercase tracking-wide" style={{ color: branding.primaryColor }}>
                      {REFEICAO_LABEL[r.refeicao] ?? r.refeicao}
                    </p>
                    {vazio ? (
                      <p className="text-xs italic text-muted-foreground mt-1">a definir</p>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap text-foreground/85 mt-1">{r.conteudo}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};


// ============= PÁGINA =============

const Conteudo = ({ aluno }: { aluno: AlunoRow }) => {
  const { slug } = useParams();
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) return;
      setLoading(true);
      // tenta por slug; se não achar e parecer UUID, fallback por id
      let { data } = await supabase
        .from("escola_modulos")
        .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,slug,liberado,video_url,zoom_url,slides_url,apostila_url")
        .eq("slug", slug)
        .maybeSingle();
      if (!data && /^[0-9a-f-]{36}$/i.test(slug)) {
        const r = await supabase
          .from("escola_modulos")
          .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,slug,liberado,video_url,zoom_url,slides_url,apostila_url")
          .eq("id", slug)
          .maybeSingle();
        data = r.data;
      }
      if (cancelled) return;
      if (!data) setNotFound(true);
      else setModulo(data as Modulo);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const arc = useMemo(
    () => (
      <div
        aria-hidden
        className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-40 rounded-b-full opacity-10"
        style={{ background: branding.primaryColor }}
      />
    ),
    []
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (notFound || !modulo) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-muted-foreground">Módulo não encontrado.</p>
        <Button asChild variant="outline">
          <Link to="/escola/aluno/modulos">Ver os 15 módulos</Link>
        </Button>
      </div>
    );
  }

  const locked = !modulo.liberado;

  return (
    <div className="space-y-10">
      <div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm mb-4"
          style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
        >
          <Link to="/escola/aluno/modulos">
            <ArrowLeft className="w-4 h-4" /> Todos os módulos
          </Link>
        </Button>

        <div
          className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm bg-white border p-6 md:p-8"
          style={{ borderColor: `${branding.primaryColor}33` }}
        >
          {arc}
          <div className="relative flex items-start gap-4">
            <span
              className="inline-flex items-center justify-center w-14 h-14 rounded-full text-white font-serif font-bold text-xl shrink-0"
              style={{ background: branding.primaryColor }}
            >
              {modulo.numero}
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                Semestre {modulo.semestre} · Módulo {modulo.numero} de 15
              </p>
              <h1
                className="font-serif text-2xl md:text-3xl font-bold italic leading-tight mt-1"
                style={{ color: branding.darkColor }}
              >
                {modulo.titulo}
              </h1>
              <p className="text-sm text-foreground/80 mt-1">{formatModuloFimDeSemana(modulo.data_inicio)}</p>
              <p className="text-xs text-muted-foreground">{formatModuloHorarios(modulo.tipo)}</p>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                {locked && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] inline-flex items-center gap-1"
                    style={{ background: `${branding.primaryColor}1A`, color: branding.primaryColor }}
                  >
                    <Lock className="w-3 h-3" /> cadeado
                  </Badge>
                )}
                {modulo.tipo === "presencial" && (
                  <Badge
                    className="text-[10px]"
                    style={{ background: `${branding.primaryColor}1A`, color: branding.primaryColor }}
                  >
                    Presencial em SP
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {locked ? (
        <div
          className="rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border bg-white p-8 text-center space-y-3"
          style={{ borderColor: `${branding.primaryColor}33` }}
        >
          <Lock className="w-8 h-8 mx-auto" style={{ color: branding.primaryColor }} />
          <h2 className="font-serif text-xl italic font-bold" style={{ color: branding.darkColor }}>
            Este módulo ainda será liberado.
          </h2>
          <p className="text-sm text-muted-foreground">
            O conteúdo será disponibilizado pelo professor conforme o curso avança.
          </p>
        </div>
      ) : (
        <>
          {/* Material */}
          <section className="space-y-4">
            <SectionTitle icon={VideoIcon}>Material</SectionTitle>
            <MaterialBlock modulo={modulo} />
          </section>

          {/* Recursos */}
          <RecursosBlock moduloId={modulo.id} />

          {/* Cardápio */}
          <section className="space-y-4">
            <SectionTitle icon={Utensils}>Cardápio do fim de semana</SectionTitle>
            <CardapioBlock moduloId={modulo.id} />
          </section>

          {/* Autoavaliação */}
          <section className="space-y-4">
            <SectionTitle icon={FileText}>Autoavaliação</SectionTitle>
            <AutoavaliacaoBlock moduloId={modulo.id} alunoId={aluno.id} />
          </section>

          {/* Diário */}
          <section className="space-y-4">
            <SectionTitle icon={Sparkles}>Diário de evolução clínica</SectionTitle>
            <DiarioBlock moduloId={modulo.id} alunoId={aluno.id} />
          </section>
        </>
      )}
    </div>
  );
};

const EscolaAlunoModulo = () => (
  <EscolaAlunoShell>{(aluno) => <Conteudo aluno={aluno} />}</EscolaAlunoShell>
);

export default EscolaAlunoModulo;
