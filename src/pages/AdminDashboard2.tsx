import { useEffect, useMemo, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminNav from "@/components/admin/AdminNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ChevronDown, MessageSquare, Send, Pencil, Check, X, Star, Trash2, Sparkles, RefreshCw, ListChecks } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

type LogEntry = { data: string; autor: string; acao: string };
type Sugestao = { data: string; campo: string; sugestao: string; justificativa?: string; status: string; origem?: string };
type Nota = { data: string; texto: string };

type DevlogEntry = {
  id: string;
  tipo: "vertical" | "modulo" | "submodulo" | "infra" | string;
  vertical: string | null;
  modulo: string | null;
  submodulo: string | null;
  titulo: string;
  status: "planejado" | "em_andamento" | "concluido" | "bloqueado" | "em_revisao" | string;
  descricao: string | null;
  ultima_atualizacao: string | null;
  proximos_passos: string | null;
  hipotese: string | null;
  depende_de: string[] | null;
  impacta: string[] | null;
  stack: string[] | null;
  acesso_permitido: string[] | null;
  perfis: string[] | null;
  modo_acesso: string | null;
  tabelas_relacionadas: string[] | null;
  agente_webhook: string | null;
  agente_system_prompt: string | null;
  agente_ativo: boolean | null;
  log_atividade: LogEntry[] | null;
  proposto_pelo_agente: Sugestao[] | null;
  notas: Nota[] | null;
};

const STATUS_COLOR: Record<string, string> = {
  planejado: "#9ca3af",
  em_andamento: "#f59e0b",
  concluido: "#22c55e",
  bloqueado: "#ef4444",
  em_revisao: "#3b82f6",
};

const STATUS_LABEL: Record<string, string> = {
  planejado: "Planejado",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  bloqueado: "Bloqueado",
  em_revisao: "Em revisão",
};

const TIPO_ORDER = ["vertical", "modulo", "submodulo", "infra"];

const TIPO_LABEL: Record<string, string> = {
  vertical: "Verticais",
  modulo: "Módulos",
  submodulo: "Submódulos",
  infra: "Infraestrutura",
};

const STATUS_OPTIONS = ["planejado", "em_andamento", "concluido", "bloqueado", "em_revisao"];

function StatusDot({ status }: { status: string }) {
  return (
    <span
      className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
      style={{ backgroundColor: STATUS_COLOR[status] || "#9ca3af" }}
    />
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border"
      style={{
        backgroundColor: `${STATUS_COLOR[status] || "#9ca3af"}20`,
        borderColor: `${STATUS_COLOR[status] || "#9ca3af"}80`,
        color: STATUS_COLOR[status] || "#6b7280",
      }}
    >
      <StatusDot status={status} />
      {STATUS_LABEL[status] || status}
    </span>
  );
}

function Chips({ items, color }: { items: string[] | null; color: string }) {
  if (!items || items.length === 0) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((it, i) => (
        <span
          key={i}
          className="text-xs px-2 py-0.5 rounded-full border"
          style={{ backgroundColor: `${color}15`, borderColor: `${color}50`, color }}
        >
          {it}
        </span>
      ))}
    </div>
  );
}

function formatNotaDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "").toLowerCase();
}

