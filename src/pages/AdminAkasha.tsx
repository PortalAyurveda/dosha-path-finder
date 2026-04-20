import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, Send, Loader2, ShieldCheck, MessageCircle, User, Flame, Utensils, AlertTriangle, FileText } from "lucide-react";

type SearchType = "email" | "idPublico";

interface DoshaRegistro {
  idPublico: string;
  nome: string | null;
  email: string | null;
  idade: number | null;
  imc: number | null;
  altura: string | null;
  peso: string | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  doshaprincipal: string | null;
  agniPrincipal: string | null;
  agniforte: number | null;
  agnifraco: number | null;
  agniirregular: number | null;
  alimVata: string | null;
  alimPitta: string | null;
  alimKapha: string | null;
  agravVataTags: string | null;
  agravPittaTags: string | null;
  agravKaphaTags: string | null;
  relato_aberto: string | null;
  [key: string]: any;
}

interface SearchResponse {
  dosha: DoshaRegistro;
  messageCount: number;
}

// --------- Helpers ----------
type Nivel = "Fixado" | "Adoecido" | "Acúmulo" | "Normal" | "Pouco";

const getVataNivel = (score: number): Nivel =>
  score >= 50 ? "Fixado" : score >= 36 ? "Adoecido" : score >= 25 ? "Acúmulo" : score >= 15 ? "Normal" : "Pouco";
const getPittaNivel = (score: number): Nivel =>
  score >= 50 ? "Fixado" : score >= 41 ? "Adoecido" : score >= 31 ? "Acúmulo" : score >= 15 ? "Normal" : "Pouco";
const getKaphaNivel = (score: number): Nivel =>
  score >= 60 ? "Fixado" : score >= 51 ? "Adoecido" : score >= 36 ? "Acúmulo" : score >= 15 ? "Normal" : "Pouco";

const nivelColor: Record<Nivel, string> = {
  Fixado: "bg-red-500 text-white",
  Adoecido: "bg-orange-500 text-white",
  Acúmulo: "bg-yellow-500 text-white",
  Normal: "bg-green-500 text-white",
  Pouco: "bg-blue-500 text-white",
};

