// Overlays: revelação de objeto, level-up, diário, onboarding, porta cooperativa, revelação da porta.
import { useEffect, useState } from "react";
import { useRpg } from "./store";
import { rpg, store, STORAGE, translateError } from "./api";
import type { Skill } from "./types";

/* ---------- Object reveal (após entregar prova) ---------- */
export function ObjectRevealOverlay() {
  const { overlayObject, _clearOverlayObject } = useRpg();
  if (!overlayObject) return null;
  return (
    <div className="rpg-overlay">
      <div className="rpg-overlay-panel text-center">
        <div className="rpg-glyph-xl mb-3">{overlayObject.glyph || "✦"}</div>
        <div className="rpg-narration text-2xl mb-3">{overlayObject.nome}</div>
        <p className="rpg-narration text-base leading-relaxed mb-6 whitespace-pre-wrap">
          {overlayObject.narrativa}
        </p>
        <button className="rpg-btn rpg-btn-primary" onClick={_clearOverlayObject}>
          Guardar
        </button>
      </div>
    </div>
  );
}

/* ---------- Revelação (após porta acertada) ---------- */
export function RevelacaoOverlay() {
  const { overlayRevelacao, _clearOverlayRevelacao } = useRpg();
  if (!overlayRevelacao) return null;
  return (
    <div className="rpg-overlay">
      <div className="rpg-overlay-panel text-center">
        <div className="rpg-glyph-xl mb-3">🗝️</div>
        <div className="rpg-narration text-xl mb-3">A porta se abre</div>
        <p className="rpg-narration text-base leading-relaxed mb-6 whitespace-pre-wrap">
          {overlayRevelacao.texto}
        </p>
        <button className="rpg-btn rpg-btn-primary" onClick={_clearOverlayRevelacao}>
          Prosseguir
        </button>
      </div>
    </div>
  );
}

