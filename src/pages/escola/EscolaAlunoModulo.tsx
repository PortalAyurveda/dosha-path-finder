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
  MessageCircle,
  Save,
  Send,
  Sparkles,
  Trash2,
  Utensils,
  Video as VideoIcon,
  Link2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import EscolaAlunoShell, { escolaBranding as branding } from "./EscolaAlunoShell";
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
  video_url: string | null;
  zoom_url: string | null;
  slides_url: string | null;
  apostila_url: string | null;
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

type Postit = {
  id: string;
  aluno_id: string | null;
  conteudo: string;
  created_at: string | null;
  parent_id: string | null;
  aluno?: { nome_completo: string } | null;
};

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

const PostitsBlock = ({ moduloId, alunoId }: { moduloId: string; alunoId: string }) => {
  const [postits, setPostits] = useState<Postit[]>([]);
  const [loading, setLoading] = useState(true);
  const [novo, setNovo] = useState("");
  const [respostaPara, setRespostaPara] = useState<string | null>(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [posting, setPosting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("escola_postits")
      .select("id,aluno_id,conteudo,created_at,parent_id, aluno:escola_alunos(nome_completo)")
      .eq("modulo_id", moduloId)
      .order("created_at", { ascending: true });
    setPostits((data ?? []) as any as Postit[]);
    setLoading(false);
  }, [moduloId]);

  useEffect(() => {
    load();
  }, [load]);

  const colar = async () => {
    if (!novo.trim()) return;
    setPosting(true);
    const { error } = await supabase
      .from("escola_postits")
      .insert({ modulo_id: moduloId, aluno_id: alunoId, conteudo: novo.trim() });
    setPosting(false);
    if (error) toast({ title: "Erro", description: error.message });
    else {
      setNovo("");
      load();
    }
  };

  const responder = async (parentId: string) => {
    if (!respostaTexto.trim()) return;
    setPosting(true);
    const { error } = await supabase
      .from("escola_postits")
      .insert({
        modulo_id: moduloId,
        aluno_id: alunoId,
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

  const principais = postits.filter((p) => !p.parent_id);
  const respostasDe = (parentId: string) => postits.filter((p) => p.parent_id === parentId);

  const authorName = (p: Postit) => p.aluno?.nome_completo?.split(" ")[0] ?? "Aluno";

  return (
    <div className="space-y-4">
      {/* Novo post-it */}
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
        <p className="text-sm text-muted-foreground italic">
          Seja o primeiro a colar um post-it neste módulo.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {principais.map((p) => {
            const respostas = respostasDe(p.id);
            const own = p.aluno_id === alunoId;
            return (
              <div key={p.id} className="space-y-2">
                <div
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm p-4 shadow-sm"
                  style={{ background: `${branding.primaryColor}10` }}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 text-[11px] text-muted-foreground">
                    <span className="font-medium" style={{ color: branding.darkColor }}>
                      {authorName(p)}
                    </span>
                    <span>{formatRelative(p.created_at)}</span>
                  </div>
                  <p
                    className="text-sm whitespace-pre-wrap font-serif italic"
                    style={{ color: branding.darkColor }}
                  >
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
                      const ownR = r.aluno_id === alunoId;
                      return (
                        <div
                          key={r.id}
                          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border bg-white p-3"
                          style={{ borderColor: `${branding.primaryColor}22` }}
                        >
                          <div className="flex items-center justify-between gap-2 text-[11px] text-muted-foreground mb-1">
                            <span className="font-medium" style={{ color: branding.darkColor }}>
                              {authorName(r)}
                            </span>
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
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRespostaPara(null)}
                        >
                          cancelar
                        </Button>
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
    </div>
  );
};

// ============= PÁGINA =============

const Conteudo = ({ aluno }: { aluno: AlunoRow }) => {
  const { id } = useParams();
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!id) return;
      setLoading(true);
      const { data } = await supabase
        .from("escola_modulos")
        .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,video_url,zoom_url,slides_url,apostila_url")
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (!data) setNotFound(true);
      else setModulo(data as Modulo);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

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
              <p className="text-sm text-muted-foreground mt-1">{formatDateLong(modulo.data_inicio)}</p>
              {modulo.tipo === "presencial" && (
                <Badge
                  className="text-[10px] mt-2"
                  style={{ background: `${branding.primaryColor}1A`, color: branding.primaryColor }}
                >
                  Presencial em SP
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Material */}
      <section className="space-y-4">
        <SectionTitle icon={VideoIcon}>Material</SectionTitle>
        <MaterialBlock modulo={modulo} />
      </section>

      {/* Recursos */}
      <RecursosBlock moduloId={modulo.id} />

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

      {/* Mural de post-its */}
      <section className="space-y-4">
        <SectionTitle icon={MessageCircle}>Mural de post-its</SectionTitle>
        <PostitsBlock moduloId={modulo.id} alunoId={aluno.id} />
      </section>
    </div>
  );
};

const EscolaAlunoModulo = () => (
  <EscolaAlunoShell>{(aluno) => <Conteudo aluno={aluno} />}</EscolaAlunoShell>
);

export default EscolaAlunoModulo;
