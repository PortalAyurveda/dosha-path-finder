import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getIconeLucide } from "@/lib/iconesLucide";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ArrowLeft,
  ChevronDown,
  Circle,
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
import EscolaAlunoShell from "./EscolaAlunoShell";
import { formatModuloFimDeSemana, formatModuloHorarios } from "@/lib/escolaModuloDatas";
import type { AlunoRow } from "@/hooks/useEscolaAluno";
import { getPaletteBranding, type LandingPaletteKey } from "@/data/landingPalettes";

const BUCKET = "escola";
const SIMBOLO_MONO =
  "https://api.portalayurveda.com/storage/v1/object/public/portal_images/simbolo-positivo-mono.webp";

type Theme = {
  primaryColor: string;
  darkColor: string;
  lightColor: string;
  accentColor: string;
  warmBg: string;
  logo: string;
};

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
  palette_key: string | null;
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

type NuggetJson = {
  resumo?: string;
  ingredientes?: { qtd?: string; item?: string }[];
  modo_preparo?: string[];
  dicas?: string;
  efeito_esperado?: string;
  dravya_guna?: any;
};

type CardapioNugget = {
  titulo: string;
  icone_lucide: string | null;
  porque: string | null;
  imagem_url: string | null;
  video_id: string | null;
  nugget_json: NuggetJson | null;
};

type CardapioRpcRow = {
  dia: string;
  refeicao: string;
  ordem: number | null;
  nota: string | null;
  nuggets: CardapioNugget[];
};

const RECURSO_GROUPS: { tipo: string; label: string; icon: typeof VideoIcon }[] = [
  { tipo: "cardapio", label: "Cardápio prático", icon: Utensils },
  { tipo: "dinacharya", label: "Rotina de dinacharya", icon: Sparkles },
  { tipo: "experiencia", label: "Experiências vivenciais", icon: Sparkles },
];

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

const SectionTitle = ({
  icon: Icon,
  children,
  theme,
}: {
  icon: typeof VideoIcon;
  children: React.ReactNode;
  theme: Theme;
}) => (
  <h2
    className="font-serif text-xl font-bold italic flex items-center gap-2"
    style={{ color: theme.darkColor }}
  >
    <Icon className="w-5 h-5" style={{ color: theme.primaryColor }} />
    {children}
  </h2>
);

type MaterialExtra = { id: string; tipo: string; titulo: string; url: string | null };

