// Componentes visuais reaproveitados pelo modulo RPG.
import { useEffect, useState } from "react";
import { Backpack, Castle, Coins, Crown, Droplet, Footprints, Heart, Loader2, Lock, Moon, Skull, Sun, Tent, X } from "lucide-react";
import { rpcDesequipar, rpcEquipar, rpcInventario } from "./api";
import { useGame } from "./GameContext";

// ----- EntityIcon: emoji por dominio (mob/item/npc/lugar/cena) -----
type Dominio = "mob" | "item" | "npc" | "lugar" | "cena";

function emojiDe(dominio: Dominio, chave?: string | null): string {
  const k = (chave || "").toLowerCase();
  if (dominio === "mob") {
    if (/mortos?-?vivos?|esqueleto|zumbi/.test(k)) return "🧟";
    if (/espirito|fantasma/.test(k)) return "👻";
    if (/morcego|noturno/.test(k)) return "🦇";
    if (/animal|feral|lobo|urso|fera/.test(k)) return "🐺";
    if (/boss|chefe/.test(k)) return "💀";
    if (/caster|mago/.test(k)) return "🧙";
    if (/ranged|arqueiro/.test(k)) return "🏹";
    return "👹";
  }
  if (dominio === "item") {
    if (/arma|espada|adaga/.test(k)) return "⚔️";
    if (/elmo|capacete/.test(k)) return "🪖";
    if (/armadura|escudo|peitoral/.test(k)) return "🛡️";
    if (/bota|botas/.test(k)) return "🥾";
    if (/anel/.test(k)) return "💍";
    if (/colar|amuleto/.test(k)) return "📿";
    if (/cajado|varinha/.test(k)) return "🪄";
    if (/arco/.test(k)) return "🏹";
    return "🎒";
  }
  if (dominio === "lugar") {
    if (/taverna/.test(k)) return "🍺";
    if (/estalagem|pousada/.test(k)) return "🛏️";
    if (/loja|mercado/.test(k)) return "🏪";
    if (/ferreiro/.test(k)) return "🔨";
    if (/cidade|castelo/.test(k)) return "🏰";
    if (/viagem|trilha/.test(k)) return "🛤️";
    if (/acampamento/.test(k)) return "⛺";
    if (/caverna/.test(k)) return "🕳️";
    if (/rio|lago/.test(k)) return "🌊";
    return "📍";
  }
  if (dominio === "npc") {
    if (/mercador/.test(k)) return "💰";
    if (/taverneir/.test(k)) return "🍺";
    if (/ferreiro/.test(k)) return "🔨";
    if (/guarda|soldado/.test(k)) return "💂";
    if (/anciao|sabio|sage|elder/.test(k)) return "🧙";
    if (/lider|rei|rainha/.test(k)) return "👑";
    return "🧑";
  }
  // cena
  if (/pista|clue/.test(k)) return "🔍";
  if (/encounter|combate/.test(k)) return "⚔️";
  if (/puzzle|enigma/.test(k)) return "🧩";
  if (/boss|chefe/.test(k)) return "💀";
  if (/evento/.test(k)) return "⚡";
  return "📜";
}

export function EntityIcon({ dominio, chave, label }: { dominio: Dominio; chave?: string | null; label?: string }) {
  const emoji = emojiDe(dominio, chave);
  return (
    <span className="inline-flex items-center gap-1">
      <span aria-hidden>*{emoji}</span>
      {label ? <span>{label}</span> : null}
    </span>
  );
}

// ----- Dice + Banda -----
export function BandBadge({ banda, total }: { banda?: string | null; total?: number }) {
  if (!banda) return null;
  const map: Record<string, { label: string; bg: string; fg: string; emoji: string }> = {
    critico_falha: { label: "Erro critico", bg: "hsl(348 55% 32%)", fg: "#fff", emoji: "💀" },
    fraca: { label: "Sucesso parcial", bg: "hsl(28 35% 30%)", fg: "#fff", emoji: "·" },
    mediana: { label: "Sucesso", bg: "hsl(130 30% 28%)", fg: "#fff", emoji: "✓" },
    forte: { label: "Sucesso forte", bg: "hsl(41 70% 50%)", fg: "#1a1208", emoji: "✦" },
    critico: { label: "Critico", bg: "hsl(41 90% 55%)", fg: "#1a1208", emoji: "⭐" },
  };
  const m = map[banda] ?? { label: banda, bg: "hsl(28 22% 30%)", fg: "#fff", emoji: "?" };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded"
      style={{ background: m.bg, color: m.fg }}
    >
      <span aria-hidden>{m.emoji}</span> {m.label}
      {typeof total === "number" ? <span className="opacity-80">({total})</span> : null}
    </span>
  );
}

