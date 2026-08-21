import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import AdminNav from "@/components/admin/AdminNav";
import Seo from "@/components/Seo";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import TarefaCard from "@/components/admin/tarefas/TarefaCard";
import TarefaModal from "@/components/admin/tarefas/TarefaModal";
import {
  COLUNAS,
  CORES_FUNCAO,
  FUNCOES,
  Funcao,
  Status,
  Tarefa,
} from "@/components/admin/tarefas/tarefasTipos";

const Coluna = ({
  status,
  titulo,
  tarefas,
  children,
}: {
  status: Status;
  titulo: string;
  tarefas: Tarefa[];
  children: React.ReactNode;
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: `coluna:${status}` });
  return (
    <section className="flex-1 min-w-0">
      <header className="flex items-center justify-between px-1 pb-2">
        <h2 className="text-sm font-semibold text-foreground">{titulo}</h2>
        <span className="text-xs text-muted-foreground">{tarefas.length}</span>
      </header>
      <div
        ref={setNodeRef}
        className={`rounded-xl p-2 space-y-2 min-h-[120px] transition-colors ${
          isOver ? "bg-muted" : "bg-muted/40"
        }`}
      >
        {children}
      </div>
    </section>
  );
};

const AdminTarefas = () => {
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [arquivadas, setArquivadas] = useState<Tarefa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState<Funcao[]>([]);
  const [verArquivadas, setVerArquivadas] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [emEdicao, setEmEdicao] = useState<Tarefa | null>(null);
  const [arrastando, setArrastando] = useState<Tarefa | null>(null);

  const carregar = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_tarefas_visao")
      .select("*")
      .eq("arquivada", false)
      .order("ordem", { ascending: true })
      .order("criado_em", { ascending: true });
    setCarregando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setTarefas((data ?? []) as unknown as Tarefa[]);
  }, []);

  const carregarArquivadas = useCallback(async () => {
    const { data, error } = await supabase
      .from("admin_tarefas_visao")
      .select("*")
      .eq("arquivada", true)
      .order("criado_em", { ascending: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    setArquivadas((data ?? []) as unknown as Tarefa[]);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (verArquivadas) carregarArquivadas();
  }, [verArquivadas, carregarArquivadas]);

  // realtime (opcional): recarrega quando outro admin mexe
  useEffect(() => {
    const canal = supabase
      .channel("admin_tarefas_quadro")
      .on("postgres_changes", { event: "*", schema: "public", table: "admin_tarefas" }, () => {
        carregar();
        if (verArquivadas) carregarArquivadas();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, [carregar, carregarArquivadas, verArquivadas]);

  useEffect(() => {
    setEmEdicao((atual) => (atual ? tarefas.find((t) => t.id === atual.id) ?? atual : atual));
  }, [tarefas]);

  const visiveis = useMemo(
    () =>
      filtros.length === 0
        ? tarefas
        : tarefas.filter((t) => (t.funcoes ?? []).some((f) => filtros.includes(f))),
    [tarefas, filtros]
  );

  const porColuna = useMemo(() => {
    const mapa: Record<Status, Tarefa[]> = { a_fazer: [], fazendo: [], feito: [] };
    for (const t of visiveis) (mapa[t.status] ?? mapa.a_fazer).push(t);
    return mapa;
  }, [visiveis]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );

  const mover = async (
    tarefa: Tarefa,
    destino: Status,
    acima: string | null,
    abaixo: string | null,
    anterior: Tarefa[]
  ) => {
    const { error } = await supabase.rpc("admin_tarefa_mover", {
      p_id: tarefa.id,
      p_status: destino,
      p_acima: acima,
      p_abaixo: abaixo,
    });
    if (error) {
      setTarefas(anterior);
      toast.error(error.message);
      return;
    }
    carregar();
  };

  // reposiciona localmente (otimista) e devolve a lista final da coluna destino
  const aplicarOtimista = (tarefa: Tarefa, destino: Status, indice: number) => {
    const anterior = tarefas;
    const restantes = tarefas.filter((t) => t.id !== tarefa.id);
    const daColuna = restantes.filter((t) => t.status === destino);
    const fora = restantes.filter((t) => t.status !== destino);
    const atualizada = { ...tarefa, status: destino };
    const novaColuna = [...daColuna];
    novaColuna.splice(Math.max(0, Math.min(indice, novaColuna.length)), 0, atualizada);
    setTarefas([...fora, ...novaColuna]);
    const pos = novaColuna.findIndex((t) => t.id === tarefa.id);
    return {
      anterior,
      acima: pos > 0 ? novaColuna[pos - 1].id : null,
      abaixo: pos < novaColuna.length - 1 ? novaColuna[pos + 1].id : null,
    };
  };

  const onDragStart = (e: DragStartEvent) => {
    setArrastando(tarefas.find((t) => t.id === e.active.id) ?? null);
  };

  const onDragEnd = async (e: DragEndEvent) => {
    setArrastando(null);
    const { active, over } = e;
    if (!over) return;
    const tarefa = tarefas.find((t) => t.id === active.id);
    if (!tarefa) return;

    const overId = String(over.id);
    let destino: Status;
    let indice: number;

    if (overId.startsWith("coluna:")) {
      destino = overId.split(":")[1] as Status;
      indice = porColuna[destino].filter((t) => t.id !== tarefa.id).length;
    } else {
      const alvo = tarefas.find((t) => t.id === overId);
      if (!alvo || alvo.id === tarefa.id) return;
      destino = alvo.status;
      const lista = porColuna[destino].filter((t) => t.id !== tarefa.id);
      indice = lista.findIndex((t) => t.id === alvo.id);
      if (indice < 0) indice = lista.length;
    }

    const { anterior, acima, abaixo } = aplicarOtimista(tarefa, destino, indice);
    await mover(tarefa, destino, acima, abaixo, anterior);
  };

  const moverPorSeta = async (tarefa: Tarefa, direcao: -1 | 1) => {
    const lista = porColuna[tarefa.status];
    const pos = lista.findIndex((t) => t.id === tarefa.id);
    const novoIndice = pos + direcao;
    if (pos < 0 || novoIndice < 0 || novoIndice >= lista.length) return;
    const { anterior, acima, abaixo } = aplicarOtimista(tarefa, tarefa.status, novoIndice);
    await mover(tarefa, tarefa.status, acima, abaixo, anterior);
  };

  const moverParaColuna = async (tarefa: Tarefa, destino: Status) => {
    const indice = porColuna[destino].length;
    const { anterior, acima, abaixo } = aplicarOtimista(tarefa, destino, indice);
    await mover(tarefa, destino, acima, abaixo, anterior);
  };

  const arquivar = async (tarefa: Tarefa) => {
    const { error } = await (supabase.from("admin_tarefas") as any)
      .update({ arquivada: true })
      .eq("id", tarefa.id);
    if (error) return toast.error(error.message);
    toast.success("Tarefa arquivada");
    carregar();
    if (verArquivadas) carregarArquivadas();
  };

  const desarquivar = async (tarefa: Tarefa) => {
    const { error } = await (supabase.from("admin_tarefas") as any)
      .update({ arquivada: false })
      .eq("id", tarefa.id);
    if (error) return toast.error(error.message);
    carregar();
    carregarArquivadas();
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo title="Tarefas — Admin" description="Quadro interno de tarefas do Portal." />
      <AdminNav />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-5">
        <header className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-baseline gap-2">
            <h1 className="text-2xl font-heading font-bold text-foreground">Tarefas</h1>
            <span className="text-sm text-muted-foreground">{tarefas.length} no quadro</span>
          </div>
          <Button
            onClick={() => {
              setEmEdicao(null);
              setModalAberto(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Nova tarefa
          </Button>
        </header>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap gap-2">
            {FUNCOES.map((f) => {
              const ativo = filtros.includes(f.key);
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() =>
                    setFiltros((v) =>
                      v.includes(f.key) ? v.filter((x) => x !== f.key) : [...v, f.key]
                    )
                  }
                  className="px-3 py-1.5 rounded-full text-xs border transition-colors"
                  style={
                    ativo
                      ? { background: CORES_FUNCAO[f.key], borderColor: CORES_FUNCAO[f.key], color: "#fff" }
                      : { borderColor: "#EDE8F5", color: "#352F54" }
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <label className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
            <Switch checked={verArquivadas} onCheckedChange={setVerArquivadas} />
            ver arquivadas
          </label>
        </div>

        {carregando ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          >
            <div className="flex flex-col md:flex-row gap-4 items-start">
              {COLUNAS.map((c) => {
                const lista = porColuna[c.key];
                return (
                  <Coluna key={c.key} status={c.key} titulo={c.label} tarefas={lista}>
                    <SortableContext
                      items={lista.map((t) => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {lista.map((t, i) => (
                        <TarefaCard
                          key={t.id}
                          tarefa={t}
                          podeSubir={i > 0}
                          podeDescer={i < lista.length - 1}
                          onAbrir={(x) => {
                            setEmEdicao(x);
                            setModalAberto(true);
                          }}
                          onSubir={(x) => moverPorSeta(x, -1)}
                          onDescer={(x) => moverPorSeta(x, 1)}
                          onMoverColuna={moverParaColuna}
                          onArquivar={arquivar}
                        />
                      ))}
                      {lista.length === 0 && (
                        <p className="text-xs text-muted-foreground px-2 py-6 text-center">
                          Nada aqui.
                        </p>
                      )}
                    </SortableContext>
                  </Coluna>
                );
              })}
            </div>
            <DragOverlay>
              {arrastando && (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-lg">
                  {arrastando.titulo}
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}

        {verArquivadas && (
          <section className="space-y-2 pt-4">
            <h2 className="text-sm font-semibold text-foreground">Arquivadas</h2>
            {arquivadas.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhuma tarefa arquivada.</p>
            )}
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {arquivadas.map((t) => (
                <li key={t.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="flex-1 min-w-0 text-sm truncate">{t.titulo}</span>
                  <span className="text-xs text-muted-foreground hidden sm:inline">{t.status}</span>
                  <Button size="sm" variant="outline" onClick={() => desarquivar(t)}>
                    desarquivar
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>

      <TarefaModal
        aberto={modalAberto}
        tarefa={emEdicao}
        onFechar={() => setModalAberto(false)}
        onSalvo={() => {
          carregar();
          if (verArquivadas) carregarArquivadas();
        }}
      />
    </div>
  );
};

export default AdminTarefas;