const ApostilaExtraLink = ({
  item,
  theme,
}: {
  item: MaterialExtra;
  theme: Theme;
}) => {
  const [signed, setSigned] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!item.url) {
        setSigned(null);
        return;
      }
      const { data } = await supabase.storage.from(BUCKET).createSignedUrl(item.url, 60 * 60);
      if (!cancelled) setSigned(data?.signedUrl ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, [item.url]);
  return (
    <a
      href={signed ?? "#"}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex items-center gap-2 text-sm px-4 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border bg-white ${
        signed ? "" : "opacity-50 pointer-events-none"
      }`}
      style={{ borderColor: `${theme.primaryColor}55`, color: theme.darkColor }}
    >
      <FileText className="w-4 h-4" style={{ color: theme.primaryColor }} />
      {item.titulo} <Download className="w-3.5 h-3.5" />
    </a>
  );
};

const MaterialBlock = ({ modulo, theme }: { modulo: Modulo; theme: Theme }) => {
  const [apostilaUrl, setApostilaUrl] = useState<string | null>(null);
  const [extras, setExtras] = useState<MaterialExtra[]>([]);
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

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("escola_modulo_recursos")
        .select("id,tipo,titulo,url")
        .eq("modulo_id", modulo.id)
        .in("tipo", ["material_video", "material_zoom", "material_apostila"])
        .order("ordem", { ascending: true });
      if (!cancelled) setExtras((data ?? []) as MaterialExtra[]);
    })();
    return () => {
      cancelled = true;
    };
  }, [modulo.id]);

  const videosExtra = extras.filter((e) => e.tipo === "material_video");
  const zoomsExtra = extras.filter((e) => e.tipo === "material_zoom");
  const apostilasExtra = extras.filter((e) => e.tipo === "material_apostila");

  const hasAny =
    modulo.video_url ||
    modulo.apostila_url ||
    modulo.slides_url ||
    extras.length > 0;
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
              style={{ color: theme.primaryColor }}
            >
              <VideoIcon className="w-4 h-4" /> abrir vídeo
            </a>
          )}
        </div>
      )}

      {videosExtra.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Aulas</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {videosExtra.map((v) => {
              const yt = v.url ? extractYoutubeId(v.url) : null;
              return (
                <Link
                  key={v.id}
                  to={`/escola/aluno/aula/${v.id}`}
                  className="group bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border overflow-hidden hover:shadow-md transition-shadow"
                  style={{ borderColor: `${theme.primaryColor}22` }}
                >
                  <div className="aspect-video w-full bg-black relative overflow-hidden">
                    {yt ? (
                      <img
                        src={`https://img.youtube.com/vi/${yt}/mqdefault.jpg`}
                        alt={v.titulo}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/50">
                        <VideoIcon className="w-8 h-8" />
                      </div>
                    )}
                    <div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `${theme.darkColor}55` }}
                    >
                      <span
                        className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white"
                        style={{ background: theme.primaryColor }}
                      >
                        <VideoIcon className="w-5 h-5" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h4
                      className="font-serif font-bold text-sm leading-snug line-clamp-2"
                      style={{ color: theme.darkColor }}
                    >
                      {v.titulo}
                    </h4>
                  </div>
                </Link>
              );
            })}
          </div>
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
            style={{ borderColor: `${theme.primaryColor}55`, color: theme.darkColor }}
          >
            <FileText className="w-4 h-4" style={{ color: theme.primaryColor }} />
            Apostila <Download className="w-3.5 h-3.5" />
          </a>
        )}
        {apostilasExtra.map((a) =>
          a.url ? <ApostilaExtraLink key={a.id} item={a} theme={theme} /> : null
        )}
        {modulo.slides_url && (
          <a
            href={modulo.slides_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 text-sm px-4 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border bg-white"
            style={{ borderColor: `${theme.primaryColor}55`, color: theme.darkColor }}
          >
            <Link2 className="w-4 h-4" style={{ color: theme.primaryColor }} /> Slides
          </a>
        )}
        {zoomsExtra.map((z) =>
          z.url ? (
            <a
              key={z.id}
              href={z.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm px-4 h-11 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border bg-white"
              style={{ borderColor: `${theme.primaryColor}55`, color: theme.darkColor }}
            >
              <Link2 className="w-4 h-4" style={{ color: theme.primaryColor }} /> {z.titulo}
            </a>
          ) : null
        )}
      </div>
    </div>
  );
};