/* ---------- Level up ---------- */
export function LevelUpOverlay() {
  const { cena, playerId, refreshCena, toast, getSkill } = useRpg();
  const lvl = cena?.level_up;
  if (!lvl) return null;
  const classe = cena?.eu?.classe;

  async function escolher(name: string) {
    if (!playerId) return;
    const d = await rpg<any>("escolher_skill", { p_player_id: playerId, p_skill: name });
    if (d?.ok === false) return toast(translateError(d.erro), "error");
    await refreshCena();
  }

  return (
    <div className="rpg-overlay">
      <div className="rpg-overlay-panel">
        <div className="text-center mb-4">
          <div className="rpg-glyph-lg">✨</div>
          <div className="rpg-narration text-2xl">Você subiu ao nível {lvl.level}!</div>
          <div className="rpg-system text-xs opacity-70">
            Escolha uma skill ({lvl.picks_pendentes} restante{lvl.picks_pendentes === 1 ? "" : "s"})
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
          {(lvl.opcoes ?? []).map((s: Skill) => {
            const arv = classe ? getSkill(classe, s.name) : undefined;
            const desc = arv?.descricao || s.descricao;
            const alc = arv?.alcance || s.alcance || (s as any).effect?.alcance;
            return (
              <button key={s.name} className="rpg-card p-3 text-left" onClick={() => escolher(s.name)}>
                <div className="flex justify-between items-baseline">
                  <span className="rpg-narration text-lg">{s.name}</span>
                  <span className="rpg-badge">{s.type}</span>
                </div>
                <div className="rpg-system text-[11px] opacity-70 mt-0.5">
                  {alc && `${alc}`}
                  {s.mana_cost != null && ` · ${s.mana_cost}MP`}
                </div>
                {desc && <div className="rpg-narration text-sm mt-1">{desc}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ---------- Diário ---------- */
export function JournalOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { playerId } = useRpg();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    if (!open || !playerId) return;
    (async () => {
      try {
        const d = await rpg<any>("diario", { p_player_id: playerId });
        setData(d);
      } catch {}
    })();
  }, [open, playerId]);

  if (!open) return null;
  return (
    <div className="rpg-overlay" onClick={onClose}>
      <div className="rpg-overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="rpg-narration text-2xl">Diário</h2>
          <button className="rpg-btn rpg-btn-ghost !p-1" onClick={onClose}>✕</button>
        </div>
        {!data && <div className="rpg-system text-xs opacity-60">Carregando…</div>}
        {data && (
          <div className="space-y-4">
            {data.titulo && <div className="rpg-narration text-xl">{data.titulo}</div>}
            {data.misterio_desc && <p className="rpg-narration text-sm">{data.misterio_desc}</p>}

            {Array.isArray(data.camadas) && data.camadas.length > 0 && (
              <div>
                <div className="rpg-system text-xs opacity-70 mb-1">Camadas</div>
                <ol className="list-decimal ml-5 space-y-1 text-sm">
                  {data.camadas.map((c: any, i: number) => (
                    <li key={i} className="rpg-narration">{typeof c === "string" ? c : c.texto || c.titulo}</li>
                  ))}
                </ol>
              </div>
            )}

            {Array.isArray(data.pistas) && data.pistas.length > 0 && (
              <div>
                <div className="rpg-system text-xs opacity-70 mb-1">Pistas descobertas</div>
                <ul className="text-sm space-y-1">
                  {data.pistas.map((p: any, i: number) => (
                    <li key={i} className="rpg-narration">• {p.texto || p.pista || p.descricao || JSON.stringify(p)}</li>
                  ))}
                </ul>
              </div>
            )}

            {Array.isArray(data.objetos) && data.objetos.length > 0 && (
              <div>
                <div className="rpg-system text-xs opacity-70 mb-1">Objetos da Porta</div>
                <div className="grid grid-cols-3 gap-2">
                  {data.objetos.map((o: any, i: number) => (
                    <div key={i} className="rpg-card p-2 text-center">
                      <div className="rpg-glyph">{o.glyph || "✦"}</div>
                      <div className="text-xs mt-1">{o.nome}</div>
                      <div className="rpg-system text-[10px] opacity-70">{o.coletado ? "coletado" : "—"}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.revelacao && (
              <div className="rpg-card p-3">
                <div className="rpg-system text-xs opacity-70 mb-1">Revelação</div>
                <p className="rpg-narration text-sm whitespace-pre-wrap">{data.revelacao}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Porta cooperativa ---------- */
export function PortaPanel() {
  const { partyId, toast, refreshCena } = useRpg();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    if (!partyId) return;
    try {
      const r = await rpg<any>("estado_porta", { p_party_id: partyId });
      setD(r);
    } catch {}
  }
  useEffect(() => {
    load();
  }, [partyId]);

  if (!d?.ativa && !d?.objetos_detalhe) return null;
  const objs: any[] = d?.objetos_detalhe ?? [];

  async function colocar(ordem: number) {
    setLoading(true);
    const r = await rpg<any>("colocar_objeto_porta", { p_party_id: partyId, p_objeto_ordem: ordem });
    setLoading(false);
    if (r?.ok === false) toast(translateError(r.erro), "error");
    await load();
  }
  async function conferir() {
    setLoading(true);
    const r = await rpg<any>("conferir_porta", { p_party_id: partyId });
    setLoading(false);
    if (r?.ok === false) return toast(translateError(r.erro), "error");
    if (r?.acerto) toast("A porta se abre…", "success");
    else toast("Não… algo está fora do lugar.", "error");
    await load();
    await refreshCena();
  }

  return (
    <div className="rpg-card p-3">
      <div className="rpg-narration text-lg mb-2">Porta ancestral</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {objs.map((o: any) => (
          <button
            key={o.ordem}
            disabled={!o.coletado || o.na_porta || loading}
            onClick={() => colocar(o.ordem)}
            className="rpg-card p-2 text-center"
            style={{
              borderColor: o.na_porta ? "var(--gold)" : undefined,
              opacity: o.coletado ? 1 : 0.5,
            }}
          >
            <div className="rpg-glyph">{o.glyph || "◇"}</div>
            <div className="text-xs mt-1">{o.nome}</div>
            <div className="rpg-system text-[10px] opacity-70">
              {o.na_porta ? "na porta" : o.coletado ? "colocar" : "falta"}
            </div>
          </button>
        ))}
      </div>
      <button
        className="rpg-btn rpg-btn-primary w-full"
        disabled={!d?.pode_conferir || loading}
        onClick={conferir}
      >
        Conferir Porta
      </button>
    </div>
  );
}

/* ---------- Onboarding ---------- */
export function OnboardingOverlay() {
  const [show, setShow] = useState(() => !store.get(STORAGE.onboarding));
  if (!show) return null;
  return (
    <div className="rpg-overlay">
      <div className="rpg-overlay-panel">
        <div className="rpg-glyph-lg text-center mb-2">📜</div>
        <h2 className="rpg-narration text-2xl text-center mb-3">Bem-vindo à mesa</h2>
        <p className="rpg-narration text-sm mb-2">
          Você joga um herói num RPG por turnos narrado pelo Mestre. Cada cena mostra <b>evidências físicas</b> —
          quem monta o mistério é você. As conclusões vivem no seu <b>Diário</b>.
        </p>
        <p className="rpg-narration text-sm mb-2">
          A <b>Bússola</b> no topo mostra seu próximo passo. Sua barra de ações mostra o que pode fazer agora.
        </p>
        <p className="rpg-narration text-sm mb-4">
          Cada ação rola um <b>d20</b>. Nat 20 é especial, Nat 1 é erro crítico. Boa aventura.
        </p>
        <button
          className="rpg-btn rpg-btn-primary w-full"
          onClick={() => {
            store.set(STORAGE.onboarding, "1");
            setShow(false);
          }}
        >
          Começar
        </button>
      </div>
    </div>
  );
}
