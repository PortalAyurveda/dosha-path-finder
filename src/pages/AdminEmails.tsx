import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Eye,
  ExternalLink,
  Mail,
  AlertTriangle,

} from "lucide-react";

import AdminNav from "@/components/admin/AdminNav";
import { supabase } from "@/integrations/supabase/client";
import { lojaSupabase } from "@/integrations/supabase/loja-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// =========================================================================
// Tipos
// =========================================================================
type VisaoRow = {
  id: string;
  nome: string | null;
  tipo: string | null;
  ativo: boolean | null;
  assunto: string | null;
  regras: any;
  tem_secoes: boolean | null;
  qtd_secoes: number | null;
  envios_ultimos_30d: number | null;
  ultimo_envio_em: string | null;
  elegiveis_agora: number | null;
};

type Comunicacao = {
  id: string;
  nome: string | null;
  tipo: string | null;
  ativo: boolean | null;
  assunto: string | null;
  label: string | null;
  h1: string | null;
  h1sub: string | null;
  corpo_html: string | null;
  cta_texto: string | null;
  cta_url: string | null;
  publico_premium: string | null;
  publico_dosha: string | null;
  regras: any;
};

type Secao = {
  id: string;
  comunicacao_id: string;
  ordem: number | null;
  tipo: string;
  titulo: string | null;
  texto: string | null;
  video_id: string | null;
  receita_id: string | null;
  artigo_id: string | null;
  produto_id: number | null;
  biblioteca_pagina: string | null;
  banner_id: string | null;
  cta_texto: string | null;
  cta_url: string | null;
  ativo: boolean | null;
};

const PUBLICO_PREMIUM = ["premium", "free", "compradores", "todos"];
const PUBLICO_DOSHA = ["Vata", "Pitta", "Kapha", "todos", "agravado"];
const TIPOS_SECAO = [
  "apresentacao",
  "video",
  "artigo",
  "receita",
  "produto",
  "biblioteca",
  "texto",
  "banner",
  "fechamento",
];
const BIBLIOTECA_PAGINAS: { value: string; label: string }[] = [
  { value: "horarios", label: "Horários dos doshas" },
  { value: "vata", label: "Vata" },
  { value: "pitta", label: "Pitta" },
  { value: "kapha", label: "Kapha" },
  { value: "index", label: "Índice" },
];

const GRUPOS_PUBLICO: { value: string; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "premium", label: "Premium" },
  { value: "compradores", label: "Compradores" },
  { value: "todos", label: "Todos" },
];

const PREVIEW_REAL_URL =
  "https://api.portalayurveda.com/functions/v1/admin-preview-email";

const fmtData = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "—";
  }
};

// =========================================================================
// Busca de conteúdo por tipo
// =========================================================================
type Opcao = { value: string; label: string };

const useBuscaConteudo = (tipo: string, termo: string) =>
  useQuery({
    queryKey: ["admin-emails-busca", tipo, termo],
    enabled: ["video", "receita", "artigo", "produto", "banner"].includes(tipo),
    queryFn: async (): Promise<Opcao[]> => {
      const like = `%${termo}%`;
      if (tipo === "video") {
        let q = supabase
          .from("videos_seo")
          .select("video_id, novo_titulo")
          .limit(25);
        if (termo) q = q.ilike("novo_titulo", like);
        const { data, error } = await q;
        if (error) throw error;
        return (data ?? []).map((r: any) => ({
          value: r.video_id,
          label: r.novo_titulo ?? r.video_id,
        }));
      }
      if (tipo === "receita") {
        let q = supabase
          .from("portal_receitas")
          .select("video_id, novo_titulo")
          .limit(25);
        if (termo) q = q.ilike("novo_titulo", like);
        const { data, error } = await q;
        if (error) throw error;
        return (data ?? []).map((r: any) => ({
          value: r.video_id,
          label: r.novo_titulo ?? r.video_id,
        }));
      }
      if (tipo === "artigo") {
        let q = supabase.from("portal_conteudo").select("id, title").limit(25);
        if (termo) q = q.ilike("title", like);
        const { data, error } = await q;
        if (error) throw error;
        return (data ?? []).map((r: any) => ({
          value: r.id,
          label: r.title ?? r.id,
        }));
      }
      if (tipo === "banner") {
        let q = supabase.from("banners").select("id, titulo_admin").limit(25);
        if (termo) q = q.ilike("titulo_admin", like);
        const { data, error } = await q;
        if (error) throw error;
        return (data ?? []).map((r: any) => ({
          value: r.id,
          label: r.titulo_admin ?? r.id,
        }));
      }
      let q = lojaSupabase.from("produtos").select("id, nome_display").limit(25);
      if (termo) q = q.ilike("nome_display", like);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        value: String(r.id),
        label: r.nome_display ?? String(r.id),
      }));
    },
  });

