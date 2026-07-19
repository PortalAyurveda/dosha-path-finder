import { useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Camera,
  Loader2,
  Pencil,
  Save,
  X,
  ExternalLink,
  ShoppingBag,
  BookOpen,
  GraduationCap,
  ChevronRight,
  ChevronDown,
  User as UserIcon,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { optimizeImageToWebP } from "@/lib/imageOptimize";
import PageContainer from "@/components/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// ---------- helpers ----------
const DOSHA_BG: Record<string, string> = {
  Vata: "#93C5FD",
  Pitta: "#FCA5A5",
  Kapha: "#86EFAC",
};

const MESES = [
  "janeiro","fevereiro","março","abril","maio","junho",
  "julho","agosto","setembro","outubro","novembro","dezembro",
];

const formatMesAno = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

const formatDataExtenso = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`;
};

const formatDataCurta = (iso: string | null | undefined) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
};

const formatMoeda = (v: number | string | null | undefined) => {
  const n = typeof v === "string" ? Number(v) : v;
  if (n == null || isNaN(Number(n))) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(n));
};

const iniciais = (nome?: string | null, email?: string | null) => {
  const base = (nome || email?.split("@")[0] || "").trim();
  if (!base) return "?";
  const parts = base.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || base[0].toUpperCase();
};

const primeiroNome = (nome?: string | null) => {
  if (!nome) return "";
  return nome.trim().split(/\s+/)[0] || "";
};

// ---------- types ----------
type Endereco = {
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

type PerfilRow = {
  id: string;
  nome_completo: string | null;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  endereco: Endereco | null;
  avatar_url: string | null;
  created_at: string | null;
};

type Stats = {
  cadastro_em: string | null;
  testes: { id_publico: string; dosha: string | null; quando: string }[];
  msgs_akasha: number;
  artigos_curtidos: number;
  receitas_feitas: number;
};

type Assinatura = {
  plano: string | null;
  status: string | null;
  proxima_cobranca: string | null;
  cancela_no_fim: boolean | null;
  valor: number | null;
  cortesia?: boolean | null;
} | null;

type Matricula = {
  id: string;
  curso_id: string;
  titulo: string | null;
  slug: string | null;
};

type PedidoLoja = {
  id: string;
  numero?: string | null;
  data?: string | null;
  total?: number | null;
  status?: string | null;
  rastreio?: string | null;
};

type HomePayload = {
  ok?: boolean;
  perfil: PerfilRow;
  stats: Stats;
  assinatura: Assinatura;
  matriculas: Matricula[];
  pedidos: PedidoLoja[];
  escola: boolean;
};

// ---------- page ----------
const MeuPerfil = () => {
  const { user, loading: authLoading, doshaResult, refreshProfile } = useUser();

  if (!authLoading && !user) {
    return <Navigate to="/entrar?redirect=/meu-perfil" replace />;
  }

  return (
    <PageContainer
      title="Minha conta"
      description="Sua identidade, dados, assinatura e história no Portal Ayurveda."
      noindex
    >
      {authLoading || !user ? (
        <div className="space-y-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : (
        <Conteudo
          userId={user.id}
          email={user.email ?? ""}
          doshaNome={doshaResult?.doshaprincipal ?? null}
          refreshProfile={refreshProfile}
        />
      )}
    </PageContainer>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <section
    className={`bg-white border border-border/60 rounded-[28px] shadow-sm p-6 md:p-8 ${className}`}
    style={{ borderRadius: "28px 28px 22px 22px" }}
  >
    {children}
  </section>
);

// ---------- Accordion ----------
type AccordionKey = "dados" | "assinatura" | "cursos" | "pedidos" | "escola";

const AccordionCard = ({
  id,
  icon,
  title,
  resumo,
  open,
  onToggle,
  children,
  className = "",
}: {
  id: AccordionKey;
  icon: React.ReactNode;
  title: string;
  resumo: string;
  open: boolean;
  onToggle: (id: AccordionKey) => void;
  children: React.ReactNode;
  className?: string;
}) => (
  <section
    className={`bg-white border border-border/60 rounded-[28px] shadow-sm overflow-hidden ${className}`}
    style={{ borderRadius: "28px 28px 22px 22px" }}
  >
    <button
      type="button"
      onClick={() => onToggle(id)}
      className="w-full flex items-center gap-3 px-6 md:px-8 py-4 md:py-5 text-left hover:bg-muted/30 transition-colors"
      aria-expanded={open}
    >
      <span className="text-primary shrink-0">{icon}</span>
      <span className="font-serif font-semibold text-foreground shrink-0">{title}</span>
      <span className="hidden md:block text-sm text-muted-foreground truncate flex-1 text-right pr-2">
        {resumo}
      </span>
      <ChevronDown
        className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      />
    </button>
    {!open && (
      <div className="md:hidden px-6 pb-3 -mt-2 text-xs text-muted-foreground truncate">
        {resumo}
      </div>
    )}
    {open && <div className="px-6 md:px-8 pb-6 md:pb-8 pt-1">{children}</div>}
  </section>
);

const Conteudo = ({
  userId,
  doshaNome,
  refreshProfile,
}: {
  userId: string;
  email: string;
  doshaNome: string | null;
  refreshProfile: () => Promise<void>;
}) => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [assinatura, setAssinatura] = useState<Assinatura>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [pedidos, setPedidos] = useState<PedidoLoja[]>([]);
  const [escola, setEscola] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState<AccordionKey | null>(null);

  const toggle = (k: AccordionKey) =>
    setOpenKey((prev) => (prev === k ? null : k));

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.rpc("get_meu_perfil_home");
    if (!error && data) {
      const d = data as unknown as HomePayload;
      setPerfil(d.perfil ?? null);
      setStats(d.stats ?? null);
      setAssinatura(d.assinatura ?? null);
      setMatriculas(Array.isArray(d.matriculas) ? d.matriculas : []);
      setPedidos(Array.isArray(d.pedidos) ? d.pedidos : []);
      setEscola(!!d.escola);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Refina o card de assinatura DEPOIS da pintura, apenas para assinaturas com cobrança.
  useEffect(() => {
    if (loading) return;
    if (!assinatura || assinatura.cortesia) return;
    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("gerenciar-assinatura", {
          body: { action: "listar" },
        });
        if (cancelled) return;
        if (data && typeof data === "object" && "assinatura" in (data as any)) {
          const viva = (data as any).assinatura;
          if (viva) setAssinatura(viva);
        }
      } catch {
        /* silencioso */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const refinarAssinatura = async () => {
    try {
      const { data } = await supabase.functions.invoke("gerenciar-assinatura", {
        body: { action: "listar" },
      });
      if (data && typeof data === "object" && "assinatura" in (data as any)) {
        setAssinatura((data as any).assinatura ?? null);
      }
    } catch {
      /* silencioso */
    }
  };

  // Resumos vivos
  const dadosResumo = useMemo(() => {
    if (!perfil) return "";
    const nome = primeiroNome(perfil.nome_completo);
    const cidade = perfil.endereco?.cidade;
    const uf = perfil.endereco?.uf;
    const local = cidade ? `${cidade}${uf ? "/" + uf : ""}` : null;
    return [nome || "seu nome", local].filter(Boolean).join(" · ");
  }, [perfil]);

  const assinaturaResumo = useMemo(() => {
    if (!assinatura) return "sem assinatura ativa";
    if (assinatura.cortesia) return "cortesia da casa 🌿";
    const p = assinatura.plano?.toLowerCase() ?? "";
    if (p === "rotina") return "Rotina Personalizada";
    if (p === "mensal" || p === "anual" || p === "premium") return "Premium";
    return assinatura.plano || "ativa";
  }, [assinatura]);

  const cursosResumo = useMemo(() => {
    if (!matriculas.length) return "nenhum curso ainda";
    if (matriculas.length === 1) return matriculas[0].titulo || "1 curso";
    return `${matriculas.length} cursos`;
  }, [matriculas]);

  const pedidosResumo = useMemo(() => {
    if (!pedidos.length) return "nenhuma compra ainda";
    const ultimo = formatDataCurta(pedidos[0].data);
    return ultimo ? `último em ${ultimo}` : `${pedidos.length} pedidos`;
  }, [pedidos]);

  if (loading || !perfil) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Cabecalho
        perfil={perfil}
        doshaNome={doshaNome}
        onAvatarUpdated={async (url) => {
          setPerfil((p) => (p ? { ...p, avatar_url: url } : p));
          await refreshProfile();
        }}
      />

      <HistoriaCard stats={stats} />

      

      <div className="space-y-3 md:space-y-4">
        <AccordionCard
          id="dados"
          icon={<UserIcon className="h-5 w-5" />}
          title="Meus dados"
          resumo={dadosResumo}
          open={openKey === "dados"}
          onToggle={toggle}
        >
          <DadosCard
            perfil={perfil}
            onSaved={(patch) => setPerfil((p) => (p ? { ...p, ...patch } : p))}
          />
        </AccordionCard>

        <AccordionCard
          id="assinatura"
          icon={<CreditCard className="h-5 w-5" />}
          title="Minha assinatura"
          resumo={assinaturaResumo}
          open={openKey === "assinatura"}
          onToggle={toggle}
        >
          <AssinaturaCard assinatura={assinatura} onChanged={refinarAssinatura} />
        </AccordionCard>

        <AccordionCard
          id="cursos"
          icon={<BookOpen className="h-5 w-5" />}
          title="Meus cursos"
          resumo={cursosResumo}
          open={openKey === "cursos"}
          onToggle={toggle}
        >
          <CursosCard matriculas={matriculas} />
        </AccordionCard>

        <AccordionCard
          id="pedidos"
          icon={<ShoppingBag className="h-5 w-5" />}
          title="Meus pedidos"
          resumo={pedidosResumo}
          open={openKey === "pedidos"}
          onToggle={toggle}
        >
          <PedidosCard pedidos={pedidos} />
        </AccordionCard>

        {escola && (
          <AccordionCard
            id="escola"
            icon={<GraduationCap className="h-5 w-5" />}
            title="Escola"
            resumo="Formação Ayurveda Profissionalizante"
            open={openKey === "escola"}
            onToggle={toggle}
            className="border-[#FACC15]/60"
          >
            <EscolaCard />
          </AccordionCard>
        )}
      </div>

    </div>
  );
};

// ---------- 1. Cabeçalho ----------
const Cabecalho = ({
  perfil,
  doshaNome,
  onAvatarUpdated,
}: {
  perfil: PerfilRow;
  doshaNome: string | null;
  onAvatarUpdated: (url: string) => void | Promise<void>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    const okType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!okType) {
      toast.error("Use uma imagem JPG, PNG ou WebP.");
      return;
    }
    setUploading(true);
    try {
      const otim = await optimizeImageToWebP(file, { maxWidth: 512, quality: 0.9 });
      const ext = otim.optimized ? "webp" : (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${perfil.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, otim.file, { upsert: true, contentType: otim.file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const publicUrl = `${data.publicUrl}?v=${Date.now()}`;
      const { error: updErr } = await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl } as any)
        .eq("id", perfil.id);
      if (updErr) throw updErr;
      await onAvatarUpdated(publicUrl);
      toast.success("Foto atualizada.");
    } catch (e: any) {
      console.error(e);
      toast.error("Não conseguimos atualizar sua foto agora.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const bg = doshaNome && DOSHA_BG[doshaNome] ? DOSHA_BG[doshaNome] : "#E5E7EB";

  return (
    <Card>
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="relative group shrink-0"
          aria-label="Trocar foto de perfil"
        >
          {perfil.avatar_url ? (
            <img
              src={perfil.avatar_url}
              alt={perfil.nome_completo || "Foto de perfil"}
              width={128}
              height={128}
              className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md"
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full flex items-center justify-center text-4xl font-bold text-white shadow-md border-4 border-white"
              style={{ background: bg }}
            >
              {iniciais(perfil.nome_completo, perfil.email)}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
            {uploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </button>

        <div className="flex-1 text-center md:text-left min-w-0">
          <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground truncate">
            {perfil.nome_completo || "Sua conta"}
          </h1>
          <div className="mt-2">
            <div className="text-sm text-foreground/80 break-all">{perfil.email}</div>
            <div className="text-xs text-muted-foreground mt-0.5">seu e-mail de acesso</div>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            No portal desde {formatMesAno(perfil.created_at)}.
          </div>
        </div>
      </div>
    </Card>
  );
};

// ---------- Sua Caminhada (evolução completa) ----------
type Evolucao = {
  pontos?: number;
  classe?: string | null;
  streak?: number;
  streak_recorde?: number;
  proxima_classe?: string | null;
  pontos_para_proxima?: number | null;
  selo_terapeuta?: boolean;
};

const CLASSES_CAMINHADA = [
  "Curioso",
  "Entusiasta",
  "Engajado",
  "Estudante",
  "Praticante",
  "Expert",
  "Terapeuta",
];

const CaminhadaCard = () => {
  const [data, setData] = useState<Evolucao | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: resp } = await (supabase.rpc as any)("get_minha_evolucao");
      if (cancelled) return;
      setData((resp as Evolucao) ?? {});
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <Card>
        <Skeleton className="h-40 w-full" />
      </Card>
    );
  }

  const classe = data?.classe ?? "Curioso";
  const pontos = data?.pontos ?? 0;
  const streak = data?.streak ?? 0;
  const streakRecorde = data?.streak_recorde ?? 0;
  const proxima = data?.proxima_classe;
  const faltam = data?.pontos_para_proxima;
  const idxAtual = Math.max(0, CLASSES_CAMINHADA.indexOf(classe));
  const progressoPct =
    faltam != null && faltam > 0
      ? Math.max(0, Math.min(100, (pontos / (pontos + faltam)) * 100))
      : 100;

  return (
    <Card>
      <h2 className="text-xl font-serif font-semibold mb-1">Sua caminhada</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Seu crescimento no Portal Ayurveda.
      </p>

      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
            Você está em
          </p>
          <p className="font-serif text-2xl md:text-3xl text-primary font-semibold mt-0.5">
            {classe}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl md:text-3xl font-serif font-semibold text-primary">
            {pontos}
          </p>
          <p className="text-xs text-muted-foreground">pontos</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 rounded-full overflow-hidden bg-muted">
          <div
            className="h-full transition-all bg-primary"
            style={{ width: `${progressoPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          {proxima && faltam != null && faltam > 0
            ? <>Faltam <span className="font-semibold text-foreground">{faltam} pts</span> para <span className="font-semibold text-foreground">{proxima}</span>.</>
            : "Você chegou à classe máxima. 🌿"}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Constância</p>
          <p className="text-lg font-serif font-semibold text-foreground mt-0.5">
            {streak > 0 ? `${streak} ${streak === 1 ? "dia" : "dias"}` : "começa hoje"}
          </p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-3">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Recorde</p>
          <p className="text-lg font-serif font-semibold text-foreground mt-0.5">
            {streakRecorde > 0 ? `${streakRecorde} dias` : "—"}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">
          Próximos degraus
        </p>
        <ol className="space-y-1.5">
          {CLASSES_CAMINHADA.map((c, i) => {
            const passou = i < idxAtual;
            const atual = i === idxAtual;
            return (
              <li
                key={c}
                className={`flex items-center gap-3 text-sm ${
                  atual
                    ? "text-foreground font-semibold"
                    : passou
                    ? "text-muted-foreground line-through"
                    : "text-muted-foreground"
                }`}
              >
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    atual
                      ? "bg-primary text-primary-foreground"
                      : passou
                      ? "bg-muted text-muted-foreground"
                      : "border border-border bg-white text-muted-foreground"
                  }`}
                >
                  {i + 1}
                </span>
                <span>{c}</span>
                {atual && (
                  <span className="ml-auto text-[10px] uppercase tracking-wider text-primary">
                    você
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </Card>
  );
};

// ---------- 2. História ----------
const HistoriaCard = ({ stats }: { stats: Stats | null }) => {
  const testes = stats?.testes ?? [];
  const numeros = [
    { valor: testes.length, label: "testes de dosha" },
    { valor: stats?.msgs_akasha ?? 0, label: "conversas com a Akasha" },
    { valor: stats?.artigos_curtidos ?? 0, label: "artigos que te fizeram bem" },
    { valor: stats?.receitas_feitas ?? 0, label: "receitas feitas" },
  ];

  return (
    <Card>
      <h2 className="text-xl font-serif font-semibold mb-6">Sua história no portal</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {numeros.map((n, i) => (
          <div key={i} className="text-center">
            <div className="text-3xl md:text-4xl font-serif font-semibold text-primary">
              {n.valor}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground mt-1">{n.label}</div>
          </div>
        ))}
      </div>

      {testes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Seus testes ao longo do tempo
          </h3>
          <ul className="divide-y divide-border/60">
            {testes.map((t) => (
              <li key={t.id_publico} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-foreground">{formatDataExtenso(t.quando)}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Dosha: {t.dosha || "—"}
                  </div>
                </div>
                <Link
                  to={`/meu-dosha?id=${t.id_publico}`}
                  className="text-sm text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
                >
                  rever <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

// ---------- 3. Meus Dados ----------
const DadosCard = ({
  perfil,
  onSaved,
}: {
  perfil: PerfilRow;
  onSaved: (patch: Partial<PerfilRow>) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nome_completo: perfil.nome_completo || "",
    telefone: perfil.telefone || "",
    cpf: perfil.cpf || "",
    endereco: {
      cep: perfil.endereco?.cep || "",
      rua: perfil.endereco?.rua || "",
      numero: perfil.endereco?.numero || "",
      complemento: perfil.endereco?.complemento || "",
      bairro: perfil.endereco?.bairro || "",
      cidade: perfil.endereco?.cidade || "",
      uf: perfil.endereco?.uf || "",
    },
  });

  const cancel = () => {
    setForm({
      nome_completo: perfil.nome_completo || "",
      telefone: perfil.telefone || "",
      cpf: perfil.cpf || "",
      endereco: {
        cep: perfil.endereco?.cep || "",
        rua: perfil.endereco?.rua || "",
        numero: perfil.endereco?.numero || "",
        complemento: perfil.endereco?.complemento || "",
        bairro: perfil.endereco?.bairro || "",
        cidade: perfil.endereco?.cidade || "",
        uf: perfil.endereco?.uf || "",
      },
    });
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data, error } = await supabase.rpc("atualizar_meus_dados", {
        p_nome_completo: form.nome_completo,
        p_telefone: form.telefone,
        p_cpf: form.cpf,
        p_endereco: form.endereco,
      });
      if (error) throw error;
      if ((data as any)?.ok === false) throw new Error("Falha ao salvar.");
      onSaved({
        nome_completo: form.nome_completo,
        telefone: form.telefone,
        cpf: form.cpf,
        endereco: form.endereco,
      });
      toast.success("Dados atualizados.");
      setEditing(false);
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível salvar seus dados.");
    } finally {
      setSaving(false);
    }
  };

  const linhaEndereco = () => {
    const e = perfil.endereco || {};
    const l1 = [e.rua, e.numero].filter(Boolean).join(", ");
    const l2 = [e.complemento].filter(Boolean).join(", ");
    const l3 = [e.bairro, e.cidade && `${e.cidade}${e.uf ? "/" + e.uf : ""}`].filter(Boolean).join(" — ");
    const l4 = e.cep ? `CEP ${e.cep}` : "";
    return [l1, l2, l3, l4].filter(Boolean).join(" · ") || "—";
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-4">
        <p className="text-xs text-muted-foreground">
          Este endereço é o padrão de entrega da loja.
        </p>
        {!editing && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="rounded-full">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Editar
          </Button>
        )}
      </div>

      {!editing ? (
        <dl className="space-y-3 text-sm">
          <Linha label="Nome completo" valor={perfil.nome_completo || "—"} />
          <Linha label="WhatsApp" valor={perfil.telefone || "—"} />
          <Linha label="CPF" valor={perfil.cpf || "—"} />
          <Linha label="Endereço" valor={linhaEndereco()} />
        </dl>
      ) : (
        <div className="space-y-4">
          <Field label="Nome completo" value={form.nome_completo} onChange={(v) => setForm({ ...form, nome_completo: v })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="WhatsApp" value={form.telefone} onChange={(v) => setForm({ ...form, telefone: v })} placeholder="(11) 90000-0000" />
            <Field label="CPF" value={form.cpf} onChange={(v) => setForm({ ...form, cpf: v })} placeholder="000.000.000-00" />
          </div>
          <div className="pt-2 border-t border-border/60">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Endereço</div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <div className="col-span-2 md:col-span-2">
                <Field label="CEP" value={form.endereco.cep} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, cep: v } })} />
              </div>
              <div className="col-span-2 md:col-span-3">
                <Field label="Rua" value={form.endereco.rua} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, rua: v } })} />
              </div>
              <div className="col-span-2 md:col-span-1">
                <Field label="Nº" value={form.endereco.numero} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, numero: v } })} />
              </div>
              <div className="col-span-2 md:col-span-3">
                <Field label="Complemento" value={form.endereco.complemento} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, complemento: v } })} />
              </div>
              <div className="col-span-2 md:col-span-3">
                <Field label="Bairro" value={form.endereco.bairro} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, bairro: v } })} />
              </div>
              <div className="col-span-2 md:col-span-4">
                <Field label="Cidade" value={form.endereco.cidade} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, cidade: v } })} />
              </div>
              <div className="col-span-2 md:col-span-2">
                <Field label="UF" value={form.endereco.uf} onChange={(v) => setForm({ ...form, endereco: { ...form.endereco, uf: v.toUpperCase().slice(0, 2) } })} />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={cancel} disabled={saving}>
              <X className="h-4 w-4 mr-1" /> Cancelar
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const Linha = ({ label, valor }: { label: string; valor: string }) => (
  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-1 md:gap-4 py-1">
    <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
    <dd className="text-foreground">{valor}</dd>
  </div>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div>
    <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
    <Input
      className="mt-1"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

// ---------- 4. Assinatura ----------
const AssinaturaCard = ({
  assinatura,
  onChanged,
}: {
  assinatura: Assinatura;
  onChanged: () => void | Promise<void>;
}) => {
  const [working, setWorking] = useState(false);

  const planoLabel = useMemo(() => {
    const p = assinatura?.plano?.toLowerCase() ?? "";
    if (p === "rotina") return "Rotina Personalizada";
    if (p === "mensal" || p === "anual" || p === "premium") return "Premium — o portal completo";
    return assinatura?.plano || "—";
  }, [assinatura]);

  const cancelar = async () => {
    setWorking(true);
    try {
      const { data, error } = await supabase.functions.invoke("gerenciar-assinatura", {
        body: { action: "cancelar" },
      });
      if (error) throw error;
      const acesso = (data as any)?.acesso_ate;
      toast.success(
        acesso
          ? `Assinatura cancelada. Você tem acesso até ${formatDataExtenso(acesso)}.`
          : "Assinatura cancelada."
      );
      await onChanged();
    } catch (e) {
      console.error(e);
      toast.error("Não conseguimos cancelar sua assinatura agora.");
    } finally {
      setWorking(false);
    }
  };

  const reativar = async () => {
    setWorking(true);
    try {
      const { error } = await supabase.functions.invoke("gerenciar-assinatura", {
        body: { action: "reativar" },
      });
      if (error) throw error;
      toast.success("Assinatura reativada.");
      await onChanged();
    } catch (e) {
      console.error(e);
      toast.error("Não conseguimos reativar sua assinatura agora.");
    } finally {
      setWorking(false);
    }
  };

  if (!assinatura) {
    return (
      <div className="text-sm text-muted-foreground">
        Você não tem assinatura ativa.{" "}
        <Link to="/assinar" className="text-primary hover:underline font-medium">
          conhecer os planos
        </Link>
      </div>
    );
  }

  if (assinatura.cortesia) {
    return (
      <div className="space-y-3">
        <div className="text-lg font-semibold text-foreground">
          Acesso cortesia — um presente da casa 🌿
        </div>
        <div className="text-sm text-muted-foreground">{planoLabel}</div>
        <div className="text-sm">
          <Link to="/assinar" className="text-primary hover:underline font-medium">
            conhecer os planos
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <div className="text-lg font-semibold text-foreground">{planoLabel}</div>
        {assinatura.valor != null && (
          <div className="text-sm text-muted-foreground">{formatMoeda(assinatura.valor)}</div>
        )}
      </div>

      {assinatura.cancela_no_fim ? (
        <>
          <p className="text-sm text-foreground">
            Sua assinatura encerra em{" "}
            <span className="font-medium">{formatDataExtenso(assinatura.proxima_cobranca)}</span>{" "}
            — você tem acesso até lá.
          </p>
          <Button onClick={reativar} disabled={working}>
            {working && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Continuar assinando
          </Button>
        </>
      ) : (
        <>
          {assinatura.proxima_cobranca && (
            <p className="text-sm text-muted-foreground">
              Próxima cobrança em{" "}
              <span className="font-medium text-foreground">
                {formatDataExtenso(assinatura.proxima_cobranca)}
              </span>
              .
            </p>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4">
                Cancelar assinatura
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                <AlertDialogDescription>
                  Você mantém o acesso até{" "}
                  {formatDataExtenso(assinatura.proxima_cobranca)}. Nada é cobrado depois disso.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={working}>Voltar</AlertDialogCancel>
                <AlertDialogAction onClick={cancelar} disabled={working}>
                  {working && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Confirmar cancelamento
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
};

// ---------- 5. Cursos ----------
type CursoDetalhe = {
  matriculaId: string;
  slug: string;
  titulo: string;
  capa_url: string | null;
  total: number;
  concluidas: number;
};

const CursosCard = ({ matriculas }: { matriculas: Matricula[] }) => {
  const { user } = useUser();
  const [detalhes, setDetalhes] = useState<CursoDetalhe[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!user || matriculas.length === 0) {
      setDetalhes([]);
      setCarregando(false);
      return;
    }
    (async () => {
      setCarregando(true);
      const cursoIds = matriculas.map((m) => m.curso_id);
      const [{ data: cursos }, { data: mods }, { data: prog }] = await Promise.all([
        supabase.from("cursos").select("id,slug,titulo,capa_url").in("id", cursoIds),
        supabase.from("curso_modulos").select("id,curso_id").in("curso_id", cursoIds),
        supabase.from("curso_aula_progresso").select("aula_id").eq("user_id", user.id),
      ]);
      const modIds = (mods ?? []).map((m: any) => m.id);
      const { data: aulas } = modIds.length
        ? await supabase
            .from("curso_aulas_indice" as any)
            .select("id,modulo_id")
            .in("modulo_id", modIds)
        : { data: [] as any[] };
      const concluidasSet = new Set((prog ?? []).map((p: any) => p.aula_id));
      const modToCurso = new Map<string, string>((mods ?? []).map((m: any) => [m.id, m.curso_id]));
      const totalPorCurso = new Map<string, number>();
      const feitasPorCurso = new Map<string, number>();
      for (const a of (aulas ?? []) as any[]) {
        const cid = modToCurso.get(a.modulo_id);
        if (!cid) continue;
        totalPorCurso.set(cid, (totalPorCurso.get(cid) ?? 0) + 1);
        if (concluidasSet.has(a.id))
          feitasPorCurso.set(cid, (feitasPorCurso.get(cid) ?? 0) + 1);
      }
      const cursosMap = new Map((cursos ?? []).map((c: any) => [c.id, c]));
      setDetalhes(
        matriculas.map((m) => {
          const c: any = cursosMap.get(m.curso_id) ?? {};
          return {
            matriculaId: m.id,
            slug: c.slug ?? m.slug ?? "",
            titulo: c.titulo ?? m.titulo ?? "Curso",
            capa_url: c.capa_url ?? null,
            total: totalPorCurso.get(m.curso_id) ?? 0,
            concluidas: feitasPorCurso.get(m.curso_id) ?? 0,
          };
        }),
      );
      setCarregando(false);
    })();
  }, [user, matriculas]);

  if (!matriculas.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Seus cursos aparecerão aqui.{" "}
        <Link to="/cursos" className="text-primary hover:underline font-medium">
          conhecer os cursos
        </Link>
      </p>
    );
  }
  if (carregando) {
    return (
      <div className="space-y-3">
        {matriculas.map((m) => (
          <div key={m.id} className="h-24 rounded-xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }
  return (
    <ul className="space-y-3">
      {detalhes.map((d) => {
        const pct = d.total ? Math.round((d.concluidas / d.total) * 100) : 0;
        return (
          <li
            key={d.matriculaId}
            className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-card"
          >
            {d.capa_url ? (
              <img
                src={d.capa_url}
                alt=""
                aria-hidden
                loading="lazy"
                className="w-16 h-16 object-cover rounded-lg shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-foreground truncate">{d.titulo}</div>
              <div className="text-xs text-muted-foreground mb-1.5">
                {d.total ? `${d.concluidas} de ${d.total} aulas` : "acesso liberado"}
              </div>
              {d.total > 0 && (
                <div className="h-1.5 rounded-full overflow-hidden bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              )}
            </div>
            <Button asChild size="sm" variant="secondary" className="shrink-0 whitespace-nowrap">
              <Link to={d.slug ? `/cursos/${d.slug}/estudar` : "/cursos"}>
                Continuar
              </Link>
            </Button>
          </li>
        );
      })}
    </ul>
  );
};

// ---------- 6. Pedidos ----------
const PedidosCard = ({ pedidos }: { pedidos: PedidoLoja[] }) => {
  if (!pedidos.length) {
    return <p className="text-sm text-muted-foreground">Suas compras da Samkhya aparecerão aqui.</p>;
  }
  return (
    <>
      <ul className="divide-y divide-border/60">
        {pedidos.map((p) => (
          <li key={p.id} className="py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">
                Pedido {p.numero || `#${p.id.slice(0, 6)}`}
              </div>
              <div className="text-xs text-muted-foreground">
                {p.data ? formatDataExtenso(p.data) : "—"} · {formatMoeda(p.total)}
                {p.rastreio ? ` · rastreio ${p.rastreio}` : ""}
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-muted text-foreground/70 whitespace-nowrap">
              {p.status || "—"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <Link
          to="/samkhya/compras"
          className="text-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          ver todos <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </>
  );
};

// ---------- 7. Escola ----------
const EscolaCard = () => (
  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full bg-[#FACC15]/20 flex items-center justify-center shrink-0">
      <GraduationCap className="h-5 w-5 text-[#8A6D0B]" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="font-serif font-semibold text-foreground">
        Aluna da Formação Ayurveda Profissionalizante
      </div>
    </div>
    <Link
      to="/escola/aluno"
      className="text-sm font-semibold text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
    >
      minha área <ChevronRight className="h-4 w-4" />
    </Link>
  </div>
);

export default MeuPerfil;
