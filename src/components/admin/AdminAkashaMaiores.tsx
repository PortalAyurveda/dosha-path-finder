import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";

interface Auditoria {
  id: number;
  data_hora: string;
  email_aluno: string | null;
  pergunta_original: string | null;
  resposta_final: string | null;
}

const PERIODOS = [
  { label: "7 dias", dias: 7 },
  { label: "30 dias", dias: 30 },
  { label: "90 dias", dias: 90 },
];

const storageKey = (id: number) => `akasha_conferida_${id}`;

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const ItemConversa = ({
  item,
  conferida,
  onToggle,
}: {
  item: Auditoria;
  conferida: boolean;
  onToggle: (id: number, value: boolean) => void;
}) => {
  const [expandido, setExpandido] = useState(false);
  const resposta = item.resposta_final ?? "";
  const tamanho = resposta.length;

  return (
    <div
      className={`rounded-xl border border-border bg-card p-4 space-y-3 transition-opacity ${
        conferida ? "opacity-50" : ""
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {item.email_aluno || "—"}
          </p>
          <p className="text-xs text-muted-foreground">{fmt(item.data_hora)}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {tamanho.toLocaleString("pt-BR")} car.
          </span>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={conferida}
              onChange={(e) => onToggle(item.id, e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--akasha))]"
            />
            Conferida ✓
          </label>
        </div>
      </div>

      {item.pergunta_original && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-akasha/15 px-4 py-2.5 text-sm text-foreground whitespace-pre-wrap break-words">
            {item.pergunta_original}
          </div>
        </div>
      )}

      <div className="flex justify-start">
        <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-border bg-background px-4 py-2.5 text-sm text-foreground">
          <div
            className="whitespace-pre-wrap break-words overflow-hidden"
            style={expandido ? undefined : { maxHeight: 300 }}
          >
            {resposta}
          </div>
          {tamanho > 600 && (
            <button
              onClick={() => setExpandido((v) => !v)}
              className="mt-2 text-xs font-medium text-akasha hover:underline"
            >
              {expandido ? "recolher" : "ler tudo"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const AdminAkashaMaiores = () => {
  const [dias, setDias] = useState(30);
  const [loading, setLoading] = useState(false);
  const [itens, setItens] = useState<Auditoria[]>([]);
  const [conferidas, setConferidas] = useState<Record<number, boolean>>({});
  const [mostrarConferidas, setMostrarConferidas] = useState(true);

  useEffect(() => {
    let cancelado = false;
    const load = async () => {
      setLoading(true);
      const desde = new Date(Date.now() - dias * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from("auditoria_rag")
        .select("id, data_hora, email_aluno, pergunta_original, resposta_final")
        .gte("data_hora", desde)
        .order("data_hora", { ascending: false })
        .limit(1000);

      if (cancelado) return;
      if (error) {
        console.error("[AdminAkashaMaiores]", error);
        setItens([]);
      } else {
        const ordenado = ((data ?? []) as Auditoria[])
          .slice()
          .sort((a, b) => (b.resposta_final?.length ?? 0) - (a.resposta_final?.length ?? 0))
          .slice(0, 50);
        setItens(ordenado);
        const map: Record<number, boolean> = {};
        ordenado.forEach((i) => {
          map[i.id] = localStorage.getItem(storageKey(i.id)) === "1";
        });
        setConferidas(map);
      }
      setLoading(false);
    };
    load();
    return () => {
      cancelado = true;
    };
  }, [dias]);

  const toggle = (id: number, value: boolean) => {
    if (value) localStorage.setItem(storageKey(id), "1");
    else localStorage.removeItem(storageKey(id));
    setConferidas((prev) => ({ ...prev, [id]: value }));
  };

  const totalConferidas = itens.filter((i) => conferidas[i.id]).length;

  const lista = useMemo(() => {
    const naoConferidas = itens.filter((i) => !conferidas[i.id]);
    const jaConferidas = itens.filter((i) => conferidas[i.id]);
    return mostrarConferidas ? [...naoConferidas, ...jaConferidas] : naoConferidas;
  }, [itens, conferidas, mostrarConferidas]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border rounded-xl p-4">
        <div className="flex items-center gap-2">
          {PERIODOS.map((p) => (
            <Button
              key={p.dias}
              size="sm"
              variant={dias === p.dias ? "default" : "outline"}
              onClick={() => setDias(p.dias)}
            >
              {p.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {totalConferidas} de {itens.length} conferidas
          </p>
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={mostrarConferidas}
              onChange={(e) => setMostrarConferidas(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--akasha))]"
            />
            mostrar conferidas
          </label>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : lista.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          Nenhuma conversa no período.
        </div>
      ) : (
        <div className="space-y-3">
          {lista.map((item) => (
            <ItemConversa
              key={item.id}
              item={item}
              conferida={!!conferidas[item.id]}
              onToggle={toggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminAkashaMaiores;
