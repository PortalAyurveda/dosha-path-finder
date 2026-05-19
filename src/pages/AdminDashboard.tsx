import { Helmet } from "react-helmet-async";
import AdminNav from "@/components/admin/AdminNav";
import StatCard from "@/components/admin/dashboard/StatCard";
import LastItemCard from "@/components/admin/dashboard/LastItemCard";
import { Skeleton } from "@/components/ui/skeleton";
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
} from "@/hooks/useAdminDashboard";

const DOSHA_COLORS = { vata: "#93C5FD", pitta: "#FCA5A5", kapha: "#86EFAC", outro: "#D4D4D8" };

const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

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

const AdminDashboard = () => {
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

  const distTotal =
    (testes.data?.dist.vata ?? 0) +
    (testes.data?.dist.pitta ?? 0) +
    (testes.data?.dist.kapha ?? 0) +
    (testes.data?.dist.outro ?? 0);

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
            {today} · visão geral de hoje e últimos 7 dias
          </p>
        </header>

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

          {/* Dosha do dia */}
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
              <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                {(["vata", "pitta", "kapha", "outro"] as const).map((k) => {
                  const v = testes.data!.dist[k];
                  if (!v) return null;
                  return (
                    <div
                      key={k}
                      style={{ width: `${(v / distTotal) * 100}%`, background: DOSHA_COLORS[k] }}
                      title={`${k}: ${v}`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {(["vata", "pitta", "kapha", "outro"] as const).map((k) => {
                  const v = testes.data!.dist[k];
                  if (!v) return null;
                  const pct = ((v / distTotal) * 100).toFixed(0);
                  return (
                    <div key={k} className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ background: DOSHA_COLORS[k] }}
                      />
                      <span className="capitalize text-muted-foreground">{k}</span>
                      <span className="font-semibold" style={{ color: "#352F54" }}>
                        {pct}%
                      </span>
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
          <p
            className="text-[11px] text-muted-foreground mt-2 px-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Erros de edge functions, banco e auth ficam no painel do Supabase (precisam de acesso de logs).
          </p>
        </Section>
      </div>
    </div>
  );
};

export default AdminDashboard;
