import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Clock, Play, Video as VideoIcon } from "lucide-react";
import EscolaAlunoShell, { escolaBranding as branding } from "./EscolaAlunoShell";
import Comments from "@/components/Comments";
import type { AlunoRow } from "@/hooks/useEscolaAluno";

type Chapter = { t: number; titulo: string };

type Recurso = {
  id: string;
  modulo_id: string;
  tipo: string;
  titulo: string;
  descricao: string | null;
  url: string | null;
  ordem: number | null;
  timestamps: Chapter[] | null;
};

type Modulo = { id: string; numero: number; titulo: string; slug: string | null };

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

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
};

const Conteudo = ({ aluno }: { aluno: AlunoRow }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [aula, setAula] = useState<Recurso | null>(null);
  const [siblings, setSiblings] = useState<Recurso[]>([]);
  const [modulo, setModulo] = useState<Modulo | null>(null);
  const [loading, setLoading] = useState(true);
  const [startSeconds, setStartSeconds] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { data: r } = await supabase
      .from("escola_modulo_recursos")
      .select("id,modulo_id,tipo,titulo,descricao,url,ordem,timestamps")
      .eq("id", id)
      .maybeSingle();
    if (!r) {
      setAula(null);
      setLoading(false);
      return;
    }
    setAula(r as unknown as Recurso);

    const [{ data: sibs }, { data: mod }] = await Promise.all([
      supabase
        .from("escola_modulo_recursos")
        .select("id,modulo_id,tipo,titulo,descricao,url,ordem,timestamps")
        .eq("modulo_id", (r as any).modulo_id)
        .eq("tipo", "material_video")
        .order("ordem", { ascending: true }),
      supabase
        .from("escola_modulos")
        .select("id,numero,titulo,slug")
        .eq("id", (r as any).modulo_id)
        .maybeSingle(),
    ]);
    setSiblings((sibs ?? []) as unknown as Recurso[]);
    setModulo((mod ?? null) as Modulo | null);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setStartSeconds(null);
  }, [id]);

  const videoId = useMemo(() => (aula?.url ? extractYoutubeId(aula.url) : null), [aula?.url]);
  const chapters = useMemo<Chapter[]>(() => {
    const raw = aula?.timestamps;
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((c) => c && typeof c.t === "number" && typeof c.titulo === "string")
      .sort((a, b) => a.t - b.t);
  }, [aula?.timestamps]);

  const moduloHref = modulo
    ? `/escola/aluno/modulo/${modulo.slug ?? modulo.id}`
    : "/escola/aluno/modulos";

  const idx = siblings.findIndex((s) => s.id === aula?.id);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="aspect-video w-full rounded-2xl" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!aula) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-sm text-muted-foreground">Aula não encontrada.</p>
        <Button asChild variant="outline">
          <Link to="/escola/aluno/modulos">Ver os módulos</Link>
        </Button>
      </div>
    );
  }

  const iframeSrc = videoId
    ? startSeconds !== null
      ? `https://www.youtube.com/embed/${videoId}?autoplay=1&start=${startSeconds}`
      : `https://www.youtube.com/embed/${videoId}`
    : "";

  return (
    <div className="space-y-6">
      <Button
        asChild
        variant="outline"
        size="sm"
        className="rounded-tl-xl rounded-br-xl rounded-tr-sm rounded-bl-sm"
        style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
      >
        <Link to={moduloHref}>
          <ArrowLeft className="w-4 h-4" /> Voltar ao módulo
        </Link>
      </Button>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-5">
          {videoId ? (
            <div className="aspect-video w-full rounded-2xl overflow-hidden border shadow-sm bg-black">
              <iframe
                key={String(startSeconds ?? "init")}
                src={iframeSrc}
                title={aula.titulo}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : aula.url ? (
            <a
              href={aula.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm"
              style={{ color: branding.primaryColor }}
            >
              <VideoIcon className="w-4 h-4" /> abrir vídeo
            </a>
          ) : null}

          <div>
            {modulo && (
              <p className="text-xs uppercase tracking-wider" style={{ color: branding.primaryColor }}>
                Módulo {modulo.numero} · {modulo.titulo}
              </p>
            )}
            <h1
              className="font-serif text-2xl md:text-3xl font-bold italic leading-tight mt-1"
              style={{ color: branding.darkColor }}
            >
              {aula.titulo}
            </h1>
            {aula.descricao && (
              <p className="text-sm text-foreground/80 whitespace-pre-line mt-3 leading-relaxed">
                {aula.descricao}
              </p>
            )}
          </div>

          {chapters.length > 0 && (
            <div
              className="rounded-xl border p-4 bg-white"
              style={{ borderColor: `${branding.primaryColor}33` }}
            >
              <h2 className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Capítulos
              </h2>
              <div className="space-y-1">
                {chapters.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => setStartSeconds(c.t)}
                    className="w-full text-left flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors group"
                  >
                    <span
                      className="flex items-center gap-1 font-mono text-sm font-semibold whitespace-nowrap mt-0.5"
                      style={{ color: branding.primaryColor }}
                    >
                      <Play className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {fmtTime(c.t)}
                    </span>
                    <span className="text-sm text-foreground leading-relaxed">{c.titulo}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navegação prev/next */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t">
            {prev ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/escola/aluno/aula/${prev.id}`)}
              >
                <ArrowLeft className="w-4 h-4" /> {prev.titulo}
              </Button>
            ) : <span />}
            {next ? (
              <Button
                size="sm"
                onClick={() => navigate(`/escola/aluno/aula/${next.id}`)}
                style={{ background: branding.primaryColor, color: "#fff" }}
              >
                {next.titulo} <ArrowRight className="w-4 h-4" />
              </Button>
            ) : <span />}
          </div>
        </div>

        <aside className="lg:col-span-1 lg:sticky lg:top-4">
          <Comments slug={`escola-aula-${aula.id}`} title="Comentários da turma" />
        </aside>
      </div>
    </div>
  );
};

const EscolaAlunoAula = () => (
  <EscolaAlunoShell>{(aluno) => <Conteudo aluno={aluno} />}</EscolaAlunoShell>
);

export default EscolaAlunoAula;
