import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { rpgSupabase } from "@/integrations/supabase/rpg-client";
import {
  Globe2, Skull, Crown, Sword, Users, ScrollText, LayoutDashboard,
  ChevronRight, ChevronDown, X, Loader2,
} from "lucide-react";

// ============================================================
// Tema dark fantasy local. Tudo confinado a esta página admin.
// ============================================================
const TIER_COLORS: Record<number, string> = {
  1: "bg-emerald-900/40 text-emerald-300 border-emerald-700/60",
  2: "bg-cyan-900/40 text-cyan-300 border-cyan-700/60",
  3: "bg-purple-900/40 text-purple-300 border-purple-700/60",
  4: "bg-amber-900/40 text-amber-300 border-amber-700/60",
  5: "bg-red-900/50 text-red-300 border-red-800/70",
};
const RARITY_COLOR: Record<string, string> = {
  inicial: "text-zinc-400",
  comum: "text-zinc-200",
  incomum: "text-emerald-400",
  raro: "text-blue-400",
  epico: "text-purple-400",
  épico: "text-purple-400",
  lendario: "text-amber-400",
  lendário: "text-amber-400",
};

type Section = "overview" | "world" | "monsters" | "bosses" | "items" | "npcs" | "devlog";

// ============================================================
// Helpers
// ============================================================
const Json = ({ value }: { value: unknown }) => {
  const [open, setOpen] = useState(false);
  if (value == null) return <span className="text-zinc-600 italic">null</span>;
  const str = JSON.stringify(value, null, 2);
  const short = str.length < 80;
  if (short) return <pre className="font-mono text-xs text-zinc-300 bg-zinc-950/60 px-2 py-1 rounded inline-block">{str}</pre>;
  return (
    <div className="my-2">
      <button onClick={() => setOpen((v) => !v)} className="text-xs text-amber-400 hover:text-amber-300 font-mono">
        {open ? "▼" : "▶"} {open ? "esconder" : "expandir"} JSON ({str.length} chars)
      </button>
      {open && (
        <pre className="font-mono text-xs text-zinc-300 bg-zinc-950/60 p-3 rounded mt-2 overflow-x-auto border border-zinc-800">
          {str}
        </pre>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="py-2 border-b border-zinc-800/70">
    <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">{label}</div>
    <div className="text-sm text-zinc-200 mt-0.5">{children}</div>
  </div>
);

const TierBadge = ({ tier }: { tier: number | null | undefined }) => (
  <span className={`inline-flex items-center justify-center w-7 h-6 text-xs font-bold rounded border ${TIER_COLORS[tier ?? 0] ?? "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
    {tier ?? "?"}
  </span>
);

// ============================================================
// Detail drawer
// ============================================================
const DetailDrawer = ({ open, onClose, title, record }: { open: boolean; onClose: () => void; title: string; record: Record<string, any> | null }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-black/60" />
      <div className="w-full max-w-xl bg-zinc-950 border-l border-zinc-800 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-zinc-950 border-b border-zinc-800 p-4 flex items-center justify-between z-10">
          <h2 className="font-serif text-lg text-amber-200">{title}</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4">
          {record &&
            Object.entries(record).map(([k, v]) => (
              <Field key={k} label={k}>
                {v === null || v === undefined ? (
                  <span className="text-zinc-600 italic">—</span>
                ) : typeof v === "object" ? (
                  <Json value={v} />
                ) : typeof v === "boolean" ? (
                  <span className={v ? "text-emerald-400" : "text-zinc-500"}>{String(v)}</span>
                ) : (
                  <span className="whitespace-pre-wrap break-words">{String(v)}</span>
                )}
              </Field>
            ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// Hooks de dados
// ============================================================
function useRpgTable<T = any>(table: string, filters?: (q: any) => any) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let q: any = (rpgSupabase as any).from(table).select("*");
    if (filters) q = filters(q);
    q.then(({ data, error }: any) => {
      if (cancelled) return;
      if (error) setError(error.message);
      else setData((data ?? []) as T[]);
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table]);

  return { data, loading, error };
}

// ============================================================
// SECTION: Overview
// ============================================================
const TABLES_FOR_COUNT = [
  "campaigns", "biomes", "cities", "npcs", "quests", "rooms",
  "item_templates", "devlog",
];

const OverviewSection = () => {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const out: Record<string, number> = {};
      await Promise.all(TABLES_FOR_COUNT.map(async (t) => {
        const { count } = await (rpgSupabase as any).from(t).select("*", { count: "exact", head: true });
        out[t] = count ?? 0;
      }));
      const { count: monstersCount } = await (rpgSupabase as any)
        .from("monster_templates").select("*", { count: "exact", head: true }).neq("type", "boss");
      const { count: bossesCount } = await (rpgSupabase as any)
        .from("monster_templates").select("*", { count: "exact", head: true }).eq("type", "boss");
      out.monstros = monstersCount ?? 0;
      out.bosses = bossesCount ?? 0;
      setCounts(out);
      setLoading(false);
    })();
  }, []);

  const cards = [
    ["campaigns", "Campanhas"], ["biomes", "Biomas"], ["cities", "Cidades"],
    ["npcs", "NPCs"], ["quests", "Quests"], ["rooms", "Salas"],
    ["monstros", "Monstros"], ["bosses", "Bosses"],
    ["item_templates", "Itens"], ["devlog", "Devlog"],
  ] as const;

  return (
    <div>
      <div className="mb-6 p-3 rounded border border-amber-900/40 bg-amber-950/20 text-sm text-amber-200/90">
        O banco contém duas gerações empilhadas; os números podem aparecer duplicados (ex.: 2 biomas). Mostrado como está, sem deduplicar.
      </div>
      {loading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {cards.map(([key, label]) => (
            <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500 font-mono">{label}</div>
              <div className="text-3xl font-serif text-amber-200 mt-1">{counts[key] ?? 0}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================================
// SECTION: World (tree)
// ============================================================
const TreeNode = ({ label, badge, children, defaultOpen = false, onOpenDetail }:
  { label: React.ReactNode; badge?: React.ReactNode; children?: React.ReactNode; defaultOpen?: boolean; onOpenDetail?: () => void }) => {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children;
  return (
    <div className="relative pl-4 border-l border-zinc-800">
      <div className="flex items-center gap-2 py-1.5 -ml-[1px]">
        {hasChildren ? (
          <button onClick={() => setOpen(!open)} className="text-zinc-500 hover:text-amber-300">
            {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : <span className="w-4 inline-block" />}
        <button onClick={onOpenDetail} className="text-left text-sm text-zinc-200 hover:text-amber-300 flex-1">
          {label}
        </button>
        {badge}
      </div>
      {open && hasChildren && <div className="ml-2">{children}</div>}
    </div>
  );
};

const WorldSection = ({ openDetail }: { openDetail: (title: string, rec: any) => void }) => {
  const [campaign, setCampaign] = useState<any>(null);
  const [biomes, setBiomes] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [npcs, setNpcs] = useState<any[]>([]);
  const [quests, setQuests] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: camps } = await (rpgSupabase as any).from("campaigns").select("*").eq("status", "active").limit(1);
      const c = camps?.[0] ?? null;
      setCampaign(c);
      if (c) {
        const [{ data: b }, { data: ci }, { data: n }, { data: q }, { data: r }] = await Promise.all([
          (rpgSupabase as any).from("biomes").select("*").eq("campaign_id", c.id),
          (rpgSupabase as any).from("cities").select("*").order("ordem", { ascending: true }),
          (rpgSupabase as any).from("npcs").select("*"),
          (rpgSupabase as any).from("quests").select("*").eq("campaign_id", c.id).order("sequence_order", { ascending: true }),
          (rpgSupabase as any).from("rooms").select("*").order("ordem", { ascending: true }),
        ]);
        setBiomes(b ?? []); setCities(ci ?? []); setNpcs(n ?? []); setQuests(q ?? []); setRooms(r ?? []);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />;
  if (!campaign) return <p className="text-zinc-500">Nenhuma campanha ativa.</p>;

  return (
    <div className="font-mono text-sm">
      <TreeNode
        defaultOpen
        label={<><span className="text-amber-300">⚔ Campanha:</span> <span className="text-zinc-100">{campaign.name}</span></>}
        onOpenDetail={() => openDetail(`Campanha: ${campaign.name}`, campaign)}
      >
        {biomes.map((b) => (
          <TreeNode
            key={b.id}
            defaultOpen
            label={<><span className="text-emerald-400">🌍 Bioma:</span> <span className="text-zinc-100">{b.name}</span></>}
            onOpenDetail={() => openDetail(`Bioma: ${b.name}`, b)}
          >
            {cities.filter((c) => c.biome_id === b.id).map((city) => {
              const cityNpcs = npcs.filter((n) => n.city_id === city.id);
              const cityQuests = quests.filter((q) => q.city_id === city.id);
              return (
                <TreeNode
                  key={city.id}
                  label={<><span className="text-cyan-400">🏰 Cidade [ato {city.ordem ?? "?"}]:</span> <span className="text-zinc-100">{city.name}</span></>}
                  onOpenDetail={() => openDetail(`Cidade: ${city.name}`, city)}
                >
                  {cityNpcs.length > 0 && (
                    <TreeNode label={<span className="text-zinc-400">NPCs ({cityNpcs.length})</span>}>
                      {cityNpcs.map((n) => (
                        <TreeNode
                          key={n.id}
                          label={<><span className="text-purple-300">👤</span> <span className="text-zinc-200">{n.name}</span> <span className="text-zinc-500 text-xs">— {n.role}</span></>}
                          onOpenDetail={() => openDetail(`NPC: ${n.name}`, n)}
                        />
                      ))}
                    </TreeNode>
                  )}
                  {cityQuests.map((q) => {
                    const questRooms = rooms.filter((r) => r.quest_id === q.id);
                    return (
                      <TreeNode
                        key={q.id}
                        label={<><span className="text-amber-300">⚑ Quest #{q.sequence_order ?? "?"}:</span> <span className="text-zinc-100">{q.name}</span></>}
                        onOpenDetail={() => openDetail(`Quest: ${q.name}`, q)}
                      >
                        {questRooms.map((r) => (
                          <TreeNode
                            key={r.id}
                            label={
                              <>
                                <span className="text-zinc-500">🚪 Sala {r.ordem}:</span>{" "}
                                <span className="text-zinc-100">{r.name}</span>
                              </>
                            }
                            badge={
                              <span className="flex items-center gap-1">
                                <span className="text-xs px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                                  {r.n_monstros ?? 0} mob
                                </span>
                                {r.tem_boss && (
                                  <span className="text-xs px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800">BOSS</span>
                                )}
                              </span>
                            }
                            onOpenDetail={() => openDetail(`Sala: ${r.name}`, r)}
                          />
                        ))}
                      </TreeNode>
                    );
                  })}
                </TreeNode>
              );
            })}
          </TreeNode>
        ))}
      </TreeNode>
    </div>
  );
};

// ============================================================
// SECTION: Monsters
// ============================================================
const MonstersSection = ({ openDetail }: { openDetail: (title: string, rec: any) => void }) => {
  const { data, loading } = useRpgTable<any>("monster_templates", (q) => q.neq("type", "boss").order("difficulty_tier", { ascending: true }));
  const [tier, setTier] = useState<number | "all">("all");
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => data.filter((m) =>
    (tier === "all" || m.difficulty_tier === tier) &&
    (!search || m.name?.toLowerCase().includes(search.toLowerCase()))
  ), [data, tier, search]);

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          placeholder="Buscar nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600"
        />
        <button onClick={() => setTier("all")} className={`text-xs px-2 py-1 rounded border ${tier === "all" ? "border-amber-600 text-amber-300" : "border-zinc-800 text-zinc-400"}`}>Todos</button>
        {[1, 2, 3, 4, 5].map((t) => (
          <button key={t} onClick={() => setTier(t)} className={`text-xs px-2 py-1 rounded border ${TIER_COLORS[t]} ${tier === t ? "ring-1 ring-offset-1 ring-offset-zinc-950 ring-amber-500" : "opacity-70"}`}>T{t}</button>
        ))}
      </div>
      {loading ? <Loader2 className="w-5 h-5 animate-spin text-zinc-500" /> : (
        <div className="rounded border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
              <tr><th className="text-left p-2">Nome</th><th className="text-left p-2">Tipo</th><th className="p-2">Tier</th><th className="text-left p-2">Pista</th><th className="text-left p-2">Resumo</th></tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} onClick={() => openDetail(`Monstro: ${m.name}`, m)} className="border-t border-zinc-800 hover:bg-zinc-900/50 cursor-pointer">
                  <td className="p-2 text-zinc-100">{m.name}</td>
                  <td className="p-2 text-zinc-400">{m.type}</td>
                  <td className="p-2 text-center"><TierBadge tier={m.difficulty_tier} /></td>
                  <td className="p-2 text-zinc-400 max-w-[200px] truncate">{m.clue}</td>
                  <td className="p-2 text-zinc-300 max-w-[400px] truncate">{m.resumo}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="p-4 text-zinc-500 text-sm">Nada encontrado.</p>}
        </div>
      )}
    </div>
  );
};

// ============================================================
// SECTION: Bosses
// ============================================================
const BossesSection = ({ openDetail }: { openDetail: (title: string, rec: any) => void }) => {
  const { data, loading } = useRpgTable<any>("monster_templates", (q) => q.eq("type", "boss"));
  const parsed = useMemo(() => {
    return data.map((b) => {
      const m = (b.clue ?? "").match(/\[(.*?)\]\s*ato\s*(\d+)/i);
      return { ...b, _tipoSer: m?.[1] ?? null, _ato: m ? parseInt(m[2], 10) : null };
    }).sort((a, b) => (a._ato ?? 99) - (b._ato ?? 99));
  }, [data]);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {parsed.map((b) => (
        <button key={b.id} onClick={() => openDetail(`Boss: ${b.name}`, b)} className="text-left rounded-lg border border-red-900/40 bg-gradient-to-br from-zinc-900 to-red-950/30 p-4 hover:border-red-700 transition">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex gap-2 text-xs mb-1">
                {b._ato != null && <span className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-300 border border-amber-800/60">Ato {b._ato}</span>}
                {b._tipoSer && <span className="px-1.5 py-0.5 rounded bg-purple-900/40 text-purple-300 border border-purple-800/60">{b._tipoSer}</span>}
              </div>
              <h3 className="font-serif text-lg text-red-200">{b.name}</h3>
            </div>
            <Skull className="w-5 h-5 text-red-400/70" />
          </div>
          {b.resumo && <p className="text-sm text-zinc-300 mt-2">{b.resumo}</p>}
          {b.description && <p className="text-xs text-zinc-500 mt-2 line-clamp-3">{b.description}</p>}
        </button>
      ))}
    </div>
  );
};

// ============================================================
// SECTION: Items
// ============================================================
const ItemsSection = ({ openDetail }: { openDetail: (title: string, rec: any) => void }) => {
  const { data, loading } = useRpgTable<any>("item_templates");
  const [mode, setMode] = useState<"matrix" | "table">("matrix");
  const [fClass, setFClass] = useState<string>("all");
  const [fSlot, setFSlot] = useState<string>("all");
  const [fTier, setFTier] = useState<string>("all");

  const classes = useMemo(() => Array.from(new Set(data.map((i) => i.class_restriction).filter(Boolean))), [data]);
  const slots = useMemo(() => Array.from(new Set(data.map((i) => i.slot).filter(Boolean))), [data]);
  const tiers = [0, 1, 2, 3, 4];

  const filtered = useMemo(() => data.filter((i) =>
    (fClass === "all" || i.class_restriction === fClass) &&
    (fSlot === "all" || i.slot === fSlot) &&
    (fTier === "all" || String(i.tier) === fTier)
  ), [data, fClass, fSlot, fTier]);

  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />;

  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap items-center">
        <button onClick={() => setMode("matrix")} className={`text-xs px-2 py-1 rounded border ${mode === "matrix" ? "border-amber-600 text-amber-300" : "border-zinc-800 text-zinc-400"}`}>Matriz</button>
        <button onClick={() => setMode("table")} className={`text-xs px-2 py-1 rounded border ${mode === "table" ? "border-amber-600 text-amber-300" : "border-zinc-800 text-zinc-400"}`}>Tabela</button>
        {mode === "table" && (
          <>
            <select value={fClass} onChange={(e) => setFClass(e.target.value)} className="text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300">
              <option value="all">classe: todas</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={fSlot} onChange={(e) => setFSlot(e.target.value)} className="text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300">
              <option value="all">slot: todos</option>
              {slots.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={fTier} onChange={(e) => setFTier(e.target.value)} className="text-xs bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-zinc-300">
              <option value="all">tier: todos</option>
              {tiers.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </>
        )}
      </div>

      {mode === "matrix" ? (
        <div className="space-y-6">
          {classes.map((cls) => (
            <div key={cls}>
              <h3 className="font-serif text-amber-200 text-lg mb-2">⚔ {cls}</h3>
              <div className="rounded border border-zinc-800 overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-zinc-900 text-zinc-500">
                    <tr>
                      <th className="text-left p-2">slot</th>
                      {tiers.map((t) => <th key={t} className="text-left p-2">tier {t}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot} className="border-t border-zinc-800">
                        <td className="p-2 text-zinc-400 font-mono">{slot}</td>
                        {tiers.map((t) => {
                          const cell = data.filter((i) => i.class_restriction === cls && i.slot === slot && i.tier === t);
                          return (
                            <td key={t} className="p-2 align-top">
                              {cell.length === 0 ? <span className="text-zinc-700">—</span> :
                                cell.map((i) => (
                                  <button key={i.id} onClick={() => openDetail(`Item: ${i.name}`, i)} className={`block text-left hover:underline ${RARITY_COLOR[i.rarity] ?? "text-zinc-300"}`}>
                                    {i.name}
                                  </button>
                                ))
                              }
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
              <tr><th className="text-left p-2">Nome</th><th className="text-left p-2">Classe</th><th className="text-left p-2">Slot</th><th className="p-2">Tier</th><th className="text-left p-2">Raridade</th><th className="text-left p-2">Resumo</th></tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i.id} onClick={() => openDetail(`Item: ${i.name}`, i)} className="border-t border-zinc-800 hover:bg-zinc-900/50 cursor-pointer">
                  <td className={`p-2 ${RARITY_COLOR[i.rarity] ?? "text-zinc-200"}`}>{i.name}</td>
                  <td className="p-2 text-zinc-400">{i.class_restriction}</td>
                  <td className="p-2 text-zinc-400">{i.slot}</td>
                  <td className="p-2 text-center text-zinc-300">{i.tier}</td>
                  <td className="p-2 text-zinc-400">{i.rarity}</td>
                  <td className="p-2 text-zinc-400 truncate max-w-[300px]">{i.resumo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SECTION: NPCs
// ============================================================
const NpcsSection = ({ openDetail }: { openDetail: (title: string, rec: any) => void }) => {
  const { data: npcs, loading: l1 } = useRpgTable<any>("npcs");
  const { data: cities, loading: l2 } = useRpgTable<any>("cities");
  if (l1 || l2) return <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />;
  const grouped = cities.map((c) => ({ city: c, items: npcs.filter((n) => n.city_id === c.id) })).filter((g) => g.items.length > 0);
  return (
    <div className="space-y-6">
      {grouped.map(({ city, items }) => (
        <div key={city.id}>
          <h3 className="font-serif text-amber-200 text-lg mb-2">🏰 {city.name}</h3>
          <div className="rounded border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-zinc-900 text-zinc-400 text-xs uppercase">
                <tr><th className="text-left p-2">Nome</th><th className="text-left p-2">Papel</th><th className="text-left p-2">Resumo</th></tr>
              </thead>
              <tbody>
                {items.map((n) => (
                  <tr key={n.id} onClick={() => openDetail(`NPC: ${n.name}`, n)} className="border-t border-zinc-800 hover:bg-zinc-900/50 cursor-pointer">
                    <td className="p-2 text-zinc-100">{n.name}</td>
                    <td className="p-2 text-zinc-400">{n.role}</td>
                    <td className="p-2 text-zinc-300 truncate max-w-[500px]">{n.resumo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// SECTION: Devlog
// ============================================================
const TIPO_COLOR: Record<string, string> = {
  manifesto: "bg-purple-900/40 text-purple-300 border-purple-800",
  arquitetura: "bg-cyan-900/40 text-cyan-300 border-cyan-800",
  mecanica: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  conteudo: "bg-amber-900/40 text-amber-300 border-amber-800",
  infra: "bg-zinc-800 text-zinc-300 border-zinc-700",
  decisao: "bg-rose-900/40 text-rose-300 border-rose-800",
  tarefa: "bg-blue-900/40 text-blue-300 border-blue-800",
};
const STATUS_COLOR: Record<string, string> = {
  ideia: "bg-zinc-800 text-zinc-400 border-zinc-700",
  planejado: "bg-blue-900/40 text-blue-300 border-blue-800",
  em_andamento: "bg-amber-900/40 text-amber-300 border-amber-800",
  concluido: "bg-emerald-900/40 text-emerald-300 border-emerald-800",
  bloqueado: "bg-red-900/40 text-red-300 border-red-800",
};

const DevlogSection = () => {
  const { data, loading } = useRpgTable<any>("devlog", (q) => q.order("ordem", { ascending: true }));
  if (loading) return <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />;
  return (
    <div className="space-y-4 max-w-4xl">
      {data.map((d) => (
        <article key={d.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <header className="flex items-center gap-2 flex-wrap mb-2">
            <span className="font-mono text-xs text-zinc-500">#{d.ordem}</span>
            {d.tipo && <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${TIPO_COLOR[d.tipo] ?? "border-zinc-700 text-zinc-400"}`}>{d.tipo}</span>}
            {d.status && <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${STATUS_COLOR[d.status] ?? "border-zinc-700 text-zinc-400"}`}>{d.status}</span>}
            {d.modulo && <span className="text-xs text-zinc-400 font-mono">{d.modulo}{d.submodulo ? ` / ${d.submodulo}` : ""}</span>}
            {d.versao && <span className="text-xs text-zinc-600 ml-auto font-mono">v{d.versao}</span>}
          </header>
          <h3 className="font-serif text-lg text-amber-200 mb-2">{d.titulo}</h3>
          {d.descricao && <p className="text-sm text-zinc-300 whitespace-pre-wrap mb-2">{d.descricao}</p>}
          {d.hipotese && <div className="text-sm mb-2"><span className="text-zinc-500 text-xs uppercase font-mono">hipótese: </span><span className="text-zinc-300 italic">{d.hipotese}</span></div>}
          {d.proximos_passos && <div className="text-sm mb-2"><span className="text-zinc-500 text-xs uppercase font-mono">próximos passos: </span><span className="text-zinc-300">{d.proximos_passos}</span></div>}
          {Array.isArray(d.tags) && d.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {d.tags.map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">#{t}</span>)}
            </div>
          )}
          {Array.isArray(d.tabelas_relacionadas) && d.tabelas_relacionadas.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-2">
              {d.tabelas_relacionadas.map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-900 font-mono">{t}</span>)}
            </div>
          )}
          {d.decisoes && <div className="mt-2"><div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">decisões</div><Json value={d.decisoes} /></div>}
          {d.notas_tecnicas && <div className="mt-2"><div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">notas técnicas</div><Json value={d.notas_tecnicas} /></div>}
        </article>
      ))}
    </div>
  );
};

// ============================================================
// SHELL
// ============================================================
const SECTIONS: { id: Section; label: string; icon: any }[] = [
  { id: "overview", label: "Visão Geral", icon: LayoutDashboard },
  { id: "world", label: "Mundo", icon: Globe2 },
  { id: "monsters", label: "Monstros", icon: Sword },
  { id: "bosses", label: "Bosses", icon: Crown },
  { id: "items", label: "Itens", icon: Skull },
  { id: "npcs", label: "NPCs", icon: Users },
  { id: "devlog", label: "Devlog", icon: ScrollText },
];

const RpgAdmin = () => {
  const [section, setSection] = useState<Section>("overview");
  const [detail, setDetail] = useState<{ title: string; record: any } | null>(null);
  const openDetail = (title: string, record: any) => setDetail({ title, record });

  return (
    <>
      <Helmet><title>RPG — Admin</title></Helmet>
      <div className="min-h-screen bg-zinc-950 text-zinc-200 flex" style={{ fontFamily: "ui-sans-serif, system-ui" }}>
        <aside className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 sticky top-0 h-screen p-4">
          <h1 className="font-serif text-xl text-amber-300 mb-1" style={{ fontFamily: "ui-serif, Georgia, serif" }}>⚔ RPG Admin</h1>
          <p className="text-xs text-zinc-500 mb-6">somente leitura</p>
          <nav className="space-y-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = section === s.id;
              return (
                <button key={s.id} onClick={() => setSection(s.id)} className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition ${active ? "bg-amber-950/40 text-amber-200 border border-amber-900/40" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                  <Icon className="w-4 h-4" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6 overflow-x-hidden">
          <h2 className="font-serif text-2xl text-amber-200 mb-6" style={{ fontFamily: "ui-serif, Georgia, serif" }}>
            {SECTIONS.find((s) => s.id === section)?.label}
          </h2>
          {section === "overview" && <OverviewSection />}
          {section === "world" && <WorldSection openDetail={openDetail} />}
          {section === "monsters" && <MonstersSection openDetail={openDetail} />}
          {section === "bosses" && <BossesSection openDetail={openDetail} />}
          {section === "items" && <ItemsSection openDetail={openDetail} />}
          {section === "npcs" && <NpcsSection openDetail={openDetail} />}
          {section === "devlog" && <DevlogSection />}
        </main>

        <DetailDrawer open={!!detail} onClose={() => setDetail(null)} title={detail?.title ?? ""} record={detail?.record ?? null} />
      </div>
    </>
  );
};

export default RpgAdmin;