export function Dice({ value }: { value?: number | null }) {
  if (typeof value !== "number") return null;
  return (
    <span
      className="inline-flex h-8 w-8 items-center justify-center rounded font-bold"
      style={{
        background: "hsl(38 60% 96%)",
        border: "2px solid hsl(41 70% 50%)",
        color: "hsl(28 35% 16%)",
        boxShadow: "inset 0 0 0 1px hsl(41 70% 50% / 0.3)",
      }}
      title="d20"
    >
      {value}
    </span>
  );
}

// ----- Hud + PartyBar -----
export function Hud() {
  const { estado } = useGame();
  const eu = estado?.eu;
  const relogio = estado?.relogio;
  const local = estado?.local;
  if (!eu) return null;
  return (
    <div className="rpg-card p-3 flex flex-wrap items-center gap-3 text-sm">
      <div className="flex flex-col">
        <span className="font-semibold">
          {eu.nome} <span className="rpg-ink-soft">· {eu.classe} · lv {eu.level ?? 1}</span>
        </span>
        <div className="flex items-center gap-3 mt-1">
          <span className="inline-flex items-center gap-1"><Heart size={14} className="rpg-wine"/> {eu.hp}/{eu.max_hp}</span>
          <span className="inline-flex items-center gap-1"><Droplet size={14} className="rpg-moss"/> {eu.mp}/{eu.max_mp}</span>
          <span className="inline-flex items-center gap-1"><Coins size={14} className="rpg-gold"/> {eu.gold ?? 0}</span>
        </div>
      </div>
      <div className="grow" />
      {local ? (
        <div className="text-right">
          <div className="text-xs rpg-ink-soft uppercase tracking-wider">{local.tipo}</div>
          <div className="font-semibold">
            <EntityIcon dominio="lugar" chave={local.tipo} label={local.nome} />
          </div>
        </div>
      ) : null}
      {relogio ? (
        <div className="flex items-center gap-1">
          {relogio.fase === "noite" ? <Moon size={16} /> : <Sun size={16} className="rpg-gold" />}
          <span className="text-xs">dia {relogio.dia} · {relogio.hora}h</span>
        </div>
      ) : null}
    </div>
  );
}

