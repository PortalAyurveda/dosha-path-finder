import { Helmet } from "react-helmet-async";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminNav from "@/components/admin/AdminNav";
import StatCard from "@/components/admin/dashboard/StatCard";
import LastItemCard from "@/components/admin/dashboard/LastItemCard";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  Image as ImageIcon,
  FileText,
  MessageCircle,
  Inbox,
  ClipboardList,
  ShoppingCart,
  Crown,
  Users,
  History,
  BarChart3,
  ExternalLink,
  UserPlus,
  ShieldAlert,
  TrendingUp,
  AlertTriangle,
  Database,
  KeyRound,
  PackageCheck,
  CheckCircle2,
  Sparkles,
  Repeat,
} from "lucide-react";
import {
  useUltimaImagem,
  useUltimoArtigo,
  useAkashaHoje,
  useMensagensNaoLidas,
  useTestesRange,
  useVendasRange,
  useAssinaturasRange,
  useUltimoTerapeuta,
  useUltimoDevlog,
  useNovosUsuarios,
  useAuditoriaRagPendente,
  useConversaoTesteAssinatura,
  useSystemHealth,
} from "@/hooks/useAdminDashboard";

type Resumo = {
  precisa_de_voce: {
    pedidos_a_enviar: number;
    mensagens_nao_respondidas: number;
    terapeutas_pendentes: number;
    erros_24h: number;
  };
  vendas_hoje: { loja_valor: number; loja_qtd: number; rotina_qtd: number; premium_qtd: number };
  vendas_7d: { loja_valor: number; loja_qtd: number; rotina_qtd: number; premium_qtd: number };
  atividade: {
    testes_hoje: number;
    testes_7d: number;
    akasha_msgs_24h: number;
    akasha_sessoes_24h: number;
    novos_usuarios_hoje: number;
    novos_usuarios_7d: number;
  };
  ultimos: {
    venda_loja?: { valor: number; quando: string; nome: string } | null;
    assinatura?: { plano: string; valor: number; quando: string } | null;
    mensagem?: { assunto: string; nome: string; quando: string } | null;
    terapeuta_pendente?: { nome: string } | null;
  };
};

const DOSHA_COLORS = {
  vata: "#93C5FD",
  pitta: "#FCA5A5",
  kapha: "#86EFAC",
  vata_pitta: "linear-gradient(90deg,#93C5FD 0%,#FCA5A5 100%)",
  vata_kapha: "linear-gradient(90deg,#93C5FD 0%,#86EFAC 100%)",
  pitta_kapha: "linear-gradient(90deg,#FCA5A5 0%,#86EFAC 100%)",
  outro: "#D4D4D8",
};
const DOSHA_LABELS: Record<string, string> = {
  vata: "Vata",
  pitta: "Pitta",
  kapha: "Kapha",
  vata_pitta: "Vata-Pitta",
  vata_kapha: "Vata-Kapha",
  pitta_kapha: "Pitta-Kapha",
};
const DOSHA_KEYS = ["vata", "pitta", "kapha", "vata_pitta", "vata_kapha", "pitta_kapha"] as const;

const fmtBRL = (v: number) =>
  (v ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

const fmtDateShort = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const today = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2
      className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground px-1"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {title}
    </h2>
    {children}
  </section>
);

// ---------- Precisa de você ----------
type PdvItem = {
  label: string;
  value: number;
  to?: string;
  tone: "red" | "orange" | "muted";
  icon: React.ReactNode;
};