const countItems = (raw: string | null): number => {
  if (!raw) return 0;
  return raw.split(",").map((s) => s.trim()).filter(Boolean).length;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const AdminAkasha = () => {
  const { user, role, loading: authLoading, roleLoading } = useUser();
  const navigate = useNavigate();
  const accessLoading = authLoading || (!!user && roleLoading);

  const [searchType, setSearchType] = useState<SearchType>("email");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!accessLoading && (!user || role !== "admin")) {
      navigate("/", { replace: true });
    }
  }, [accessLoading, user, role, navigate]);

  const handleSearch = async () => {
    const value = searchValue.trim();
    if (!value) {
      toast.error("Digite um valor para pesquisar");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/get-dosha-with-chat-count`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ searchType, searchValue: value }),
      });

      if (resp.status === 404) {
        setError("Usuário não encontrado");
        return;
      }
      if (!resp.ok) {
        setError("Erro ao buscar dados");
        return;
      }

      const data: SearchResponse = await resp.json();
      setResult(data);
    } catch (e) {
      console.error("[AdminAkasha] search error:", e);
      setError("Erro ao buscar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToAkasha = async () => {
    if (!result) return;
    setSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/send-to-n8n-webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ searchType, searchValue: searchValue.trim() }),
      });

      if (!resp.ok) {
        toast.error("Erro ao enviar dados");
        return;
      }
      toast.success("Dados enviados com sucesso!");
    } catch (e) {
      console.error("[AdminAkasha] send error:", e);
      toast.error("Erro ao enviar dados");
    } finally {
      setSending(false);
    }
  };

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user || role !== "admin") return null;

  const dosha = result?.dosha;

  return (
    <>
      <Helmet>
        <title>Admin Akasha – Portal Ayurveda</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <h1 className="text-2xl font-heading font-bold text-foreground">
              Análise Akasha
            </h1>
          </div>

          {/* Search */}
          <section className="bg-card border border-border rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold text-foreground">Buscar teste de dosha</h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={searchType} onValueChange={(v) => setSearchType(v as SearchType)}>
                <SelectTrigger className="sm:w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="idPublico">ID Público</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={searchType === "email" ? "email@exemplo.com" : "ID público"}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading} className="gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Pesquisar
              </Button>
            </div>
          </section>

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div className="bg-destructive/10 text-destructive border border-destructive/30 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          {/* Result */}
          {!loading && dosha && (
            <div className="space-y-4">
              {/* Result Header */}
              <div className="bg-card border border-border rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold text-foreground">{dosha.idPublico}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="font-semibold text-foreground">{dosha.email ?? "—"}</span>
                  <span className="text-muted-foreground">|</span>
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="w-4 h-4" />
                    Mensagens: <strong className="text-foreground">{result.messageCount}</strong>
                  </span>
                </div>
                <Button onClick={handleSendToAkasha} disabled={sending} className="gap-2">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar para Akasha
                </Button>
              </div>

              {/* 1. Dados Pessoais */}
              <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <User className="w-4 h-4" /> Dados Pessoais
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <Info label="Nome" value={dosha.nome} />
                  <Info label="Email" value={dosha.email} />
                  <Info label="ID Público" value={dosha.idPublico} />
                  <Info label="Idade" value={dosha.idade} />
                  <Info label="IMC" value={dosha.imc} />
                  <Info label="Dosha Principal" value={dosha.doshaprincipal} />
                </div>
              </section>

              {/* 2. Níveis de Doshas */}
              <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="text-base font-semibold text-foreground">Níveis de Doshas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <DoshaRow label="Vata" score={dosha.vatascore} getNivel={getVataNivel} />
                  <DoshaRow label="Pitta" score={dosha.pittascore} getNivel={getPittaNivel} />
                  <DoshaRow label="Kapha" score={dosha.kaphascore} getNivel={getKaphaNivel} />
                </div>
              </section>

              {/* 3. Agni */}
              <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Flame className="w-4 h-4" /> Agni (Fogo Digestivo)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <Info label="Irregular (Vishma)" value={dosha.agniirregular} />
                  <Info label="Forte (Tikshna)" value={dosha.agniforte} />
                  <Info label="Fraco (Manda)" value={dosha.agnifraco} />
                </div>
                {dosha.agniPrincipal && (
                  <p className="text-xs text-muted-foreground">
                    Principal: <span className="text-foreground font-medium">{dosha.agniPrincipal}</span>
                  </p>
                )}
              </section>

              {/* 4. Alimentos Consumidos */}
              <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <Utensils className="w-4 h-4" /> Alimentos Consumidos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <Info label="Alimentos Vata" value={countItems(dosha.alimVata)} />
                  <Info label="Alimentos Pitta" value={countItems(dosha.alimPitta)} />
                  <Info label="Alimentos Kapha" value={countItems(dosha.alimKapha)} />
                </div>
                <Accordion type="multiple" className="w-full">
                  {dosha.alimVata && (
                    <AccordionItem value="av">
                      <AccordionTrigger className="text-sm">Detalhe Vata</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {dosha.alimVata}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {dosha.alimPitta && (
                    <AccordionItem value="ap">
                      <AccordionTrigger className="text-sm">Detalhe Pitta</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {dosha.alimPitta}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                  {dosha.alimKapha && (
                    <AccordionItem value="ak">
                      <AccordionTrigger className="text-sm">Detalhe Kapha</AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {dosha.alimKapha}
                      </AccordionContent>
                    </AccordionItem>
                  )}
                </Accordion>
              </section>

              {/* 5. Agravamentos */}
              <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <AlertTriangle className="w-4 h-4" /> Agravamentos
                </h3>
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="gv">
                    <AccordionTrigger className="text-sm">
                      Vata ({countItems(dosha.agravVataTags)})
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {dosha.agravVataTags || "—"}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="gp">
                    <AccordionTrigger className="text-sm">
                      Pitta ({countItems(dosha.agravPittaTags)})
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {dosha.agravPittaTags || "—"}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="gk">
                    <AccordionTrigger className="text-sm">
                      Kapha ({countItems(dosha.agravKaphaTags)})
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {dosha.agravKaphaTags || "—"}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>

              {/* 6. Relato */}
              <section className="bg-card border border-border rounded-xl p-5 space-y-3">
                <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                  <FileText className="w-4 h-4" /> Relato do Paciente
                </h3>
                <Accordion type="single" collapsible defaultValue="r">
                  <AccordionItem value="r">
                    <AccordionTrigger className="text-sm">Ver relato</AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {dosha.relato_aberto || "—"}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const Info = ({ label, value }: { label: string; value: string | number | null | undefined }) => (
  <div>
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm text-foreground font-medium break-words">
      {value === null || value === undefined || value === "" ? "—" : value}
    </p>
  </div>
);

const DoshaRow = ({
  label,
  score,
  getNivel,
}: {
  label: string;
  score: number | null;
  getNivel: (s: number) => Nivel;
}) => {
  const val = score ?? 0;
  const nivel = getNivel(val);
  return (
    <div className="flex items-center justify-between bg-muted/40 rounded-lg p-3">
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{score ?? "—"}</p>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${nivelColor[nivel]}`}>
        {nivel}
      </span>
    </div>
  );
};

export default AdminAkasha;