const SeletorConteudo = ({
  tipo,
  valor,
  onChange,
}: {
  tipo: string;
  valor: string | null;
  onChange: (v: string | null) => void;
}) => {
  const [termo, setTermo] = useState("");
  const [busca, setBusca] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setBusca(termo), 300);
    return () => clearTimeout(t);
  }, [termo]);
  const { data: opcoes, isLoading } = useBuscaConteudo(tipo, busca);

  const atual = opcoes?.find((o) => o.value === valor);

  return (
    <div className="space-y-2">
      <Input
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        placeholder="Buscar…"
        aria-label="Buscar conteúdo"
      />
      <div className="max-h-44 overflow-y-auto rounded-md border border-border divide-y divide-border">
        {isLoading && (
          <div className="p-2">
            <Skeleton className="h-4 w-2/3" />
          </div>
        )}
        {!isLoading &&
          (opcoes ?? []).map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-muted ${
                o.value === valor ? "bg-muted font-medium" : ""
              }`}
            >
              {o.label}
            </button>
          ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {valor ? `${atual?.label ?? valor} (${valor})` : "—"}
      </p>
    </div>
  );
};

// =========================================================================
// Dashboard (saúde)
// =========================================================================
type DashboardRow = {
  id: string;
  nome: string | null;
  tipo: string | null;
  ativo: boolean | null;
  publico_premium: string | null;
  publico_dosha: string | null;
  assunto: string | null;
  label: string | null;
  cta_url: string | null;
  envios_total: number | null;
  envios_30d: number | null;
  ultimo_envio_em: string | null;
  elegiveis_agora: number | null;
  aberturas_30d: number | null;
  cliques_30d: number | null;
  taxa_abertura_30d: number | null;
  taxa_clique_30d: number | null;
  tokens_quebrados: string[] | null;
  saude: string | null;
  saude_motivo: string | null;
};

const useDashboard = () =>
  useQuery({
    queryKey: ["admin-agenda-dashboard"],
    queryFn: async (): Promise<DashboardRow[]> => {
      const { data, error } = await (supabase as any).rpc(
        "admin_agenda_dashboard",
      );
      if (error) throw error;
      return (data ?? []) as DashboardRow[];
    },
  });

const SAUDE_ESTILO: Record<string, { faixa: string; ponto: string; label: string }> = {
  critica: { faixa: "bg-destructive", ponto: "bg-destructive", label: "Crítica" },
  atencao: { faixa: "bg-amber-500", ponto: "bg-amber-500", label: "Atenção" },
  boa: { faixa: "bg-emerald-500", ponto: "bg-emerald-500", label: "Boa" },
  desligada: { faixa: "bg-muted-foreground/50", ponto: "bg-muted-foreground/50", label: "Desligada" },
  neutra: { faixa: "bg-muted", ponto: "bg-muted-foreground/30", label: "Neutra" },
};

const estiloSaude = (s: string | null) =>
  SAUDE_ESTILO[s ?? "neutra"] ?? SAUDE_ESTILO.neutra;

const fmtPct = (v: number | null | undefined) =>
  v === null || v === undefined ? "—" : `${Number(v).toFixed(1).replace(".", ",")}%`;

const SaudeBloco = ({ row }: { row: DashboardRow }) => {
  const e = estiloSaude(row.saude);
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${e.ponto}`} />
        <span className="text-xs font-semibold text-foreground">{e.label}</span>
      </div>
      {row.saude_motivo && (
        <p className="text-xs text-muted-foreground leading-snug">
          {row.saude_motivo}
        </p>
      )}
    </div>
  );
};

const SeloToken = ({ tokens }: { tokens: string[] | null }) =>
  tokens && tokens.length > 0 ? (
    <Badge variant="destructive" className="gap-1">
      <AlertTriangle className="w-3 h-3" />
      token quebrado
    </Badge>
  ) : null;