export function PartyBar() {
  const { estado } = useGame();
  const herois = estado?.party?.herois ?? [];
  const turno_de = estado?.party?.turno_de;
  if (!herois.length) return null;
  return (
    <div className="rpg-card p-2 flex flex-wrap gap-2">
      {herois.map((h: any) => {
        const isTurn = h.player_id === turno_de;
        return (
          <div
            key={h.player_id}
            className={`px-3 py-1 rounded text-xs ${isTurn ? "rpg-pulse" : ""}`}
            style={{
              border: "1px solid hsl(41 70% 50% / 0.4)",
              background: isTurn ? "hsl(41 70% 50% / 0.15)" : "hsl(38 60% 96%)",
              opacity: h.vivo === false ? 0.5 : 1,
            }}
          >
            <div className="font-semibold flex items-center gap-1">
              {isTurn ? <Crown size={12} className="rpg-gold" /> : null}
              {h.nome}
            </div>
            <div className="rpg-ink-soft">
              {h.classe} · <Heart size={10} className="inline" /> {h.hp}/{h.max_hp}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function NarrativaPainel() {
  const { lastNarrativa, lastResultado, estado, lastError } = useGame();
  const cenaTexto = estado?.cena?.texto || estado?.local?.descricao;
  return (
    <div className="rpg-card-scroll p-4 md:p-6">
      {lastError ? (
        <div className="mb-3 px-3 py-2 rounded text-sm" style={{ background: "hsl(348 55% 90%)", color: "hsl(348 55% 25%)" }}>
          {lastError}
        </div>
      ) : null}
      <div className="text-base md:text-lg leading-relaxed whitespace-pre-wrap">
        {lastNarrativa || cenaTexto || (
          <span className="rpg-ink-soft italic">A cena se desenrola...</span>
        )}
      </div>
      {lastResultado?.banda ? (
        <div className="mt-3 flex items-center gap-2">
          <Dice value={lastResultado.d20} />
          <BandBadge banda={lastResultado.banda} total={lastResultado.total} />
          {lastResultado.consequencia ? (
            <span className="text-xs rpg-ink-soft">{lastResultado.consequencia.tipo}: {String(lastResultado.consequencia.valor)}</span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ----- Ficha drawer -----
export function FichaButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="rpg-btn inline-flex items-center gap-1" onClick={() => setOpen(true)}>
        <Backpack size={16} /> Ficha
      </button>
      {open ? <FichaDrawer onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function FichaDrawer({ onClose }: { onClose: () => void }) {
  const { player, estado, refresh } = useGame();
  const [inv, setInv] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!player) return;
    rpcInventario(player.player_id).then((r) => r.ok && setInv(r.data));
  }, [player]);

  if (!player) return null;
  const eu = estado?.eu;

  const equip = async (id: string, equipado: boolean) => {
    setBusy(true);
    const r = equipado ? await rpcDesequipar(player.player_id, id) : await rpcEquipar(player.player_id, id);
    if (r.ok) {
      const inv2 = await rpcInventario(player.player_id);
      if (inv2.ok) setInv(inv2.data);
      await refresh();
    }
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ background: "hsl(28 35% 16% / 0.5)" }}>
      <div className="w-full max-w-md h-full overflow-y-auto p-4 md:p-6" style={{ background: "hsl(39 38% 92%)", color: "hsl(28 35% 16%)" }} data-rpg-theme>
        <div className="flex items-center justify-between mb-3">
          <h2 className="rpg-title text-xl">Ficha</h2>
          <button onClick={onClose} className="rpg-btn p-2"><X size={16} /></button>
        </div>
        {eu ? (
          <div className="rpg-card p-3 mb-3 text-sm">
            <div className="font-semibold">{eu.nome} · {eu.classe} · lv {eu.level ?? 1}</div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              {eu.attributes &&
                Object.entries(eu.attributes).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <span className="rpg-ink-soft uppercase text-xs">{k}</span>
                    <span>{String(v)}</span>
                  </div>
                ))}
            </div>
            <div className="rpg-divider" />
            <div className="text-xs rpg-ink-soft">HP {eu.hp}/{eu.max_hp} · MP {eu.mp}/{eu.max_mp} · Ouro {eu.gold ?? 0}</div>
          </div>
        ) : null}
        <h3 className="rpg-title text-base mb-2">Inventario</h3>
        {!inv ? (
          <div className="rpg-ink-soft text-sm flex items-center gap-2"><Loader2 size={14} className="animate-spin"/> carregando...</div>
        ) : (
          <ul className="space-y-2">
            {(inv.itens ?? []).map((it: any) => (
              <li key={it.instance_id} className="rpg-card p-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">
                    <EntityIcon dominio="item" chave={it.slot || it.nome} label={it.nome} />
                  </div>
                  <button
                    className={`rpg-btn text-xs ${it.equipado ? "rpg-btn-primary" : ""}`}
                    disabled={busy}
                    onClick={() => equip(it.instance_id, !!it.equipado)}
                  >
                    {it.equipado ? "Desequipar" : "Equipar"}
                  </button>
                </div>
                <div className="rpg-ink-soft text-xs mt-1">
                  {it.slot ? `slot: ${it.slot} · ` : ""}t{it.tier ?? "?"} · {it.rarity ?? "comum"}
                </div>
                {it.mods ? (
                  <div className="text-xs mt-1">
                    {Object.entries(it.mods)
                      .filter(([_, v]) => v)
                      .map(([k, v]) => `${k} ${v}`)
                      .join(" · ")}
                  </div>
                ) : null}
              </li>
            ))}
            {!inv.itens?.length ? <li className="rpg-ink-soft text-sm">Nada nas alforjas.</li> : null}
          </ul>
        )}
      </div>
    </div>
  );
}

// ----- iconzinhos de tipo de no (timeline) -----
export function NodeIcon({ tipo, locked, atual, limpo }: { tipo?: string; locked?: boolean; atual?: boolean; limpo?: boolean }) {
  const Cmp = tipo === "cidade" ? Castle : tipo === "acampamento" ? Tent : tipo === "quest" ? Skull : Footprints;
  const color = locked
    ? "hsl(28 22% 50%)"
    : atual
      ? "hsl(41 70% 50%)"
      : limpo
        ? "hsl(130 22% 50%)"
        : "hsl(348 55% 32%)";
  return (
    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${atual ? "rpg-pulse" : ""}`}
      style={{ background: "hsl(38 60% 96%)", border: `2px solid ${color}`, color }}>
      {locked ? <Lock size={14} /> : <Cmp size={16} />}
    </span>
  );
}