const PrecisaCard = ({ item }: { item: PdvItem }) => {
  const isZero = item.value === 0;
  const bg = isZero ? "hsl(0 0% 96%)" : item.tone === "red" ? "#FEE2E2" : "#FEF3C7";
  const fg = isZero ? "#71717A" : item.tone === "red" ? "#B91C1C" : "#B45309";
  const border = isZero ? "hsl(0 0% 88%)" : item.tone === "red" ? "#FCA5A5" : "#FCD34D";

  const inner = (
    <div
      className="h-full rounded-2xl p-4 border transition-all hover:shadow-md flex items-center gap-3"
      style={{ background: bg, borderColor: border, color: fg }}
    >
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${fg}20` }}>
        {item.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {item.label}
        </div>
        <div className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Roboto Serif', serif" }}>
          {item.value}
        </div>
      </div>
    </div>
  );
  return item.to && !isZero ? <Link to={item.to}>{inner}</Link> : inner;
};

const AdminDashboard = () => {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [resumoLoading, setResumoLoading] = useState(true);
  const [resumoErr, setResumoErr] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setResumoLoading(true);
      const { data, error } = await supabase.rpc("admin_dashboard_resumo" as never);
      if (cancel) return;
      if (error) setResumoErr(error.message);
      else setResumo(data as unknown as Resumo);
      setResumoLoading(false);
    })();
    return () => {
      cancel = true;
    };
  }, []);

  const ultimaImagem = useUltimaImagem();
  const ultimoArtigo = useUltimoArtigo();
  const akasha = useAkashaHoje();
  const mensagens = useMensagensNaoLidas();
  const testes = useTestesRange();
  const vendas = useVendasRange();
  const assinaturas = useAssinaturasRange();
  const terapeuta = useUltimoTerapeuta();
  const devlog = useUltimoDevlog();
  const novosUsuarios = useNovosUsuarios();
  const auditoria = useAuditoriaRagPendente();
  const conversao = useConversaoTesteAssinatura();
  const health = useSystemHealth();

  const distTotal = DOSHA_KEYS.reduce((sum, k) => sum + (testes.data?.dist[k] ?? 0), 0);

  const pdv = resumo?.precisa_de_voce;
  const tudoEmDia =
    !!pdv &&
    pdv.pedidos_a_enviar === 0 &&
    pdv.mensagens_nao_respondidas === 0 &&
    pdv.terapeutas_pendentes === 0 &&
    pdv.erros_24h === 0;

  const pdvItens: PdvItem[] = pdv
    ? [
        { label: "Pedidos a enviar", value: pdv.pedidos_a_enviar, to: "/admin/loja/vendas", tone: "orange", icon: <PackageCheck className="w-5 h-5" /> },
        { label: "Mensagens a responder", value: pdv.mensagens_nao_respondidas, to: "/admin/mensagens", tone: "orange", icon: <Inbox className="w-5 h-5" /> },
        { label: "Terapeutas pendentes", value: pdv.terapeutas_pendentes, to: "/admin/terapeutas", tone: "orange", icon: <Users className="w-5 h-5" /> },
        { label: "Erros (24h)", value: pdv.erros_24h, tone: "red", icon: <AlertTriangle className="w-5 h-5" /> },
      ]
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Dashboard · Admin · Portal Ayurveda</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <AdminNav />

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <header className="space-y-1">
          <h1
            className="text-3xl font-bold"
            style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
          >
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            {today} · o que precisa da sua atenção agora
          </p>
        </header>

        {/* PRECISA DE VOCÊ */}
        <Section title="Precisa de você">
          {resumoLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-2xl" />
              ))}
            </div>
          ) : resumoErr ? (
            <div className="rounded-xl border border-dashed p-4 text-sm bg-muted/30 text-muted-foreground">
              Não foi possível carregar o resumo: {resumoErr}
            </div>
          ) : tudoEmDia ? (
            <div
              className="rounded-2xl p-5 border flex items-center gap-3"
              style={{ background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }}
            >
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <div className="font-semibold" style={{ fontFamily: "'Roboto Serif', serif" }}>Tudo em dia</div>
                <div className="text-xs opacity-80" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Nada pendente no momento. Bom trabalho.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {pdvItens.map((it) => (
                <PrecisaCard key={it.label} item={it} />
              ))}
            </div>
          )}
        </Section>

        {/* VENDAS DE HOJE — hero */}
        <Section title="Vendas de hoje">
          {resumoLoading || !resumo ? (
            <Skeleton className="h-56 rounded-2xl" />
          ) : (
            <div
              className="rounded-2xl border border-border bg-card p-6 md:p-8 relative overflow-hidden"
              style={{ backgroundImage: "linear-gradient(135deg, hsl(0 0% 100%) 0%, hsl(150 40% 97%) 100%)" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Loja */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Loja
                    </span>
                  </div>
                  <div
                    className="text-4xl md:text-5xl font-bold leading-none"
                    style={{ fontFamily: "'Roboto Serif', serif", color: "#059669" }}
                  >
                    {fmtBRL(resumo.vendas_hoje.loja_valor)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {resumo.vendas_hoje.loja_qtd} pedido(s) hoje
                  </div>
                  <div className="text-xs text-muted-foreground mt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    7d: <span className="font-semibold">{fmtBRL(resumo.vendas_7d.loja_valor)}</span> · {resumo.vendas_7d.loja_qtd} pedidos
                  </div>
                </div>

                {/* Rotina */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Repeat className="w-4 h-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Rotina
                    </span>
                  </div>
                  <div
                    className="text-4xl md:text-5xl font-bold leading-none"
                    style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
                  >
                    {resumo.vendas_hoje.rotina_qtd}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    assinantes novos hoje
                  </div>
                  <div className="text-xs text-muted-foreground mt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    7d: <span className="font-semibold">{resumo.vendas_7d.rotina_qtd}</span>
                  </div>
                </div>

                {/* Premium */}
                <div>
                  <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                    <Crown className="w-4 h-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Premium
                    </span>
                  </div>
                  <div
                    className="text-4xl md:text-5xl font-bold leading-none"
                    style={{ fontFamily: "'Roboto Serif', serif", color: "#D97706" }}
                  >
                    {resumo.vendas_hoje.premium_qtd}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    novos hoje
                  </div>
                  <div className="text-xs text-muted-foreground mt-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    7d: <span className="font-semibold">{resumo.vendas_7d.premium_qtd}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 space-y-1 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {resumo.ultimos.venda_loja ? (
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Última venda:</span>{" "}
                    {resumo.ultimos.venda_loja.nome} · <span className="font-semibold" style={{ color: "#059669" }}>{fmtBRL(resumo.ultimos.venda_loja.valor)}</span> · {fmtDateShort(resumo.ultimos.venda_loja.quando)}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">Sem vendas ainda.</div>
                )}
                {resumo.ultimos.assinatura ? (
                  <div className="text-muted-foreground">
                    <span className="font-semibold text-foreground">Última assinatura:</span>{" "}
                    {resumo.ultimos.assinatura.plano} · <span className="font-semibold" style={{ color: "#D97706" }}>{fmtBRL(resumo.ultimos.assinatura.valor)}</span> · {fmtDateShort(resumo.ultimos.assinatura.quando)}
                  </div>
                ) : (
                  <div className="text-muted-foreground italic">Sem assinaturas recentes.</div>
                )}
              </div>
            </div>
          )}
        </Section>

        {/* ATIVIDADE */}
        <Section title="Atividade">
          {resumoLoading || !resumo ? (
            <Skeleton className="h-16 rounded-2xl" />
          ) : (
            <div
              className="rounded-2xl border border-border bg-card p-4 flex flex-wrap gap-x-8 gap-y-3 text-sm"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Testes:</span>
                <span className="font-semibold" style={{ color: "#352F54" }}>{resumo.atividade.testes_hoje}</span>
                <span className="text-muted-foreground text-xs">hoje · {resumo.atividade.testes_7d} em 7d</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Akasha:</span>
                <span className="font-semibold" style={{ color: "#352F54" }}>{resumo.atividade.akasha_sessoes_24h}</span>
                <span className="text-muted-foreground text-xs">sessões · {resumo.atividade.akasha_msgs_24h} msgs (24h)</span>
              </div>
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Novos usuários:</span>
                <span className="font-semibold" style={{ color: "#352F54" }}>{resumo.atividade.novos_usuarios_hoje}</span>
                <span className="text-muted-foreground text-xs">hoje · {resumo.atividade.novos_usuarios_7d} em 7d</span>
              </div>
            </div>
          )}
        </Section>

        {/* ============ DETALHES (seções antigas) ============ */}
        <div className="pt-4">
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "'Roboto Serif', serif", color: "#352F54" }}
          >
            Detalhes
          </h2>

          <div className="space-y-8">
            {/* COMUNIDADE / ATIVIDADE */}
            <Section title="Atividade do dia">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Testes feitos"
                  icon={<ClipboardList className="w-4 h-4" />}
                  hoje={testes.isLoading ? "—" : testes.data?.hoje ?? 0}
                  semana={testes.isLoading ? "—" : testes.data?.semana ?? 0}
                  to="/admin/teste/registros"
                  accent="#6B7FF2"
                />
                <StatCard
                  label="Akasha · sessões"
                  icon={<MessageCircle className="w-4 h-4" />}
                  hoje={akasha.isLoading ? "—" : akasha.data?.sessoesHoje ?? 0}
                  hojeSub={akasha.data ? `${akasha.data.hoje} msgs` : undefined}
                  semana={akasha.isLoading ? "—" : akasha.data?.sessoesSemana ?? 0}
                  to="/admin/akasha"
                  accent="#9b73ad"
                />
                <StatCard
                  label="Mensagens não lidas"
                  icon={<Inbox className="w-4 h-4" />}
                  hoje={mensagens.isLoading ? "—" : mensagens.data?.total ?? 0}
                  hojeSub={mensagens.data?.ultima ? `Última: ${mensagens.data.ultima.assunto}` : "tudo limpo"}
                  to="/admin/mensagens"
                  accent="#DC2626"
                />
                <StatCard
                  label="Visitas"
                  icon={<BarChart3 className="w-4 h-4" />}
                  hoje={"GA"}
                  hojeSub="Veja em Google Analytics"
                  footer={
                    <div className="flex flex-col gap-1 text-[11px]">
                      <a
                        href="https://analytics.google.com/analytics/web/"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                        style={{ color: "#352F54" }}
                      >
                        GA4 <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href="https://clarity.microsoft.com/projects"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:underline"
                        style={{ color: "#352F54" }}
                      >
                        Clarity <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  }
                  accent="#0EA5E9"
                />
              </div>

              {testes.data && distTotal > 0 && (
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      Distribuição dosha · últimos 7 dias ({distTotal} testes)
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {DOSHA_KEYS.map((k) => {
                      const v = testes.data!.dist[k] ?? 0;
                      const pct = distTotal > 0 ? (v / distTotal) * 100 : 0;
                      return (
                        <div key={k} className="flex items-center gap-3 text-xs">
                          <span
                            className="w-3 h-3 rounded-full shrink-0 border border-border"
                            style={{ background: DOSHA_COLORS[k] }}
                          />
                          <span className="text-muted-foreground w-20 shrink-0">{DOSHA_LABELS[k]}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct}%`, background: DOSHA_COLORS[k] }}
                            />
                          </div>
                          <span className="font-semibold tabular-nums w-10 text-right" style={{ color: "#352F54" }}>
                            {pct.toFixed(0)}%
                          </span>
                          <span className="text-muted-foreground tabular-nums w-8 text-right">{v}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Section>

            {/* VENDAS */}
            <Section title="Vendas & assinaturas">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard
                  label="Loja · hoje"
                  icon={<ShoppingCart className="w-4 h-4" />}
                  hoje={vendas.isLoading ? "—" : fmtBRL(vendas.data?.valorHoje ?? 0)}
                  hojeSub={vendas.data ? `${vendas.data.countHoje} pedido(s)` : undefined}
                  semana={vendas.isLoading ? "—" : fmtBRL(vendas.data?.valorSemana ?? 0)}
                  to="/admin/loja/vendas"
                  accent="#059669"
                />
                <StatCard
                  label="Assinaturas Akasha"
                  icon={<Crown className="w-4 h-4" />}
                  hoje={assinaturas.isLoading ? "—" : assinaturas.data?.hoje ?? 0}
                  hojeSub={assinaturas.data ? `${assinaturas.data.ativas} ativas no total` : undefined}
                  semana={assinaturas.isLoading ? "—" : assinaturas.data?.semana ?? 0}
                  to="/admin/vendas/akasha"
                  accent="#D97706"
                />
                {terapeuta.data ? (
                  <LastItemCard
                    label="Último terapeuta"
                    icon={<Users className="w-4 h-4" />}
                    thumb={(terapeuta.data as { imagem?: string }).imagem}
                    title={(terapeuta.data as { nome?: string }).nome || "Sem nome"}
                    subtitle={
                      [
                        (terapeuta.data as { cidade?: string }).cidade,
                        (terapeuta.data as { estado?: string }).estado,
                      ]
                        .filter(Boolean)
                        .join(" · ") || (terapeuta.data as { especialidade?: string }).especialidade
                    }
                    to="/admin/terapeutas"
                    accent="#6B7FF2"
                  />
                ) : (
                  <StatCard
                    label="Último terapeuta"
                    icon={<Users className="w-4 h-4" />}
                    hoje={terapeuta.isLoading ? "—" : "—"}
                    to="/admin/terapeutas"
                    accent="#6B7FF2"
                  />
                )}
              </div>
            </Section>

            {/* CONTEÚDO */}
            <Section title="Conteúdo recente">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {ultimaImagem.isLoading ? (
                  <Skeleton className="h-28 rounded-2xl" />
                ) : ultimaImagem.data ? (
                  <LastItemCard
                    label="Última imagem"
                    icon={<ImageIcon className="w-4 h-4" />}
                    thumb={ultimaImagem.data.image_url}
                    title={ultimaImagem.data.title || "(sem título)"}
                    when={ultimaImagem.data.created_at}
                    to="/admin/imagens"
                    accent="#0EA5E9"
                  />
                ) : (
                  <StatCard label="Última imagem" icon={<ImageIcon className="w-4 h-4" />} hoje="—" to="/admin/imagens" />
                )}

                {ultimoArtigo.isLoading ? (
                  <Skeleton className="h-28 rounded-2xl" />
                ) : ultimoArtigo.data ? (
                  <LastItemCard
                    label="Último artigo"
                    icon={<FileText className="w-4 h-4" />}
                    title={ultimoArtigo.data.title || "(sem título)"}
                    subtitle={ultimoArtigo.data.summary || undefined}
                    when={ultimoArtigo.data.created_at}
                    to="/admin/blog"
                    accent="#352F54"
                  />
                ) : (
                  <StatCard label="Último artigo" icon={<FileText className="w-4 h-4" />} hoje="—" to="/admin/blog" />
                )}

                {devlog.data ? (
                  <LastItemCard
                    label="Última versão (devlog)"
                    icon={<History className="w-4 h-4" />}
                    title={`${devlog.data.versao} · ${devlog.data.titulo}`}
                    subtitle={devlog.data.descricao || undefined}
                    when={devlog.data.criado_em}
                    to="/admin/devlog"
                    accent="#7c3aed"
                  />
                ) : (
                  <StatCard
                    label="Última versão"
                    icon={<History className="w-4 h-4" />}
                    hoje={devlog.isLoading ? "—" : "—"}
                    to="/admin/devlog"
                  />
                )}
              </div>
            </Section>

            {/* SAÚDE DO SISTEMA */}
            <Section title="Saúde do sistema">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard
                  label="Novos usuários"
                  icon={<UserPlus className="w-4 h-4" />}
                  hoje={novosUsuarios.isLoading ? "—" : novosUsuarios.data?.hoje ?? 0}
                  semana={novosUsuarios.isLoading ? "—" : novosUsuarios.data?.semana ?? 0}
                  accent="#0EA5E9"
                />
                <StatCard
                  label="Auditoria RAG"
                  icon={<ShieldAlert className="w-4 h-4" />}
                  hoje={auditoria.isLoading ? "—" : auditoria.data?.pendente ?? 0}
                  hojeSub={
                    (auditoria.data?.pendente ?? 0) > 0
                      ? "pendente(s) de revisão"
                      : "tudo revisado"
                  }
                  accent={(auditoria.data?.pendente ?? 0) > 0 ? "#DC2626" : "#059669"}
                />
                <StatCard
                  label="Conversão teste→assinante"
                  icon={<TrendingUp className="w-4 h-4" />}
                  hoje={conversao.isLoading ? "—" : `${conversao.data?.pct ?? 0}%`}
                  hojeSub={
                    conversao.data
                      ? `${conversao.data.cruzamento}/${conversao.data.totalTestes} testes (7d)`
                      : undefined
                  }
                  accent="#7c3aed"
                />
                <StatCard
                  label="Mensagens não lidas"
                  icon={<Inbox className="w-4 h-4" />}
                  hoje={mensagens.isLoading ? "—" : mensagens.data?.total ?? 0}
                  hojeSub={
                    (mensagens.data?.total ?? 0) > 0 ? "responder na inbox" : "inbox limpa"
                  }
                  to="/admin/mensagens"
                  accent={(mensagens.data?.total ?? 0) > 0 ? "#D97706" : "#059669"}
                />
              </div>

              {health.data && health.data.disponivel === false ? (
                <div className="mt-3 rounded-xl border border-dashed p-4 text-sm bg-muted/30">
                  <div className="flex items-center gap-2 font-medium" style={{ fontFamily: "'Roboto Serif', serif" }}>
                    <KeyRound className="w-4 h-4" /> Métricas de erro indisponíveis
                  </div>
                  <p className="text-muted-foreground mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Configure um <code>SB_MGMT_ACCESS_TOKEN</code> (Personal Access Token do Supabase) para ver erros de edge functions, banco e auth aqui.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                  <StatCard
                    label="Erros edge (24h)"
                    icon={<AlertTriangle className="w-4 h-4" />}
                    hoje={health.isLoading ? "—" : health.data && health.data.disponivel ? health.data.edge.erros5xx : "—"}
                    hojeSub={
                      health.data && health.data.disponivel && health.data.edge.topFunction
                        ? `Top: ${health.data.edge.topFunction}`
                        : health.data && health.data.disponivel
                        ? "nenhum 5xx"
                        : undefined
                    }
                    accent={
                      health.data && health.data.disponivel
                        ? health.data.edge.erros5xx > 5
                          ? "#DC2626"
                          : health.data.edge.erros5xx > 0
                          ? "#D97706"
                          : "#059669"
                        : "#71717A"
                    }
                  />
                  <StatCard
                    label="Erros banco (24h)"
                    icon={<Database className="w-4 h-4" />}
                    hoje={health.isLoading ? "—" : health.data && health.data.disponivel ? health.data.db.erros : "—"}
                    hojeSub={
                      health.data && health.data.disponivel
                        ? health.data.db.ultimaMensagem
                          ? health.data.db.ultimaMensagem.slice(0, 60)
                          : "sem erros"
                        : undefined
                    }
                    accent={
                      health.data && health.data.disponivel
                        ? health.data.db.erros > 10
                          ? "#DC2626"
                          : health.data.db.erros > 0
                          ? "#D97706"
                          : "#059669"
                        : "#71717A"
                    }
                  />
                  <StatCard
                    label="Falhas auth (24h)"
                    icon={<ShieldAlert className="w-4 h-4" />}
                    hoje={health.isLoading ? "—" : health.data && health.data.disponivel ? health.data.auth.falhas : "—"}
                    hojeSub={
                      health.data && health.data.disponivel
                        ? health.data.auth.falhas > 50
                          ? "alto — investigar"
                          : "dentro do normal"
                        : undefined
                    }
                    accent={
                      health.data && health.data.disponivel && health.data.auth.falhas > 50 ? "#D97706" : "#059669"
                    }
                  />
                </div>
              )}
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