// =========================================================================
// Lista (painel de cards)
// =========================================================================
const Lista = ({ onAbrir }: { onAbrir: (id: string) => void }) => {
  const qc = useQueryClient();
  const { data, isLoading } = useDashboard();
  const [ordem, setOrdem] = useState<"tipo" | "saude" | "melhores">("tipo");

  const toggleAtivo = useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { error } = await supabase
        .from("agenda_comunicacoes")
        .update({ ativo })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-agenda-dashboard"] });
      toast.success("Status atualizado");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao atualizar"),
  });

  const pesoSaude: Record<string, number> = {
    critica: 0,
    atencao: 1,
    boa: 2,
    neutra: 3,
    desligada: 4,
  };

  const blocos = useMemo(() => {
    const rows = [...(data ?? [])];
    if (ordem === "saude") {
      rows.sort(
        (a, b) =>
          (pesoSaude[a.saude ?? "neutra"] ?? 3) -
          (pesoSaude[b.saude ?? "neutra"] ?? 3),
      );
      return [{ titulo: "Por saúde", linhas: rows }];
    }
    if (ordem === "melhores") {
      rows.sort(
        (a, b) => (b.taxa_abertura_30d ?? -1) - (a.taxa_abertura_30d ?? -1),
      );
      return [{ titulo: "Pelos melhores", linhas: rows }];
    }
    return (["regua", "campanha"] as const)
      .map((tipo) => ({
        titulo: tipo === "regua" ? "Réguas automáticas" : "Campanhas",
        linhas: rows.filter((r) => (r.tipo ?? "") === tipo),
      }))
      .filter((b) => b.linhas.length > 0);
  }, [data, ordem]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Label htmlFor="ordenacao" className="text-sm text-muted-foreground">
          Ordenar
        </Label>
        <Select value={ordem} onValueChange={(v) => setOrdem(v as any)}>
          <SelectTrigger id="ordenacao" className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tipo">Por tipo (réguas primeiro)</SelectItem>
            <SelectItem value="saude">Por saúde (crítica primeiro)</SelectItem>
            <SelectItem value="melhores">Pelos melhores (abertura)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {blocos.map((bloco) => (
        <section key={bloco.titulo} className="space-y-4">
          <h2 className="text-xl font-heading font-bold text-foreground">
            {bloco.titulo}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {bloco.linhas.map((r) => {
              const e = estiloSaude(r.saude);
              return (
                <div
                  key={r.id}
                  className="rounded-xl border border-border bg-card overflow-hidden"
                >
                  <div className={`h-1.5 w-full ${e.faixa}`} />
                  <div className="p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => onAbrir(r.id)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium text-foreground">
                          {r.nome ?? r.id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {r.id}
                        </div>
                      </button>
                      <Switch
                        checked={!!r.ativo}
                        onCheckedChange={(v) =>
                          toggleAtivo.mutate({ id: r.id, ativo: v })
                        }
                        aria-label={`Ativar ${r.nome ?? r.id}`}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline">
                        {r.tipo === "regua" ? "régua" : "campanha"}
                      </Badge>
                      <Badge variant="secondary">
                        {r.publico_premium ?? "todos"}
                      </Badge>
                      {r.publico_dosha && r.publico_dosha !== "todos" && (
                        <Badge variant="outline">{r.publico_dosha}</Badge>
                      )}
                      <SeloToken tokens={r.tokens_quebrados} />
                    </div>

                    <SaudeBloco row={r} />

                    <div className="pt-1 border-t border-border">
                      <MiniTabela row={r} />
                    </div>


                    <div className="text-xs text-muted-foreground">
                      Último envio: {fmtData(r.ultimo_envio_em)}
                      {r.elegiveis_agora !== null &&
                        r.elegiveis_agora !== undefined &&
                        ` · ${Number(r.elegiveis_agora)} elegíveis agora`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};


// =========================================================================
// Editor
// =========================================================================
const Editor = ({ id, onVoltar }: { id: string; onVoltar: () => void }) => {
  const qc = useQueryClient();
  const [form, setForm] = useState<Partial<Comunicacao>>({});
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewAviso, setPreviewAviso] = useState<string | null>(null);
  const { data: dashboard } = useDashboard();
  const metricas = (dashboard ?? []).find((r) => r.id === id) ?? null;


  const { data: com, isLoading } = useQuery({
    queryKey: ["admin-emails-com", id],
    queryFn: async (): Promise<Comunicacao> => {
      const { data, error } = await supabase
        .from("agenda_comunicacoes")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data as unknown as Comunicacao;
    },
  });

  useEffect(() => {
    if (com) setForm(com);
  }, [com]);

  const { data: secoes } = useQuery({
    queryKey: ["admin-emails-secoes", id],
    queryFn: async (): Promise<Secao[]> => {
      const { data, error } = await supabase
        .from("agenda_comunicacoes_secoes")
        .select("*")
        .eq("comunicacao_id", id)
        .order("ordem", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Secao[];
    },
  });

  const salvarGerais = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("agenda_comunicacoes")
        .update({
          assunto: form.assunto ?? null,
          label: form.label ?? null,
          h1: form.h1 ?? null,
          h1sub: form.h1sub ?? null,
          cta_texto: form.cta_texto ?? null,
          cta_url: form.cta_url ?? null,
          publico_premium: form.publico_premium ?? null,
          publico_dosha: form.publico_dosha ?? null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-emails-com", id] });
      qc.invalidateQueries({ queryKey: ["admin-agenda-publicos"] });
      toast.success("Salvo");
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar"),
  });

  const atualizarSecao = useMutation({
    mutationFn: async ({
      secaoId,
      patch,
    }: {
      secaoId: string;
      patch: Partial<Secao>;
    }) => {
      const { error } = await supabase
        .from("agenda_comunicacoes_secoes")
        .update(patch as any)
        .eq("id", secaoId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-emails-secoes", id] }),
    onError: (e: any) => toast.error(e?.message ?? "Erro ao salvar seção"),
  });

  const removerSecao = useMutation({
    mutationFn: async (secaoId: string) => {
      const { error } = await supabase
        .from("agenda_comunicacoes_secoes")
        .delete()
        .eq("id", secaoId);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-emails-secoes", id] }),
    onError: (e: any) => toast.error(e?.message ?? "Erro ao remover"),
  });

  const adicionarSecao = useMutation({
    mutationFn: async () => {
      const ordem =
        (secoes ?? []).reduce((m, s) => Math.max(m, s.ordem ?? 0), 0) + 1;
      const { error } = await supabase
        .from("agenda_comunicacoes_secoes")
        .insert({
          comunicacao_id: id,
          ordem,
          tipo: "texto",
          ativo: true,
        } as any);
      if (error) throw error;
    },
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["admin-emails-secoes", id] }),
    onError: (e: any) => toast.error(e?.message ?? "Erro ao adicionar"),
  });

  const mover = async (index: number, dir: -1 | 1) => {
    const lista = [...(secoes ?? [])];
    const alvo = index + dir;
    if (alvo < 0 || alvo >= lista.length) return;
    const a = lista[index];
    const b = lista[alvo];
    await Promise.all([
      supabase
        .from("agenda_comunicacoes_secoes")
        .update({ ordem: b.ordem ?? alvo })
        .eq("id", a.id),
      supabase
        .from("agenda_comunicacoes_secoes")
        .update({ ordem: a.ordem ?? index })
        .eq("id", b.id),
    ]);
    qc.invalidateQueries({ queryKey: ["admin-emails-secoes", id] });
  };

  const gerarPreview = async () => {
    const { data, error } = await (supabase as any).rpc(
      "renderizar_secoes_email",
      { p_comunicacao_id: id },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data) {
      setPreviewHtml(data as string);
      setPreviewAviso(null);
    } else {
      setPreviewHtml(com?.corpo_html ?? "");
      setPreviewAviso(
        "esta comunicação usa corpo_html fixo, não seções — os campos {{tokens}} entre chaves duplas são dinâmicos e não vão aparecer preenchidos no preview",
      );
    }
  };

  if (isLoading || !com) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  const statusRegras =
    com.regras && typeof com.regras === "object"
      ? (com.regras as any).status
      : null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onVoltar} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h2 className="text-xl font-heading font-bold text-foreground">
            {com.nome ?? com.id}
          </h2>
          <p className="text-xs text-muted-foreground">{com.id}</p>
        </div>
      </div>

      {/* Métricas (só leitura) */}
      {metricas && (
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <div className={`h-1.5 w-full ${estiloSaude(metricas.saude).faixa}`} />
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <SaudeBloco row={metricas} />
              <SeloToken tokens={metricas.tokens_quebrados} />
            </div>

            {metricas.tokens_quebrados &&
              metricas.tokens_quebrados.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3">
                  <p className="text-sm font-semibold text-foreground">
                    Campos que o motor de envio não sabe preencher:
                  </p>
                  <ul className="mt-1 text-sm text-muted-foreground list-disc pl-5">
                    {metricas.tokens_quebrados.map((t) => (
                      <li key={t}>
                        <code>{t}</code>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            <MiniTabela row={metricas} />

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {Number(metricas.envios_total ?? 0)}
                </div>
                <div className="text-xs text-muted-foreground">envios (total)</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {fmtData(metricas.ultimo_envio_em)}
                </div>
                <div className="text-xs text-muted-foreground">último envio</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">
                  {metricas.elegiveis_agora === null ||
                  metricas.elegiveis_agora === undefined
                    ? "—"
                    : Number(metricas.elegiveis_agora)}
                </div>
                <div className="text-xs text-muted-foreground">elegíveis agora</div>
              </div>
            </div>
          </div>
        </section>
      )}

      <DetalheAnalytics id={id} />


      {/* A) Dados gerais */}

      <section className="rounded-xl border border-border bg-card p-5 space-y-4">
        <h3 className="font-heading font-bold text-foreground">Dados gerais</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={form.assunto ?? ""}
              onChange={(e) => setForm({ ...form, assunto: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={form.label ?? ""}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="h1">H1</Label>
            <Input
              id="h1"
              value={form.h1 ?? ""}
              onChange={(e) => setForm({ ...form, h1: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="h1sub">H1 sub</Label>
            <Input
              id="h1sub"
              value={form.h1sub ?? ""}
              onChange={(e) => setForm({ ...form, h1sub: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cta_texto">CTA texto</Label>
            <Input
              id="cta_texto"
              value={form.cta_texto ?? ""}
              onChange={(e) => setForm({ ...form, cta_texto: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cta_url">CTA url</Label>
            <Input
              id="cta_url"
              value={form.cta_url ?? ""}
              onChange={(e) => setForm({ ...form, cta_url: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>publico_premium</Label>
            <Select
              value={form.publico_premium ?? undefined}
              onValueChange={(v) => setForm({ ...form, publico_premium: v })}
            >
              <SelectTrigger aria-label="Público premium">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {PUBLICO_PREMIUM.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>publico_dosha</Label>
            <Select
              value={form.publico_dosha ?? undefined}
              onValueChange={(v) => setForm({ ...form, publico_dosha: v })}
            >
              <SelectTrigger aria-label="Público dosha">
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {PUBLICO_DOSHA.map((o) => (
                  <SelectItem key={o} value={o}>
                    {o}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {statusRegras && (
          <div className="rounded-lg bg-muted p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              regras.status
            </p>
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {typeof statusRegras === "string"
                ? statusRegras
                : JSON.stringify(statusRegras, null, 2)}
            </p>
          </div>
        )}

        <Button
          onClick={() => salvarGerais.mutate()}
          disabled={salvarGerais.isPending}
        >
          Salvar
        </Button>
      </section>

      {/* B) Seções */}
      <section className="space-y-4">
        <h3 className="font-heading font-bold text-foreground">Seções</h3>
        {(secoes ?? []).map((s, i) => (
          <div
            key={s.id}
            className="rounded-xl border border-border bg-card p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground w-6">{i + 1}</span>
              <Select
                value={s.tipo}
                onValueChange={(v) =>
                  atualizarSecao.mutate({ secaoId: s.id, patch: { tipo: v } })
                }
              >
                <SelectTrigger className="w-48" aria-label="Tipo da seção">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_SECAO.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2 ml-auto">
                <Switch
                  checked={!!s.ativo}
                  onCheckedChange={(v) =>
                    atualizarSecao.mutate({ secaoId: s.id, patch: { ativo: v } })
                  }
                  aria-label="Seção ativa"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => mover(i, -1)}
                  aria-label="Mover para cima"
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => mover(i, 1)}
                  aria-label="Mover para baixo"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removerSecao.mutate(s.id)}
                  aria-label="Remover seção"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {s.tipo === "video" && (
              <SeletorConteudo
                tipo="video"
                valor={s.video_id}
                onChange={(v) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { video_id: v },
                  })
                }
              />
            )}
            {s.tipo === "receita" && (
              <SeletorConteudo
                tipo="receita"
                valor={s.receita_id}
                onChange={(v) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { receita_id: v },
                  })
                }
              />
            )}
            {s.tipo === "artigo" && (
              <SeletorConteudo
                tipo="artigo"
                valor={s.artigo_id}
                onChange={(v) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { artigo_id: v },
                  })
                }
              />
            )}
            {s.tipo === "produto" && (
              <SeletorConteudo
                tipo="produto"
                valor={s.produto_id ? String(s.produto_id) : null}
                onChange={(v) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { produto_id: v ? Number(v) : null },
                  })
                }
              />
            )}
            {s.tipo === "banner" && (
              <SeletorConteudo
                tipo="banner"
                valor={s.banner_id}
                onChange={(v) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { banner_id: v },
                  })
                }
              />
            )}
            {s.tipo === "biblioteca" && (
              <Select
                value={s.biblioteca_pagina ?? undefined}
                onValueChange={(v) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { biblioteca_pagina: v },
                  })
                }
              >
                <SelectTrigger className="w-64" aria-label="Página da biblioteca">
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {BIBLIOTECA_PAGINAS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {["texto", "apresentacao", "fechamento"].includes(s.tipo) && (
              <div className="space-y-2">
                <Input
                  defaultValue={s.titulo ?? ""}
                  placeholder="Título"
                  aria-label="Título da seção"
                  onBlur={(e) =>
                    atualizarSecao.mutate({
                      secaoId: s.id,
                      patch: { titulo: e.target.value },
                    })
                  }
                />
                <Textarea
                  defaultValue={s.texto ?? ""}
                  rows={4}
                  placeholder="Texto"
                  aria-label="Texto da seção"
                  onBlur={(e) =>
                    atualizarSecao.mutate({
                      secaoId: s.id,
                      patch: { texto: e.target.value },
                    })
                  }
                />
              </div>
            )}

            <div className="grid gap-2 md:grid-cols-2">
              <Input
                defaultValue={s.cta_texto ?? ""}
                placeholder="CTA texto"
                aria-label="CTA texto da seção"
                onBlur={(e) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { cta_texto: e.target.value || null },
                  })
                }
              />
              <Input
                defaultValue={s.cta_url ?? ""}
                placeholder="CTA url"
                aria-label="CTA url da seção"
                onBlur={(e) =>
                  atualizarSecao.mutate({
                    secaoId: s.id,
                    patch: { cta_url: e.target.value || null },
                  })
                }
              />
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => adicionarSecao.mutate()}
        >
          <Plus className="w-4 h-4" />
          adicionar seção
        </Button>
      </section>

      {/* C) Preview */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={gerarPreview} className="gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <a href={PREVIEW_REAL_URL} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4" />
              Ver com dado real de uma pessoa
            </a>
          </Button>
        </div>
        {previewAviso && (
          <p className="text-sm text-muted-foreground">{previewAviso}</p>
        )}
        {previewHtml !== null && (
          <iframe
            title="Preview do email"
            srcDoc={previewHtml}
            className="w-full h-[640px] rounded-xl border border-border bg-white"
          />
        )}
      </section>
    </div>
  );
};

// =========================================================================
// Página
// =========================================================================
const AdminEmails = () => {
  const [params, setParams] = useSearchParams();
  const id = params.get("id");

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Emails — Admin</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-2xl font-heading font-bold text-foreground">
            Emails
          </h1>
        </div>
        {id ? (
          <Editor
            id={id}
            onVoltar={() =>
              setParams(
                (atual) => {
                  const next = new URLSearchParams(atual);
                  next.delete("id");
                  return next;
                },
                { replace: true },
              )
            }
          />
        ) : (
          <Lista
            onAbrir={(v) =>
              setParams(
                (atual) => {
                  const next = new URLSearchParams(atual);
                  next.set("id", v);
                  return next;
                },
                { replace: true },
              )
            }
          />
        )}
      </main>
    </div>
  );
};

export default AdminEmails;