function NotasSection({
  notas,
  onAdd,
  onDelete,
}: {
  notas: Nota[];
  onAdd: (texto: string) => Promise<void>;
  onDelete: (idx: number) => Promise<void>;
}) {
  const [texto, setTexto] = useState("");
  const [saving, setSaving] = useState(false);
  const sorted = useMemo(() => {
    return [...notas]
      .map((n, idx) => ({ ...n, _idx: idx }))
      .sort((a, b) => (b.data || "").localeCompare(a.data || ""));
  }, [notas]);

  const handleAdd = async () => {
    const t = texto.trim();
    if (!t || saving) return;
    setSaving(true);
    try {
      await onAdd(t);
      setTexto("");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-border/60 rounded-lg border-l-4 border-l-primary bg-primary/[0.03] p-4">
      <h3 className="text-xs font-semibold mb-3 text-muted-foreground uppercase tracking-wide">Minhas notas</h3>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              e.preventDefault();
              handleAdd();
            }
          }}
          rows={2}
          placeholder="Escreva uma nota..."
          className="min-h-[64px] resize-none"
        />
        <Button
          size="sm"
          disabled={saving || !texto.trim()}
          onClick={handleAdd}
          className="sm:self-start shrink-0"
        >
          Adicionar nota
        </Button>
      </div>
      <div className="space-y-3">
        {sorted.length === 0 && (
          <p className="text-sm text-muted-foreground italic">Nenhuma nota ainda.</p>
        )}
        {sorted.map((n) => (
          <div
            key={`${n.data}-${n._idx}`}
            className="group flex items-start gap-3 text-sm border rounded-md bg-background/60 p-3 transition hover:bg-background"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-muted-foreground mb-1">{formatNotaDate(n.data)}</div>
              <div className="whitespace-pre-wrap text-foreground/90">{n.texto}</div>
            </div>
            <button
              onClick={() => onDelete(n._idx)}
              className="text-muted-foreground/60 hover:text-destructive transition opacity-60 group-hover:opacity-100"
              aria-label="Excluir nota"
              title="Excluir nota"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


type RecepProposta = { modulo: string; campo: string; proposta: string; justificativa?: string };
type RecepMsg = { role: "user" | "assistant"; content: string; propostas?: RecepProposta[] };

const PERFIS_RECEP = ["Edson", "Marcos", "Marcelle", "Estoque"];
const newSessionId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `s_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`);

function RecepcionistaDev({
  modulos,
  verticais,
  onAttach,
  notas,
  onUpdateNotas,
}: {
  modulos: { id: string; titulo: string; modulo: string | null }[];
  verticais: string[];
  onAttach: (moduloId: string, p: RecepProposta) => Promise<void>;
  notas: Nota[];
  onUpdateNotas: (notas: Nota[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(true);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<RecepMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [picker, setPicker] = useState<{ p: RecepProposta; msgIdx: number; pIdx: number } | null>(null);
  const [pickerModuloId, setPickerModuloId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>(() => newSessionId());

  // Foco: modo rápido (uma chave) ou modo preciso (multi-módulos)
  const [focusKind, setFocusKind] = useState<"quick" | "precise">("quick");
  const [quickFocus, setQuickFocus] = useState<string>("tudo");
  const [precisePickerOpen, setPrecisePickerOpen] = useState(false);
  const [selectedModulos, setSelectedModulos] = useState<Set<string>>(new Set());

  const moduloKey = (m: { titulo: string; modulo: string | null }) =>
    (m.modulo && m.modulo.trim()) || m.titulo;

  const modulosFoco: string[] = useMemo(() => {
    if (focusKind === "precise") {
      if (selectedModulos.size === 0) return ["tudo"];
      return Array.from(selectedModulos);
    }
    return [quickFocus || "tudo"];
  }, [focusKind, quickFocus, selectedModulos]);

  const focusLabel =
    focusKind === "precise"
      ? selectedModulos.size === 0
        ? "Tudo"
        : `${selectedModulos.size} módulo${selectedModulos.size > 1 ? "s" : ""}`
      : quickFocus === "tudo"
        ? "Tudo"
        : quickFocus.charAt(0).toUpperCase() + quickFocus.slice(1);

  const toggleModulo = (key: string) => {
    setSelectedModulos((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const resetConversation = () => {
    setHistory([]);
    setInput("");
    setSessionId(newSessionId());
  };

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: RecepMsg = { role: "user", content: text };
    setHistory((h) => [...h, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("https://n8n.portalayurveda.com/webhook/recepcionista-dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem: text,
          modulos_foco: modulosFoco,
          session_id: sessionId,
        }),
      });
      const txt = await res.text();
      let resposta = txt;
      let propostas: RecepProposta[] = [];
      try {
        const j = JSON.parse(txt);
        resposta = j.resposta || j.message || txt;
        if (Array.isArray(j.propostas)) propostas = j.propostas;
      } catch {}
      setHistory((h) => [...h, { role: "assistant", content: resposta, propostas }]);
    } catch (e: any) {
      setHistory((h) => [...h, { role: "assistant", content: `Erro: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const openPicker = (p: RecepProposta, msgIdx: number, pIdx: number) => {
    const found = modulos.find((m) => m.modulo === p.modulo || m.titulo === p.modulo);
    setPickerModuloId(found?.id || modulos[0]?.id || "");
    setPicker({ p, msgIdx, pIdx });
  };

  const confirmAttach = async () => {
    if (!picker || !pickerModuloId) return;
    await onAttach(pickerModuloId, picker.p);
    setPicker(null);
  };

  return (
    <div className="border rounded-lg bg-card mb-4">
      <div className="w-full flex items-center gap-2 px-4 py-3 border-b text-sm font-semibold">
        <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-2 flex-1 text-left">
          <Sparkles className="w-4 h-4 text-primary" />
          Recepcionista Dev
        </button>
        <span className="text-xs font-normal text-muted-foreground hidden sm:inline">
          Foco: <span className="font-medium text-foreground">{focusLabel}</span>
        </span>
        <button
          onClick={resetConversation}
          className="text-xs font-normal text-muted-foreground hover:text-foreground flex items-center gap-1"
          title="Nova conversa"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Nova conversa
        </button>
        <button onClick={() => setOpen((o) => !o)} aria-label="toggle">
          <ChevronDown className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`} />
        </button>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          {history.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Conte uma ideia ou observação. Eu posso sugerir mudanças e você decide a qual módulo anexar.
            </p>
          )}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {history.map((m, i) => (
              <div key={i} className={`text-sm ${m.role === "user" ? "ml-8" : "mr-8"}`}>
                <div
                  className={`p-3 rounded-lg whitespace-pre-wrap ${
                    m.role === "user" ? "bg-primary/10" : "bg-muted"
                  }`}
                >
                  {m.content}
                </div>
                {m.propostas && m.propostas.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.propostas.map((p, pi) => (
                      <div key={pi} className="border rounded-lg p-3 bg-background flex items-start gap-2">
                        <div className="flex-1 text-xs space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{p.modulo}</Badge>
                            <Badge variant="secondary">{p.campo}</Badge>
                          </div>
                          <div className="whitespace-pre-wrap text-sm">{p.proposta}</div>
                          {p.justificativa && (
                            <div className="text-muted-foreground italic">{p.justificativa}</div>
                          )}
                        </div>
                        <button
                          onClick={() => openPicker(p, i, pi)}
                          className="text-muted-foreground hover:text-yellow-500 transition shrink-0"
                          title="Anexar a um módulo"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-xs text-muted-foreground">Pensando...</div>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pb-1 border-b border-dashed">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground mr-1">Foco:</span>
            {[
              { key: "tudo", label: "Tudo" },
              ...PERFIS_RECEP.map((p) => ({ key: p.toLowerCase(), label: p })),
              ...verticais.map((v) => ({ key: v.toLowerCase(), label: v })),
            ].map((opt) => {
              const active = focusKind === "quick" && quickFocus === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => {
                    setFocusKind("quick");
                    setQuickFocus(opt.key);
                  }}
                  className={`text-xs px-2 py-0.5 rounded-full border transition ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border text-muted-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
            <Popover open={precisePickerOpen} onOpenChange={setPrecisePickerOpen}>
              <PopoverTrigger asChild>
                <button
                  className={`text-xs px-2 py-0.5 rounded-full border transition flex items-center gap-1 ${
                    focusKind === "precise"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border text-muted-foreground"
                  }`}
                >
                  <ListChecks className="w-3 h-3" />
                  {focusKind === "precise" && selectedModulos.size > 0
                    ? `${selectedModulos.size} selecionado${selectedModulos.size > 1 ? "s" : ""}`
                    : "Escolher módulos específicos"}
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-2 border-b flex items-center justify-between gap-2">
                  <button
                    className="text-xs text-primary hover:underline"
                    onClick={() => {
                      setFocusKind("precise");
                      setSelectedModulos(new Set(modulos.map(moduloKey)));
                    }}
                  >
                    Selecionar todos
                  </button>
                  <button
                    className="text-xs text-muted-foreground hover:underline"
                    onClick={() => setSelectedModulos(new Set())}
                  >
                    Limpar
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto p-2 space-y-1">
                  {modulos.map((m) => {
                    const key = moduloKey(m);
                    const checked = selectedModulos.has(key);
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-2 text-sm px-2 py-1 rounded hover:bg-muted cursor-pointer"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => {
                            setFocusKind("precise");
                            toggleModulo(key);
                          }}
                        />
                        <span className="flex-1 truncate">{m.titulo}</span>
                      </label>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Sua ideia..."
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
            />
            <Button onClick={send} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {picker && (
            <div className="border rounded-lg p-3 bg-muted/50 space-y-2">
              <div className="text-xs font-semibold">Anexar sugestão a qual módulo?</div>
              <Select value={pickerModuloId} onValueChange={setPickerModuloId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {modulos.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">Campo: <span className="font-mono">{picker.p.campo}</span></div>
              <div className="flex gap-2">
                <Button size="sm" onClick={confirmAttach}>Confirmar</Button>
                <Button size="sm" variant="ghost" onClick={() => setPicker(null)}>Cancelar</Button>
              </div>
            </div>
          )}
          <NotasSection
            notas={notas || []}
            onAdd={async (texto) => {
              const nova: Nota = { data: new Date().toISOString().slice(0, 10), texto };
              await onUpdateNotas([...(notas || []), nova]);
            }}
            onDelete={async (idx) => {
              const list = (notas || []).filter((_, i) => i !== idx);
              await onUpdateNotas(list);
            }}
          />
        </div>
      )}
    </div>
  );
}

function AgentChat({
  entry,
  open,
  onClose,
}: {
  entry: DevlogEntry;
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || !entry.agente_webhook) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(entry.agente_webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modulo: entry.modulo,
          titulo: entry.titulo,
          system_prompt: entry.agente_system_prompt,
          tabelas: entry.tabelas_relacionadas,
          mensagem: userMsg,
        }),
      });
      const txt = await res.text();
      let reply = txt;
      try {
        const j = JSON.parse(txt);
        reply = j.resposta || j.message || j.output || txt;
      } catch {}
      setMessages((m) => [...m, { role: "agent", text: reply }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "agent", text: `Erro: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Agente: {entry.titulo}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto space-y-3 my-4">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground">Faça uma pergunta ao agente deste módulo.</p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg text-sm ${
                m.role === "user" ? "bg-primary/10 ml-8" : "bg-muted mr-8"
              }`}
            >
              {m.text}
            </div>
          ))}
          {loading && <div className="text-sm text-muted-foreground">Pensando...</div>}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mensagem..."
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
          />
          <Button onClick={send} disabled={loading || !input.trim()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InlineEdit({
  value,
  onSave,
  multiline,
  label,
}: {
  value: string | null;
  onSave: (v: string) => Promise<void>;
  multiline?: boolean;
  label?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  useEffect(() => setDraft(value || ""), [value]);

  if (!editing) {
    return (
      <div className="group flex items-start gap-2">
        <div className="flex-1 whitespace-pre-wrap text-sm">
          {value || <span className="text-muted-foreground italic">— vazio —</span>}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition"
          aria-label={`Editar ${label || ""}`}
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {multiline ? (
        <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} />
      ) : (
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} />
      )}
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={async () => {
            await onSave(draft);
            setEditing(false);
          }}
        >
          <Check className="w-3.5 h-3.5 mr-1" /> Salvar
        </Button>
        <Button size="sm" variant="ghost" onClick={() => { setDraft(value || ""); setEditing(false); }}>
          <X className="w-3.5 h-3.5 mr-1" /> Cancelar
        </Button>
      </div>
    </div>
  );
}

function DetailPanel({
  entry,
  onUpdate,
}: {
  entry: DevlogEntry;
  onUpdate: (patch: Partial<DevlogEntry>, logAction: string) => Promise<void>;
}) {
  const [chatOpen, setChatOpen] = useState(false);

  const handleSugestao = async (idx: number, aprovar: boolean) => {
    const list = (entry.proposto_pelo_agente || []).slice();
    const s = list[idx];
    if (!s) return;
    if (aprovar) {
      const patch: any = { [s.campo]: s.sugestao };
      list[idx] = { ...s, status: "aprovado" };
      patch.proposto_pelo_agente = list;
      await onUpdate(patch, `Aprovou sugestão do agente para ${s.campo}`);
    } else {
      list[idx] = { ...s, status: "descartado" };
      await onUpdate({ proposto_pelo_agente: list } as any, `Descartou sugestão do agente para ${s.campo}`);
    }
  };

  const sugestoesPendentes = (entry.proposto_pelo_agente || []).filter((s) => !s.status || s.status === "pendente");

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <h1 className="text-2xl font-serif font-semibold">{entry.titulo}</h1>
          <Select
            value={entry.status}
            onValueChange={(v) => onUpdate({ status: v }, `Alterou status para ${STATUS_LABEL[v] || v}`)}
          >
            <SelectTrigger className="w-44">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <StatusDot status={entry.status} />
                  {STATUS_LABEL[entry.status] || entry.status}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  <span className="flex items-center gap-2">
                    <StatusDot status={s} />
                    {STATUS_LABEL[s]}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {entry.vertical && (
          <p className="text-xs text-muted-foreground mt-1">vertical: {entry.vertical}</p>
        )}
      </div>

      {entry.descricao && (
        <div>
          <h3 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Descrição</h3>
          <p className="text-sm whitespace-pre-wrap">{entry.descricao}</p>
        </div>
      )}

      <div className="border-l-4 border-primary bg-primary/5 rounded-r-lg p-4">
        <h3 className="text-sm font-semibold mb-2 text-primary">Hipótese de melhoria</h3>
        <InlineEdit
          value={entry.hipotese}
          multiline
          label="hipótese"
          onSave={(v) => onUpdate({ hipotese: v }, "Editou hipótese")}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">Tabelas relacionadas</h4>
          <Chips items={entry.tabelas_relacionadas} color="#6b7280" />
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">Depende de</h4>
          <Chips items={entry.depende_de} color="#8b5cf6" />
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">Impacta</h4>
          <Chips items={entry.impacta} color="#f97316" />
        </div>
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">
            Acesso permitido {entry.modo_acesso && <span className="text-muted-foreground normal-case">· {entry.modo_acesso}</span>}
          </h4>
          <Chips items={entry.acesso_permitido} color="#22c55e" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Próximos passos</h3>
        <InlineEdit
          value={entry.proximos_passos}
          multiline
          label="próximos passos"
          onSave={(v) => onUpdate({ proximos_passos: v }, "Editou próximos passos")}
        />
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-1 text-muted-foreground uppercase tracking-wide">Última atualização</h3>
        <InlineEdit
          value={entry.ultima_atualizacao}
          label="última atualização"
          onSave={(v) => onUpdate({ ultima_atualizacao: v }, "Editou última atualização")}
        />
      </div>

      {entry.stack && entry.stack.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-1.5 text-muted-foreground uppercase">Stack</h4>
          <Chips items={entry.stack} color="#0ea5e9" />
        </div>
      )}

      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition">
          <ChevronDown className="w-4 h-4" />
          Histórico {entry.log_atividade && `(${entry.log_atividade.length})`}
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {(entry.log_atividade || [])
            .slice()
            .sort((a, b) => (b.data || "").localeCompare(a.data || ""))
            .map((l, i) => (
              <div key={i} className="text-xs border-l-2 border-border pl-3 py-1">
                <div className="text-muted-foreground">{l.data} · {l.autor}</div>
                <div>{l.acao}</div>
              </div>
            ))}
          {(!entry.log_atividade || entry.log_atividade.length === 0) && (
            <p className="text-xs text-muted-foreground">Sem registros.</p>
          )}
        </CollapsibleContent>
      </Collapsible>

      {entry.proposto_pelo_agente && entry.proposto_pelo_agente.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-semibold hover:text-primary transition">
            <ChevronDown className="w-4 h-4" />
            Sugestões do agente ({entry.proposto_pelo_agente.length}
            {sugestoesPendentes.length > 0 && ` · ${sugestoesPendentes.length} pendentes`})
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {entry.proposto_pelo_agente.map((s, i) => (
              <div key={i} className="border rounded-lg p-3 text-sm space-y-2">
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{s.data}</span>
                  <Badge variant="outline">{s.campo}</Badge>
                  {s.status && s.status !== "pendente" && (
                    <Badge variant="secondary">{s.status}</Badge>
                  )}
                </div>
                <div className="whitespace-pre-wrap">{s.sugestao}</div>
                {(!s.status || s.status === "pendente") && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleSugestao(i, true)}>Aprovar</Button>
                    <Button size="sm" variant="outline" onClick={() => handleSugestao(i, false)}>Descartar</Button>
                  </div>
                )}
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      <NotasSection
        notas={entry.notas || []}
        onAdd={async (texto) => {
          const nova: Nota = { data: new Date().toISOString().slice(0, 10), texto };
          const list = [...(entry.notas || []), nova];
          await onUpdate({ notas: list } as any, "Adicionou nota manual");
        }}
        onDelete={async (idx) => {
          const list = (entry.notas || []).filter((_, i) => i !== idx);
          await onUpdate({ notas: list } as any, "Removeu nota manual");
        }}
      />

      <div className="pt-4 border-t">
        {entry.agente_ativo && entry.agente_webhook ? (
          <Button onClick={() => setChatOpen(true)} className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Falar com o agente deste módulo
          </Button>
        ) : (
          <Button disabled title="Agente ainda não configurado" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Falar com o agente deste módulo
          </Button>
        )}
      </div>

      <AgentChat entry={entry} open={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}

function MapaTab({
  entries,
  onSelectEntry,
}: {
  entries: DevlogEntry[];
  onSelectEntry: (id: string) => void;
}) {
  const { nodes, edges } = useMemo(() => {
    const verticals = entries.filter((e) => e.tipo === "vertical");
    const others = entries.filter((e) => e.tipo !== "vertical");

    const nodes: Node[] = [];
    const verticalY: Record<string, number> = {};

    verticals.forEach((v, i) => {
      const key = v.modulo || v.id;
      verticalY[key] = i * 240;
      nodes.push({
        id: v.id,
        position: { x: 0, y: i * 240 },
        data: { label: v.titulo },
        style: {
          background: STATUS_COLOR[v.status] || "#9ca3af",
          color: "#fff",
          border: "none",
          borderRadius: 12,
          padding: 14,
          fontWeight: 600,
          width: 200,
        },
      });
    });

    const byVerticalCount: Record<string, number> = {};
    others.forEach((o) => {
      const vKey = o.vertical || "_orphan";
      byVerticalCount[vKey] = (byVerticalCount[vKey] || 0) + 1;
      const idx = byVerticalCount[vKey];
      const baseY = verticalY[vKey] ?? Object.keys(verticalY).length * 240 + 200;
      nodes.push({
        id: o.id,
        position: { x: 320 + ((idx - 1) % 3) * 240, y: baseY + Math.floor((idx - 1) / 3) * 110 },
        data: { label: o.titulo },
        style: {
          background: "#fff",
          color: "#111",
          border: `3px solid ${STATUS_COLOR[o.status] || "#9ca3af"}`,
          borderRadius: 10,
          padding: 10,
          width: 200,
          fontSize: 13,
        },
      });
    });

    const byModulo: Record<string, DevlogEntry> = {};
    entries.forEach((e) => {
      if (e.modulo) byModulo[e.modulo] = e;
    });

    const edges: Edge[] = [];
    // vertical -> modulo
    others.forEach((o) => {
      if (!o.vertical) return;
      const v = verticals.find((x) => x.modulo === o.vertical);
      if (v) {
        edges.push({
          id: `v-${v.id}-${o.id}`,
          source: v.id,
          target: o.id,
          style: { stroke: "#9ca3af" },
        });
      }
    });
    // depende_de & impacta (dashed)
    entries.forEach((e) => {
      (e.depende_de || []).forEach((dep) => {
        const tgt = byModulo[dep];
        if (tgt) {
          edges.push({
            id: `dep-${e.id}-${tgt.id}`,
            source: tgt.id,
            target: e.id,
            animated: false,
            style: { stroke: "#8b5cf6", strokeDasharray: "5 5" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#8b5cf6" },
          });
        }
      });
      (e.impacta || []).forEach((imp) => {
        const tgt = byModulo[imp];
        if (tgt) {
          edges.push({
            id: `imp-${e.id}-${tgt.id}`,
            source: e.id,
            target: tgt.id,
            style: { stroke: "#f97316", strokeDasharray: "5 5" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#f97316" },
          });
        }
      });
    });

    return { nodes, edges };
  }, [entries]);

  return (
    <div className="h-[calc(100vh-220px)] border rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={(_, n) => onSelectEntry(n.id)}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap pannable zoomable />
      </ReactFlow>
    </div>
  );
}

export default function AdminDashboard2() {
  const [entries, setEntries] = useState<DevlogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [perfilFilter, setPerfilFilter] = useState<string>("all");
  const [verticalFilter, setVerticalFilter] = useState<string>("all");
  const [acessoFilter, setAcessoFilter] = useState<string>("all");
  const [tab, setTab] = useState("ficha");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("portal_devlog" as any)
      .select("*")
      .order("tipo", { ascending: true })
      .order("titulo", { ascending: true });
    console.log("[AdminDashboard2] portal_devlog:", {
      count: data?.length ?? 0,
      error,
      perfisAmostra: (data || []).slice(0, 3).map((r: any) => ({ titulo: r.titulo, perfis: r.perfis })),
    });
    if (error) {
      toast({ title: "Erro ao carregar", description: error.message, variant: "destructive" });
    } else {
      setEntries((data || []) as any);
      if (!selectedId && data && data.length > 0) setSelectedId((data[0] as any).id);
    }
    setLoading(false);
  }, [selectedId]);


  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verticais = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => e.vertical && s.add(e.vertical));
    return Array.from(s);
  }, [entries]);

  const acessos = useMemo(() => {
    const s = new Set<string>();
    entries.forEach((e) => (e.acesso_permitido || []).forEach((a) => s.add(a)));
    return Array.from(s);
  }, [entries]);

  const PERFIS = ["Edson", "Marcos", "Marcelle", "Estoque"];

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (perfilFilter !== "all" && !(e.perfis || []).map((p) => p.toLowerCase()).includes(perfilFilter.toLowerCase())) return false;
      if (verticalFilter !== "all" && e.vertical !== verticalFilter) return false;
      if (acessoFilter !== "all" && !(e.acesso_permitido || []).includes(acessoFilter)) return false;
      return true;
    });
  }, [entries, perfilFilter, verticalFilter, acessoFilter]);

  const grouped = useMemo(() => {
    const g: Record<string, DevlogEntry[]> = {};
    TIPO_ORDER.forEach((t) => (g[t] = []));
    filtered.forEach((e) => {
      if (!g[e.tipo]) g[e.tipo] = [];
      g[e.tipo].push(e);
    });
    return g;
  }, [filtered]);

  const selected = entries.find((e) => e.id === selectedId) || null;

  const RECEPCIONISTA_DEVLOG_ID = "6d731f09-882a-4cd2-a844-dc08a6f26cc9";
  const recepcionistaEntry = entries.find((e) => e.id === RECEPCIONISTA_DEVLOG_ID) || null;

  const updateEntryById = async (id: string, patch: Partial<DevlogEntry>, logAction: string) => {
    const target = entries.find((e) => e.id === id);
    if (!target) return;
    const newLog: LogEntry[] = [
      ...(target.log_atividade || []),
      { data: new Date().toISOString(), autor: "admin", acao: logAction },
    ];
    const fullPatch: any = { ...patch, log_atividade: newLog };
    const { error } = await supabase
      .from("portal_devlog" as any)
      .update(fullPatch)
      .eq("id", id);
    if (error) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...fullPatch } : e)));
    toast({ title: "Salvo" });
  };

  const updateEntry = async (patch: Partial<DevlogEntry>, logAction: string) => {
    if (!selected) return;
    await updateEntryById(selected.id, patch, logAction);
  };

  const updateRecepcionistaNotas = async (notas: Nota[]) => {
    if (!recepcionistaEntry) {
      toast({ title: "Entrada do recepcionista não encontrada", variant: "destructive" });
      return;
    }
    await updateEntryById(recepcionistaEntry.id, { notas }, notas.length > (recepcionistaEntry.notas?.length || 0) ? "Adicionou nota no recepcionista" : "Removeu nota do recepcionista");
  };

  const attachProposta = async (moduloId: string, p: RecepProposta) => {
    const target = entries.find((e) => e.id === moduloId);
    if (!target) return;
    const nova: Sugestao = {
      data: new Date().toISOString().slice(0, 10),
      campo: p.campo,
      sugestao: p.proposta,
      justificativa: p.justificativa,
      status: "pendente",
      origem: "recepcionista",
    };
    const list = [...(target.proposto_pelo_agente || []), nova];
    const newLog: LogEntry[] = [
      ...(target.log_atividade || []),
      { data: new Date().toISOString(), autor: "recepcionista", acao: `Sugestão recebida para ${p.campo}` },
    ];
    const fullPatch: any = { proposto_pelo_agente: list, log_atividade: newLog };
    const { error } = await supabase
      .from("portal_devlog" as any)
      .update(fullPatch)
      .eq("id", moduloId);
    if (error) {
      toast({ title: "Erro ao anexar", description: error.message, variant: "destructive" });
      return;
    }
    setEntries((prev) => prev.map((e) => (e.id === moduloId ? { ...e, ...fullPatch } : e)));
    toast({ title: "Sugestão anexada" });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h1 className="text-3xl font-serif font-semibold">Dashboard 2.0</h1>
          <div className="flex items-center gap-2">
            <label htmlFor="perfil-filter" className="text-sm text-muted-foreground">Trabalhando como:</label>
            <Select value={perfilFilter} onValueChange={setPerfilFilter}>
              <SelectTrigger id="perfil-filter" className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Ver tudo</SelectItem>
                {PERFIS.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="ficha">Ficha</TabsTrigger>
            <TabsTrigger value="mapa">Mapa</TabsTrigger>
          </TabsList>

          <TabsContent value="ficha" className="mt-4">
            <RecepcionistaDev
              modulos={entries.map((e) => ({ id: e.id, titulo: e.titulo, modulo: e.modulo }))}
              verticais={verticais}
              onAttach={attachProposta}
              notas={recepcionistaEntry?.notas || []}
              onUpdateNotas={updateRecepcionistaNotas}
            />
            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
              <aside className="border rounded-lg bg-card overflow-hidden flex flex-col max-h-[calc(100vh-220px)]">
                <div className="p-3 border-b space-y-2">
                  <Select value={verticalFilter} onValueChange={setVerticalFilter}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Vertical" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas verticais</SelectItem>
                      {verticais.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={acessoFilter} onValueChange={setAcessoFilter}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Acesso" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos acessos</SelectItem>
                      {acessos.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="overflow-y-auto flex-1">
                  {loading && <p className="p-4 text-sm text-muted-foreground">Carregando...</p>}
                  {!loading && entries.length > 0 && filtered.length === 0 && (
                    <p className="p-4 text-xs text-muted-foreground italic">
                      Nenhum módulo corresponde aos filtros selecionados.
                    </p>
                  )}
                  {TIPO_ORDER.map((tipo) => {
                    const items = grouped[tipo] || [];
                    if (items.length === 0) return null;
                    return (
                      <div key={tipo} className="py-2">
                        <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          {TIPO_LABEL[tipo] || tipo}
                        </div>
                        {items.map((e) => {
                          const active = e.id === selectedId;
                          return (
                            <button
                              key={e.id}
                              onClick={() => setSelectedId(e.id)}
                              className={`w-full text-left px-3 py-2 flex items-start gap-2 transition border-l-2 ${
                                active
                                  ? "bg-primary/10 border-primary"
                                  : "border-transparent hover:bg-muted/50"
                              }`}
                            >
                              <StatusDot status={e.status} />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{e.titulo}</div>
                                <div className="text-[10px] text-muted-foreground truncate">
                                  {e.vertical || "—"} · {STATUS_LABEL[e.status] || e.status}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </aside>

              <main className="border rounded-lg bg-card p-6 overflow-y-auto max-h-[calc(100vh-220px)]">
                {selected ? (
                  <DetailPanel entry={selected} onUpdate={updateEntry} />
                ) : (
                  <p className="text-muted-foreground">Selecione um item à esquerda.</p>
                )}
              </main>
            </div>
          </TabsContent>

          <TabsContent value="mapa" className="mt-4">
            <MapaTab
              entries={entries}
              onSelectEntry={(id) => {
                setSelectedId(id);
                setTab("ficha");
              }}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
