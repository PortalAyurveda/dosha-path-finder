// Tela de combate (grid tático 3 fileiras) + barra de ações de combate.
import { useMemo, useState } from "react";
import { useRpg } from "./store";
import { UnitSprite } from "./components";
import type { CombatState, CombatUnit, Skill } from "./types";

// Alcance da arma básica por classe (o backend não devolve)
const ARMA_ALCANCE: Record<string, "curto" | "medio" | "longo"> = {
  guerreiro: "medio",
  arqueiro: "longo",
  mago: "medio",
};

const ALCANCE_DIST: Record<string, number> = { curto: 0, medio: 1, longo: 2 };

function alcanceEfetivo(alc: string | undefined, dist: number) {
  const max = ALCANCE_DIST[alc || "medio"] ?? 1;
  return dist <= max;
}

export function CombatStage() {
  const { cena } = useRpg();
  const combate: CombatState | undefined = cena?.combate;
  const herois = combate?.herois ?? [];
  const inimigos = combate?.inimigos ?? [];
  const turnoId = combate?.turno_heroi;

  return (
    <div className="h-full grid grid-cols-2 gap-2 p-2">
      <div className="flex flex-col justify-center gap-2">
        {[0, 1, 2].map((tile) => (
          <div key={`h${tile}`} className="rpg-tile justify-start">
            <span className="rpg-system text-[10px] opacity-50 mr-1">
              {tile === 0 ? "frente" : tile === 1 ? "meio" : "fundo"}
            </span>
            {herois
              .filter((u) => u.tile === tile)
              .map((u) => (
                <UnitSprite key={u.player_id} u={u} pulsing={u.player_id === turnoId} />
              ))}
          </div>
        ))}
      </div>
      <div className="flex flex-col justify-center gap-2">
        {[0, 1, 2].map((tile) => (
          <div key={`e${tile}`} className="rpg-tile justify-end">
            {inimigos
              .filter((u) => u.tile === tile && u.hp > 0)
              .map((u) => (
                <UnitSprite key={u.idx} u={u} large={u.is_boss || u.tamanho === "grande"} />
              ))}
            <span className="rpg-system text-[10px] opacity-50 ml-1">
              {tile === 0 ? "frente" : tile === 1 ? "meio" : "fundo"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CombatActions() {
  const { cena, acaoWebhook, getSkill } = useRpg();
  const combate: CombatState | undefined = cena?.combate;
  const skills: Skill[] = cena?.skills ?? [];
  const eu = combate?.herois?.find((h) => h.player_id === cena?.eu?.id);
  const meuTurno = combate?.turno_heroi === cena?.eu?.id;
  const cooldowns = cena?.eu?.cooldowns ?? {};
  const mp = cena?.eu?.mp ?? 0;
  const classe = cena?.eu?.classe;

  const [mode, setMode] = useState<null | { kind: "atacar" | "skill"; skill?: string; alcance?: string }>(null);
  const [moveMode, setMoveMode] = useState(false);

  const inimigosVivos = (combate?.inimigos ?? []).filter((e) => e.hp > 0);

  function distTo(alvo: CombatUnit) {
    return Math.abs((eu?.tile ?? 0) - (alvo.tile ?? 0));
  }

  const alcanceArma = ARMA_ALCANCE[classe || ""] || "medio";
  const inRangeArma = inimigosVivos.some((e) => alcanceEfetivo(alcanceArma, distTo(e)));

  if (!meuTurno) {
    const nome = cena?.party?.herois?.find((h) => h.player_id === combate?.turno_heroi)?.nome;
    return (
      <div className="rpg-system text-sm opacity-60 py-3">
        Aguarde {nome || "seu companheiro"}…
      </div>
    );
  }

  const alcanceAtual = mode?.kind === "skill" ? (mode.alcance || "medio") : alcanceArma;

  return (
    <div className="space-y-2">
      {mode || moveMode ? (
        <div>
          <div className="rpg-system text-xs opacity-70 mb-2">
            {moveMode ? "Escolha uma fileira" : `Escolha um alvo (${alcanceAtual})`}
          </div>
          <div className="flex gap-2">
            {moveMode
              ? [0, 1, 2].map((t) => (
                  <button
                    key={t}
                    className="rpg-btn"
                    disabled={t === eu?.tile}
                    onClick={async () => {
                      await acaoWebhook({ tipo: "combate", acao: { tipo: "mover", tile: t } });
                      setMoveMode(false);
                    }}
                  >
                    {t === 0 ? "Frente" : t === 1 ? "Meio" : "Fundo"}
                  </button>
                ))
              : inimigosVivos.map((e) => {
                  const ok = alcanceEfetivo(alcanceAtual, distTo(e));
                  return (
                    <button
                      key={e.idx}
                      className="rpg-btn"
                      disabled={!ok}
                      title={ok ? e.nome : "Fora de alcance — mova-se"}
                      onClick={async () => {
                        const acao: any =
                          mode!.kind === "skill"
                            ? { tipo: "atacar", metodo: "skill", skill: mode!.skill, alvo: e.idx }
                            : { tipo: "atacar", metodo: "arma", alvo: e.idx };
                        await acaoWebhook({ tipo: "combate", acao });
                        setMode(null);
                      }}
                    >
                      {e.glyph} {e.nome}
                    </button>
                  );
                })}
            <button
              className="rpg-btn rpg-btn-ghost"
              onClick={() => {
                setMode(null);
                setMoveMode(false);
              }}
            >
              cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2 items-start">
          <button
            className="rpg-btn rpg-btn-primary"
            disabled={!inRangeArma}
            title={inRangeArma ? "Atacar com arma" : "Fora de alcance — mova-se"}
            onClick={() => setMode({ kind: "atacar", alcance: alcanceArma })}
          >
            ⚔ Atacar
          </button>
          {skills.map((s) => {
            const cd = cooldowns[s.name] ?? 0;
            const cost = s.mana_cost ?? 0;
            const alc = s.alcance || (s as any).effect?.alcance;
            const arv = classe ? getSkill(classe, s.name) : undefined;
            const desc = arv?.descricao || s.descricao;
            const inRange = inimigosVivos.some((e) => alcanceEfetivo(alc, distTo(e)));
            const disabled = cd > 0 || mp < cost || !inRange;
            const tt =
              cd > 0
                ? `Recarga ${cd}`
                : mp < cost
                ? "Mana insuficiente"
                : !inRange
                ? "Fora de alcance"
                : desc || s.name;
            return (
              <button
                key={s.name}
                className="rpg-btn"
                disabled={disabled}
                title={tt}
                onClick={() => setMode({ kind: "skill", skill: s.name, alcance: alc })}
              >
                ✦ {s.name}
                <span className="rpg-system text-[10px] opacity-70 ml-1">
                  {cost ? `${cost}MP` : ""}
                  {alc ? ` · ${alc}` : ""}
                </span>
              </button>
            );
          })}
          <button className="rpg-btn" onClick={() => setMoveMode(true)}>
            ↔ Mover
          </button>
          <button
            className="rpg-btn"
            onClick={() => acaoWebhook({ tipo: "combate", acao: { tipo: "defender" } })}
          >
            🛡 Defender
          </button>
          <button
            className="rpg-btn"
            onClick={() => acaoWebhook({ tipo: "combate", acao: { tipo: "fugir" } })}
          >
            🏃 Fugir
          </button>
        </div>
      )}
    </div>
  );
}