const VideosRecomendadosBlock = ({ recursos, theme }: { recursos: Recurso[]; theme: Theme }) => {
  if (recursos.length === 0) return null;
  return (
    <section className="space-y-3">
      <SectionTitle icon={VideoIcon} theme={theme}>
        Vídeos recomendados
      </SectionTitle>
      <div className="grid gap-4 md:grid-cols-2">
        {recursos.map((r) => {
          const yt = r.url ? extractYoutubeId(r.url) : null;
          return (
            <div
              key={r.id}
              className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border overflow-hidden"
              style={{ borderColor: `${theme.primaryColor}22` }}
            >
              {yt ? (
                <div className="aspect-video w-full bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${yt}`}
                    title={r.titulo}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
              <div className="p-4 space-y-1.5">
                <h3
                  className="font-serif font-bold text-base leading-snug"
                  style={{ color: theme.darkColor }}
                >
                  {r.titulo}
                </h3>
                {r.descricao && (
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">{r.descricao}</p>
                )}
                {!yt && r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm pt-1"
                    style={{ color: theme.primaryColor }}
                  >
                    <Link2 className="w-3.5 h-3.5" /> abrir
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const RecursosBlock = ({ moduloId, theme }: { moduloId: string; theme: Theme }) => {
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

  const videos = recursos.filter((r) => r.tipo === "video_recomendado");

  return (
    <div className="space-y-8">
      <VideosRecomendadosBlock recursos={videos} theme={theme} />
      {RECURSO_GROUPS.map((g) => {
        const itens = recursos.filter((r) => r.tipo === g.tipo);
        if (itens.length === 0) return null;
        return (
          <section key={g.tipo} className="space-y-3">
            <SectionTitle icon={g.icon} theme={theme}>
              {g.label}
            </SectionTitle>
            <div className="grid gap-3 md:grid-cols-2">
              {itens.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 space-y-2"
                  style={{ borderColor: `${theme.primaryColor}22` }}
                >
                  <h3
                    className="font-serif font-bold text-base leading-snug"
                    style={{ color: theme.darkColor }}
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
                      style={{ color: theme.primaryColor }}
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

const AutoavaliacaoBlock = ({
  moduloId,
  alunoId,
  theme,
}: {
  moduloId: string;
  alunoId: string;
  theme: Theme;
}) => {
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
          style={{ borderColor: `${theme.primaryColor}22` }}
        >
          <p className="font-serif font-bold text-sm" style={{ color: theme.darkColor }}>
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
              style={{ background: theme.primaryColor, color: "#fff" }}
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

const DiarioBlock = ({
  moduloId,
  alunoId,
  theme,
}: {
  moduloId: string;
  alunoId: string;
  theme: Theme;
}) => {
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
          style={{ background: theme.primaryColor, color: "#fff" }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar diário
        </Button>
      </div>
    </div>
  );
};

type MaterialAluno = {
  id: string;
  aluno_nome: string | null;
  titulo: string;
  storage_path: string;
  created_at: string | null;
  user_id: string | null;
};

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const MateriaisTurmaBlock = ({
  moduloId,
  aluno,
  theme,
}: {
  moduloId: string;
  aluno: AlunoRow;
  theme: Theme;
}) => {
  const [items, setItems] = useState<MaterialAluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [titulo, setTitulo] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("escola_modulo_materiais_alunos")
      .select("id,aluno_nome,titulo,storage_path,created_at,user_id")
      .eq("modulo_id", moduloId)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as MaterialAluno[]);
    setLoading(false);
  }, [moduloId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (file: File) => {
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) {
      toast({ title: "Arquivo grande demais", description: "Limite de 50MB por arquivo." });
      return;
    }
    setUploading(true);
    const safeName = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `alunos/${moduloId}/${Date.now()}_${safeName}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
    if (upErr) {
      setUploading(false);
      toast({ title: "Erro ao enviar", description: upErr.message });
      return;
    }
    const { error: insErr } = await supabase.from("escola_modulo_materiais_alunos").insert({
      modulo_id: moduloId,
      user_id: aluno.id,
      aluno_nome: aluno.nome_completo,
      titulo: titulo.trim() || file.name,
      storage_path: path,
    });
    setUploading(false);
    if (insErr) {
      toast({ title: "Erro ao registrar", description: insErr.message });
      return;
    }
    setTitulo("");
    toast({ title: "Material enviado" });
    load();
  };

  const download = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) {
      toast({ title: "Erro ao abrir", description: error?.message ?? "Sem URL" });
      return;
    }
    window.open(data.signedUrl, "_blank", "noreferrer");
  };

  return (
    <div className="space-y-4">
      <div
        className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4 bg-white space-y-3"
        style={{ borderColor: `${theme.primaryColor}33` }}
      >
        <p className="text-xs text-muted-foreground italic">
          Envie um arquivo (até 50MB) para compartilhar com toda a turma.
        </p>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Título (opcional)"
          className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
        />
        <label className="inline-flex">
          <input
            type="file"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <span
            className={`inline-flex items-center gap-2 text-sm px-4 h-10 rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm cursor-pointer text-white ${
              uploading ? "opacity-60 pointer-events-none" : ""
            }`}
            style={{ background: theme.primaryColor }}
          >
            {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            {uploading ? "Enviando…" : "Enviar arquivo"}
          </span>
        </label>
      </div>

      {loading ? (
        <Skeleton className="h-20 w-full" />
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">
          Nenhum material da turma enviado ainda.
        </p>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {items.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => download(m.storage_path)}
              className="text-left bg-white rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm border p-3 flex items-start gap-3 hover:shadow-sm transition-shadow"
              style={{ borderColor: `${theme.primaryColor}22` }}
            >
              <FileText className="w-4 h-4 mt-0.5 shrink-0" style={{ color: theme.primaryColor }} />
              <div className="min-w-0 flex-1">
                <p className="font-serif font-bold text-sm truncate" style={{ color: theme.darkColor }}>
                  {m.titulo}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {m.aluno_nome ?? "—"}
                  {m.created_at
                    ? ` · ${new Date(m.created_at).toLocaleDateString("pt-BR")}`
                    : ""}
                </p>
              </div>
              <Download className="w-4 h-4 text-muted-foreground shrink-0" />
            </button>
          ))}
        </div>
      )}
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
  lanche: "Lanche",
  ceia: "Ceia",
};

const NuggetCard = ({ nugget, theme }: { nugget: CardapioNugget; theme: Theme }) => {
  const [open, setOpen] = useState(false);
  const [porqueOpen, setPorqueOpen] = useState(false);

  const IconCmp = getIconeLucide(nugget.icone_lucide);

  const nj = nugget.nugget_json ?? {};
  const dg = (nj.dravya_guna ?? {}) as any;

  return (
    <div
      className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border overflow-hidden"
      style={{ borderColor: `${theme.primaryColor}22` }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-start gap-3 p-4">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: `${theme.primaryColor}18`, color: theme.primaryColor }}
          >
            <IconCmp className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div
              className="font-serif font-bold text-base leading-snug"
              style={{ color: theme.darkColor }}
            >
              {nugget.titulo}
            </div>
            {nugget.porque && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium" style={{ color: theme.primaryColor }}>
                  Por que aqui:
                </span>{" "}
                {nugget.porque}
              </p>
            )}
            <CollapsibleTrigger asChild>
              <button
                className="inline-flex items-center gap-1 text-xs font-medium pt-1"
                style={{ color: theme.primaryColor }}
              >
                ver receita
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t pt-3 space-y-3 text-sm" style={{ borderColor: `${theme.primaryColor}18` }}>
            {nj.resumo && <p className="text-muted-foreground leading-relaxed">{nj.resumo}</p>}
            {nj.ingredientes && nj.ingredientes.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1" style={{ color: theme.darkColor }}>Ingredientes</h4>
                <ul className="list-disc pl-5 space-y-0.5 text-muted-foreground">
                  {nj.ingredientes.map((i, idx) => (
                    <li key={idx}>{[i.qtd, i.item].filter(Boolean).join(" ")}</li>
                  ))}
                </ul>
              </div>
            )}
            {nj.modo_preparo && nj.modo_preparo.length > 0 && (
              <div>
                <h4 className="font-semibold mb-1" style={{ color: theme.darkColor }}>Modo de preparo</h4>
                <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
                  {nj.modo_preparo.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ol>
              </div>
            )}
            {nj.dicas && (
              <div>
                <h4 className="font-semibold mb-1" style={{ color: theme.darkColor }}>Dicas</h4>
                <p className="text-muted-foreground">{nj.dicas}</p>
              </div>
            )}
            {nj.efeito_esperado && (
              <div>
                <h4 className="font-semibold mb-1" style={{ color: theme.darkColor }}>Efeito esperado</h4>
                <p className="text-muted-foreground">{nj.efeito_esperado}</p>
              </div>
            )}
            {dg && Object.keys(dg).length > 0 && (
              <Collapsible open={porqueOpen} onOpenChange={setPorqueOpen}>
                <CollapsibleTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1 text-xs font-medium"
                    style={{ color: theme.primaryColor }}
                  >
                    por que funciona
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform ${porqueOpen ? "rotate-180" : ""}`} />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-2 space-y-1 text-xs text-muted-foreground">
                  {dg.rasa && dg.rasa.length > 0 && (
                    <p>
                      <span className="font-medium text-foreground">Sabores:</span> {dg.rasa.join(", ")}
                    </p>
                  )}
                  <p className="leading-relaxed">
                    {dg.virya && (
                      <>
                        <span className="font-medium text-foreground">Potência:</span> {dg.virya}
                        {" · "}
                      </>
                    )}
                    {dg.gunas && dg.gunas.length > 0 && (
                      <>
                        <span className="font-medium text-foreground">Qualidades:</span> {dg.gunas.join("/")}
                        {" · "}
                      </>
                    )}
                    {dg.karma && dg.karma.length > 0 && (
                      <>
                        <span className="font-medium text-foreground">Ações:</span> {dg.karma.join("/")}
                      </>
                    )}
                  </p>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

const CardapioBlock = ({ slug, theme }: { slug: string; theme: Theme }) => {
  const [rows, setRows] = useState<CardapioRpcRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.rpc("escola_cardapio_do_modulo" as any, { p_slug: slug });
      setRows(((data ?? []) as any) as CardapioRpcRow[]);
      setLoading(false);
    })();
  }, [slug]);

  if (loading) return <Skeleton className="h-32 w-full" />;
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Cardápio ainda não publicado.</p>;
  }

  return (
    <div className="space-y-6">
      {DIAS.map((d) => {
        const itensDia = rows
          .filter((r) => r.dia === d.key)
          .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0));
        if (itensDia.length === 0) return null;
        return (
          <div key={d.key} className="space-y-3">
            <h3
              className="font-serif font-bold italic text-lg pl-3 border-l-4"
              style={{ color: theme.darkColor, borderColor: theme.primaryColor }}
            >
              {d.label}
            </h3>
            <div className="space-y-4">
              {itensDia.map((refeicao) => (
                <div key={`${d.key}-${refeicao.refeicao}`} className="space-y-2">
                  <p
                    className="text-[11px] uppercase tracking-wider font-semibold"
                    style={{ color: theme.primaryColor }}
                  >
                    {REFEICAO_LABEL[refeicao.refeicao] ?? refeicao.refeicao}
                  </p>
                  {refeicao.nota && (
                    <p className="text-xs italic text-muted-foreground">{refeicao.nota}</p>
                  )}
                  {refeicao.nuggets && refeicao.nuggets.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      {refeicao.nuggets.map((n, i) => (
                        <NuggetCard key={i} nugget={n} theme={theme} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">a definir</p>
                  )}
                </div>
              ))}
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
      const columns = "id,numero,semestre,titulo,tipo,data_inicio,data_fim,slug,liberado,video_url,zoom_url,slides_url,apostila_url,palette_key";
      let { data } = await supabase
        .from("escola_modulos")
        .select(columns)
        .eq("slug", slug)
        .maybeSingle();
      if (!data && /^[0-9a-f-]{36}$/i.test(slug)) {
        const r = await supabase
          .from("escola_modulos")
          .select(columns)
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

  const theme: Theme = useMemo(() => {
    const key = (modulo?.palette_key as LandingPaletteKey) || "formacao-azul";
    return getPaletteBranding(key) as Theme;
  }, [modulo?.palette_key]);

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
  const currentSlug = modulo.slug ?? modulo.id;

  return (
    <div className="space-y-10">
      <div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm mb-4"
          style={{ borderColor: theme.primaryColor, color: theme.primaryColor }}
        >
          <Link to="/escola/aluno/modulos">
            <ArrowLeft className="w-4 h-4" /> Todos os módulos
          </Link>
        </Button>

        <div
          className="relative overflow-hidden rounded-tl-[48px] rounded-tr-[48px] rounded-br-3xl rounded-bl-sm border p-6 md:p-8"
          style={{
            borderColor: `${theme.primaryColor}33`,
            background: `linear-gradient(180deg, ${theme.lightColor}80 0%, #ffffff 100%)`,
          }}
        >
          {/* Marca d'água símbolo Portal */}
          <img
            src={SIMBOLO_MONO}
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-6 top-1/2 -translate-y-1/2 h-[110%] w-auto object-contain"
            style={{ opacity: 0.09 }}
          />

          <div className="relative flex items-start gap-4">
            <span
              className="inline-flex items-center justify-center w-14 h-14 rounded-full text-white font-serif font-bold text-xl shrink-0"
              style={{ background: theme.primaryColor }}
            >
              {modulo.numero}
            </span>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider" style={{ color: theme.primaryColor }}>
                Semestre {modulo.semestre} · Módulo {modulo.numero} de 15
              </p>
              <h1
                className="font-serif text-2xl md:text-3xl font-bold italic leading-tight mt-1"
                style={{ color: theme.darkColor }}
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
                    style={{ background: `${theme.primaryColor}1A`, color: theme.darkColor }}
                  >
                    <Lock className="w-3 h-3" /> cadeado
                  </Badge>
                )}
                {modulo.tipo === "presencial" && (
                  <Badge
                    className="text-[10px]"
                    style={{ background: `${theme.primaryColor}1A`, color: theme.darkColor }}
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
          style={{ borderColor: `${theme.primaryColor}33` }}
        >
          <Lock className="w-8 h-8 mx-auto" style={{ color: theme.primaryColor }} />
          <h2 className="font-serif text-xl italic font-bold" style={{ color: theme.darkColor }}>
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
            <SectionTitle icon={VideoIcon} theme={theme}>Material</SectionTitle>
            <MaterialBlock modulo={modulo} theme={theme} />
          </section>

          {/* Recursos */}
          <RecursosBlock moduloId={modulo.id} theme={theme} />

          {/* Cardápio */}
          <section className="space-y-4">
            <SectionTitle icon={Utensils} theme={theme}>Cardápio do fim de semana</SectionTitle>
            <CardapioBlock slug={currentSlug} theme={theme} />
          </section>

          {/* Autoavaliação */}
          <section className="space-y-4">
            <SectionTitle icon={FileText} theme={theme}>Autoavaliação</SectionTitle>
            <AutoavaliacaoBlock moduloId={modulo.id} alunoId={aluno.id} theme={theme} />
          </section>

          {/* Diário */}
          <section className="space-y-4">
            <SectionTitle icon={Sparkles} theme={theme}>Diário de evolução clínica</SectionTitle>
            <DiarioBlock moduloId={modulo.id} alunoId={aluno.id} theme={theme} />
          </section>

          {/* Materiais da turma */}
          <section className="space-y-4">
            <SectionTitle icon={FileText} theme={theme}>Materiais da turma</SectionTitle>
            <MateriaisTurmaBlock moduloId={modulo.id} aluno={aluno} theme={theme} />
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
