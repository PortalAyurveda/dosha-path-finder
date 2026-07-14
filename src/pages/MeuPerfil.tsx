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
  Sparkles,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { useEscolaAluno } from "@/hooks/useEscolaAluno";
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
  cursos?: { titulo: string | null } | null;
};

type PedidoLoja = {
  id: string;
  numero?: string | null;
  data?: string | null;
  total?: number | null;
  status?: string | null;
  rastreio?: string | null;
};

// ---------- page ----------
const MeuPerfil = () => {
  const { user, loading: authLoading, doshaResult, refreshProfile } = useUser();
  const { aluno } = useEscolaAluno();

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
        <Conteudo userId={user.id} email={user.email ?? ""} doshaNome={doshaResult?.doshaprincipal ?? null} alunoAprovado={!!aluno} refreshProfile={refreshProfile} />
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

const Conteudo = ({
  userId,
  email,
  doshaNome,
  alunoAprovado,
  refreshProfile,
}: {
  userId: string;
  email: string;
  doshaNome: string | null;
  alunoAprovado: boolean;
  refreshProfile: () => Promise<void>;
}) => {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [assinatura, setAssinatura] = useState<Assinatura>(null);
  const [matriculas, setMatriculas] = useState<Matricula[]>([]);
  const [pedidos, setPedidos] = useState<PedidoLoja[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [pRes, sRes, aRes, mRes] = await Promise.all([
      supabase
        .from("user_profiles")
        .select("id,nome_completo,email,telefone,cpf,endereco,avatar_url,created_at")
        .eq("id", userId)
        .maybeSingle(),
      supabase.rpc("get_meu_perfil_stats"),
      supabase.functions.invoke("gerenciar-assinatura", { body: { action: "listar" } }),
      supabase
        .from("curso_matriculas")
        .select("id,curso_id,cursos(titulo)")
        .eq("user_id", userId),
    ]);

    if (pRes.data) setPerfil(pRes.data as any);
    if (sRes.data) setStats(sRes.data as any);
    if (aRes.data && typeof aRes.data === "object" && "assinatura" in (aRes.data as any)) {
      setAssinatura((aRes.data as any).assinatura ?? null);
    }
    if (mRes.data) setMatriculas(mRes.data as any);

    try {
      const { data: pedidosData } = await supabase.functions.invoke("meus-pedidos", { body: {} });
      const arr = Array.isArray((pedidosData as any)?.pedidos)
        ? (pedidosData as any).pedidos
        : Array.isArray(pedidosData)
          ? (pedidosData as any)
          : [];
      setPedidos(arr.slice(0, 3));
    } catch {
      setPedidos([]);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading || !perfil) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
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

      <DadosCard
        perfil={perfil}
        onSaved={(patch) => setPerfil((p) => (p ? { ...p, ...patch } : p))}
      />

      <AssinaturaCard assinatura={assinatura} onChanged={load} />

      <CursosCard matriculas={matriculas} />

      <PedidosCard pedidos={pedidos} />

      {alunoAprovado && <EscolaCard />}

      <div className="pt-2 flex justify-center">
        <Button
          variant="outline"
          onClick={() => navigate("/meu-dosha")}
          className="rounded-full"
        >
          Ver minha caminhada
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
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
    <Card>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl font-serif font-semibold">Meus dados</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Este endereço é o padrão de entrega da loja.
          </p>
        </div>
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
    </Card>
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

  return (
    <Card>
      <h2 className="text-xl font-serif font-semibold mb-4">Minha assinatura</h2>

      {!assinatura ? (
        <div className="text-sm text-muted-foreground">
          Você não tem assinatura ativa.{" "}
          <Link to="/assinar" className="text-primary hover:underline font-medium">
            conhecer os planos
          </Link>
        </div>
      ) : (
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
      )}
    </Card>
  );
};

// ---------- 5. Cursos ----------
const CursosCard = ({ matriculas }: { matriculas: Matricula[] }) => (
  <Card>
    <div className="flex items-center gap-2 mb-4">
      <BookOpen className="h-5 w-5 text-primary" />
      <h2 className="text-xl font-serif font-semibold">Meus cursos</h2>
    </div>
    {matriculas.length === 0 ? (
      <p className="text-sm text-muted-foreground">Seus cursos aparecerão aqui.</p>
    ) : (
      <ul className="divide-y divide-border/60">
        {matriculas.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 py-3">
            <div className="min-w-0">
              <div className="font-medium text-foreground truncate">
                {m.cursos?.titulo || "Curso"}
              </div>
              <div className="text-xs text-muted-foreground">acesso permanente</div>
            </div>
            <Link
              to="/cursos"
              className="text-sm text-primary hover:underline whitespace-nowrap inline-flex items-center gap-1"
            >
              abrir <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        ))}
      </ul>
    )}
  </Card>
);

// ---------- 6. Pedidos ----------
const PedidosCard = ({ pedidos }: { pedidos: PedidoLoja[] }) => (
  <Card>
    <div className="flex items-center gap-2 mb-4">
      <ShoppingBag className="h-5 w-5 text-primary" />
      <h2 className="text-xl font-serif font-semibold">Meus pedidos da loja</h2>
    </div>
    {pedidos.length === 0 ? (
      <p className="text-sm text-muted-foreground">Suas compras da Samkhya aparecerão aqui.</p>
    ) : (
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
    )}
  </Card>
);

// ---------- 7. Escola ----------
const EscolaCard = () => (
  <Card className="border-[#FACC15]/60">
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
  </Card>
);

export default MeuPerfil;
