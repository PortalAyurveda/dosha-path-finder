import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Pin, Video as VideoIcon, ChevronRight, CalendarDays } from "lucide-react";
import EscolaAlunoShell, { escolaBranding as branding } from "./EscolaAlunoShell";
import type { AlunoRow } from "@/hooks/useEscolaAluno";

type Modulo = {
  id: string;
  numero: number;
  semestre: number | null;
  titulo: string;
  tipo: string;
  data_inicio: string;
  data_fim: string;
  zoom_url: string | null;
};

type Recado = {
  id: string;
  titulo: string | null;
  conteudo: string;
  fixado: boolean | null;
  created_at: string | null;
};

const formatDateLong = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return iso;
  }
};

const pickCurrentModulo = (mods: Modulo[]): Modulo | null => {
  if (mods.length === 0) return null;
  const now = Date.now();
  // Em andamento
  const emCurso = mods.find((m) => {
    const start = new Date(m.data_inicio).getTime();
    const end = new Date(m.data_fim).getTime();
    return start <= now && now <= end;
  });
  if (emCurso) return emCurso;
  // Próximo futuro
  const futuros = mods
    .filter((m) => new Date(m.data_inicio).getTime() > now)
    .sort((a, b) => +new Date(a.data_inicio) - +new Date(b.data_inicio));
  if (futuros[0]) return futuros[0];
  // Último passado
  const passados = mods
    .filter((m) => new Date(m.data_fim).getTime() < now)
    .sort((a, b) => +new Date(b.data_fim) - +new Date(a.data_fim));
  return passados[0] ?? mods[0];
};

const Conteudo = ({ aluno }: { aluno: AlunoRow }) => {
  const [loading, setLoading] = useState(true);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const modsP = supabase
      .from("escola_modulos")
      .select("id,numero,semestre,titulo,tipo,data_inicio,data_fim,zoom_url")
      .order("numero", { ascending: true });

    const recadosP = aluno.turma_id
      ? supabase
          .from("escola_recados")
          .select("id,titulo,conteudo,fixado,created_at")
          .eq("turma_id", aluno.turma_id)
          .order("fixado", { ascending: false })
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] as Recado[] });

    const [modsRes, recRes] = await Promise.all([modsP, recadosP]);
    setModulos((modsRes.data ?? []) as Modulo[]);
    setRecados(((recRes as any).data ?? []) as Recado[]);
    setLoading(false);
  }, [aluno.turma_id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-16 w-2/3" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  const atual = pickCurrentModulo(modulos);
  const primeiroNome = aluno.nome_completo.split(" ")[0];

  return (
    <div className="space-y-8">
      {/* Saudação */}
      <div className="space-y-1">
        <h1
          className="font-serif text-3xl md:text-4xl font-bold italic leading-tight"
          style={{ color: branding.darkColor }}
        >
          Olá, {primeiroNome}.
        </h1>
        <p className="text-base text-muted-foreground">
          Bem-vindo(a) à sua Formação em Ayurveda.
        </p>
      </div>

      {/* Próxima aula em destaque */}
      {atual && (
        <section
          className="relative overflow-hidden rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border bg-white"
          style={{ borderColor: `${branding.primaryColor}33` }}
        >
          {/* arco "portal" decorativo no topo */}
          <div
            aria-hidden
            className="absolute -top-24 left-1/2 -translate-x-1/2 w-[120%] h-40 rounded-b-full opacity-10"
            style={{ background: branding.primaryColor }}
          />
          <div className="relative p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Próxima aula ao vivo</span>
            </div>
            <div className="flex items-start gap-4">
              <span
                className="inline-flex items-center justify-center w-12 h-12 rounded-full text-white font-bold font-serif text-lg shrink-0"
                style={{ background: branding.primaryColor }}
              >
                {atual.numero}
              </span>
              <div className="min-w-0 flex-1">
                <h2
                  className="font-serif text-xl md:text-2xl font-bold italic leading-snug"
                  style={{ color: branding.darkColor }}
                >
                  {atual.titulo}
                </h2>
                <p className="text-sm text-muted-foreground capitalize mt-1">
                  {formatDateLong(atual.data_inicio)}
                </p>
                <p className="text-xs mt-2" style={{ color: branding.primaryColor }}>
                  Semestre {atual.semestre} · Módulo {atual.numero} de 15
                  {atual.tipo === "presencial" && (
                    <span className="ml-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px]"
                        style={{
                          background: `${branding.primaryColor}1A`,
                          color: branding.primaryColor,
                        }}
                      >
                        Presencial em SP
                      </Badge>
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap pt-2">
              {atual.zoom_url ? (
                <Button
                  asChild
                  className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm h-11 px-5"
                  style={{ background: branding.primaryColor, color: "#fff" }}
                >
                  <a href={atual.zoom_url} target="_blank" rel="noreferrer">
                    <VideoIcon className="w-4 h-4" /> Entrar no Zoom
                  </a>
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  Link será disponibilizado em breve.
                </p>
              )}
              <Button
                asChild
                variant="outline"
                className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm h-11 px-5"
                style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
              >
                <Link to={`/escola/aluno/modulo/${atual.id}`}>
                  Abrir sala do módulo <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Recados do professor */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Pin className="w-4 h-4" style={{ color: branding.primaryColor }} />
          <h2
            className="font-serif text-xl font-bold italic"
            style={{ color: branding.darkColor }}
          >
            Recados do professor
          </h2>
        </div>
        {recados.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum recado por enquanto.</p>
        ) : (
          <div className="space-y-3">
            {recados.map((r) => (
              <article
                key={r.id}
                className="bg-white rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm border p-4"
                style={{ borderColor: `${branding.primaryColor}22` }}
              >
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {r.fixado && (
                    <Badge
                      variant="secondary"
                      className="text-[10px]"
                      style={{
                        background: `${branding.primaryColor}1A`,
                        color: branding.primaryColor,
                      }}
                    >
                      fixado
                    </Badge>
                  )}
                  {r.titulo && (
                    <h3
                      className="font-serif font-bold text-sm"
                      style={{ color: branding.darkColor }}
                    >
                      {r.titulo}
                    </h3>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap text-foreground/80">{r.conteudo}</p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Atalho */}
      <div className="pt-2">
        <Button
          asChild
          variant="outline"
          className="rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm h-11 px-5"
          style={{ borderColor: branding.primaryColor, color: branding.primaryColor }}
        >
          <Link to="/escola/aluno/modulos">
            Ver os 15 módulos <ChevronRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
};

const EscolaAluno = () => (
  <EscolaAlunoShell>{(aluno) => <Conteudo aluno={aluno} />}</EscolaAlunoShell>
);

export default EscolaAluno;
