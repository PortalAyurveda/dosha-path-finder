import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, RefreshCw } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  terapiaAdmin,
  numerosAdmin,
  comentariosPendentes,
  type Participante,
  type ConsultaAdmin,
  type AvaliacaoAdmin,
  type SugestaoAdmin,
  type ConfigCMS,
  type ValorCMS,
} from "@/lib/terapiaAdmin";
import Cadastros from "@/components/admin/terapeutas/Cadastros";
import Textos from "@/components/admin/terapeutas/Textos";
import {
  Participantes,
  Consultas,
  Sugestoes,
  Avaliacoes,
} from "@/components/admin/terapeutas/Listas";

export default function AdminTerapeutas() {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [consultas, setConsultas] = useState<ConsultaAdmin[]>([]);
  const [consultas30, setConsultas30] = useState<ConsultaAdmin[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<AvaliacaoAdmin[]>([]);
  const [sugestoes, setSugestoes] = useState<SugestaoAdmin[]>([]);
  const [config, setConfig] = useState<ConfigCMS>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dias, setDias] = useState(30);
  const [periodLoading, setPeriodLoading] = useState(false);
  const [periodError, setPeriodError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState(false);
  const { toast } = useToast();
  const carregar = async () => {
    setLoading(true);
    setError("");
    try {
      const [p, c, a, s, cfg] = await Promise.all([
        terapiaAdmin.participantes(),
        terapiaAdmin.consultas(30),
        terapiaAdmin.avaliacoes(),
        terapiaAdmin.sugestoes(),
        terapiaAdmin.config(),
      ]);
      setParticipantes(p);
      setConsultas30(c);
      setConsultas(c);
      setDias(30);
      setAvaliacoes(a);
      setSugestoes(s);
      setConfig(cfg);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Não foi possível carregar.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void carregar();
  }, []);
  useEffect(() => {
    if (dias === 30) {
      setConsultas(consultas30);
      setPeriodError("");
      setPeriodLoading(false);
      return;
    }
    let active = true;
    setPeriodLoading(true);
    setPeriodError("");
    terapiaAdmin
      .consultas(dias)
      .then((c) => {
        if (active) setConsultas(c);
      })
      .catch((e) => {
        if (active)
          setPeriodError(
            e instanceof Error ? e.message : "Não foi possível carregar.",
          );
      })
      .finally(() => {
        if (active) setPeriodLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dias, consultas30]);
  const executar = async (id: string, fn: () => Promise<void>) => {
    setBusy(id);
    try {
      await fn();
    } catch (e) {
      toast({
        title: "Não foi possível salvar",
        description: e instanceof Error ? e.message : "Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  };
  const configSalva = (chave: string, valor: ValorCMS) => {
    setConfig((c) => ({ ...c, [chave]: valor }));
    if (chave === "sistema_ligado") void terapiaAdmin.participantes().then(setParticipantes).catch(() => {});
  };
  const sistema = (v: boolean) =>
    executar("sistema", async () => {
      await terapiaAdmin.salvar("sistema_ligado", v);
      configSalva("sistema_ligado", v);
      setParticipantes(await terapiaAdmin.participantes());
    });
  const n = numerosAdmin(participantes, consultas30);
  const numeros = [
    ["terapeutas", n.terapeutas],
    ["com Premium", n.premium],
    ["participando", n.participando],
    ["online agora", n.online],
    ["pacientes ligados", n.pacientes],
    ["consultas em 30 dias", n.consultas],
  ];
  return (
    <>
      <Helmet>
        <title>Admin · Terapeutas | Portal Ayurveda</title>
      </Helmet>
      <AdminNav />
      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6 min-w-0">
        <h1 className="text-2xl font-heading font-bold">Terapeutas</h1>
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2
              className="h-8 w-8 animate-spin text-muted-foreground"
              aria-label="Carregando"
            />
          </div>
        ) : error ? (
          <div role="alert" className="space-y-3">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" onClick={carregar}>
              <RefreshCw />
              Tentar novamente
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {numeros.map(([label, value]) => (
                <div
                  key={label}
                  className="border border-border rounded-lg p-4 bg-card"
                >
                  <p className="text-2xl font-heading font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>
            <Tabs defaultValue="participantes" className="min-w-0">
              <div className="overflow-x-auto border-b border-border">
                <TabsList className="bg-transparent rounded-none h-auto p-0 justify-start [&>button]:rounded-none [&>button]:border-b-2 [&>button]:border-transparent [&>button[data-state=active]]:border-secondary [&>button[data-state=active]]:shadow-none">
                  <TabsTrigger
                    value="participantes"
                    className="data-[state=active]:border-secondary border-b-2 border-transparent rounded-none data-[state=active]:shadow-none"
                  >
                    Participantes
                  </TabsTrigger>
                  <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
                  <TabsTrigger value="consultas">Consultas</TabsTrigger>
                  <TabsTrigger value="sugestoes">
                    Sugestões do acervo{" "}
                    {sugestoes.filter((s) => s.revisao === "em_revisao")
                      .length > 0 && (
                      <span className="ml-2 bg-secondary text-secondary-foreground rounded-full px-1.5 text-xs">
                        {
                          sugestoes.filter((s) => s.revisao === "em_revisao")
                            .length
                        }
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="avaliacoes">
                    Avaliações{" "}
                    {comentariosPendentes(avaliacoes) > 0 && (
                      <span className="ml-2 bg-secondary text-secondary-foreground rounded-full px-1.5 text-xs">
                        {comentariosPendentes(avaliacoes)}
                      </span>
                    )}
                  </TabsTrigger>
                  <TabsTrigger value="textos">Textos</TabsTrigger>
                </TabsList>
              </div>
              <TabsContent value="participantes" className="space-y-5 pt-4">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
                  <label
                    htmlFor="sistema-terapeutas"
                    className="font-medium text-sm"
                  >
                    Sistema de terapeutas
                  </label>
                  <Switch
                    id="sistema-terapeutas"
                    className="data-[state=checked]:bg-secondary"
                    checked={config.sistema_ligado === true}
                    disabled={busy !== null}
                    onCheckedChange={(v) =>
                      v ? void sistema(true) : setConfirmar(true)
                    }
                  />
                </div>
                <Participantes
                  lista={participantes}
                  busy={busy}
                  onToggle={(t, v) =>
                    void executar(t.id, async () => {
                      await terapiaAdmin.participar(t.id, v);
                      setParticipantes(await terapiaAdmin.participantes());
                    })
                  }
                />
              </TabsContent>
              <TabsContent value="cadastros" className="pt-4">
                <Cadastros />
              </TabsContent>
              <TabsContent value="consultas" className="space-y-4 pt-4">
                <Select
                  value={String(dias)}
                  onValueChange={(v) => setDias(Number(v))}
                >
                  <SelectTrigger
                    className="w-44"
                    aria-label="Período das consultas"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[7, 30, 90].map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        Últimos {d} dias
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {periodLoading ? (
                  <Loader2
                    className="animate-spin"
                    aria-label="Carregando consultas"
                  />
                ) : periodError ? (
                  <p role="alert" className="text-destructive">
                    {periodError}
                  </p>
                ) : (
                  <Consultas lista={consultas} />
                )}
              </TabsContent>
              <TabsContent value="sugestoes" className="pt-4">
                <Sugestoes
                  lista={sugestoes}
                  busy={busy}
                  onReview={(s, d) =>
                    void executar(s.id, async () => {
                      await terapiaAdmin.revisar(s.id, d);
                      setSugestoes((l) =>
                        l.map((x) =>
                          x.id === s.id ? { ...x, revisao: d } : x,
                        ),
                      );
                    })
                  }
                />
              </TabsContent>
              <TabsContent value="avaliacoes" className="pt-4">
                <Avaliacoes
                  lista={avaliacoes}
                  busy={busy}
                  onToggle={(a, v) =>
                    void executar(a.consulta_id, async () => {
                      await terapiaAdmin.publicar(a.consulta_id, v);
                      setAvaliacoes((l) =>
                        l.map((x) =>
                          x.consulta_id === a.consulta_id
                            ? { ...x, publicar: v }
                            : x,
                        ),
                      );
                    })
                  }
                />
              </TabsContent>
              <TabsContent value="textos" forceMount className="pt-4 data-[state=inactive]:hidden">
                <Textos config={config} onSaved={configSalva} />
              </TabsContent>
            </Tabs>
          </>
        )}
        <AlertDialog open={confirmar} onOpenChange={setConfirmar}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Desligar o sistema de terapeutas?
              </AlertDialogTitle>
              <AlertDialogDescription>
                O diretório, a agenda e o Consulta agora ficam fora do ar para
                todas.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                onClick={() => void sistema(false)}
              >
                Desligar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </>
  );
}
