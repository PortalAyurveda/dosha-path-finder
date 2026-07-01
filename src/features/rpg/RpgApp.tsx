// Root do módulo RPG. Instala tema, provider, layout tela-cheia e roteia por modo.
import "@fontsource/cinzel/400.css";
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/medievalsharp/400.css";
import "@fontsource/special-elite/400.css";
import "./theme.css";

import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { RpgProvider, useRpg } from "./store";
import {
  Compass,
  HelpOverlay,
  NarrationLog,
  PartyList,
  RpgHeader,
  RpgToaster,
  Stage,
  StonePath,
} from "./components";
import {
  CityActions,
  CityStage,
  CreateCharacterScreen,
  ExplorationActions,
  ExplorationStage,
  LandingScreen,
  LobbyScreen,
  QuestActions,
  QuestStage,
} from "./screens";
import { CombatActions, CombatStage } from "./combat";
import {
  JournalOverlay,
  LevelUpOverlay,
  ObjectRevealOverlay,
  OnboardingOverlay,
  PortaPanel,
  RevelacaoOverlay,
} from "./overlays";

export default function RpgApp() {
  return (
    <>
      <Helmet>
        <title>RPG · Portal Ayurveda</title>
      </Helmet>
      <div data-rpg-root>
        <RpgProvider>
          <RpgShell />
        </RpgProvider>
      </div>
    </>
  );
}

function RpgShell() {
  const { playerId, partyId, cena, partyState } = useRpg();
  const [help, setHelp] = useState(false);
  const [journal, setJournal] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  // Sem player e sem party → landing
  if (!playerId && !partyId) {
    return (
      <div className="h-full w-full flex flex-col">
        <RpgHeader
          onOpenJournal={() => setJournal(true)}
          onOpenHelp={() => setHelp(true)}
          onToggleLeft={() => setLeftOpen((v) => !v)}
          onToggleRight={() => setRightOpen((v) => !v)}
        />
        <LandingScreen />
        <RpgToaster />
        {help && <HelpOverlay onClose={() => setHelp(false)} />}
      </div>
    );
  }

  // Tem party mas ainda não tem player → criação
  if (!playerId && partyId) {
    return (
      <div className="h-full w-full flex flex-col">
        <RpgHeader
          onOpenJournal={() => setJournal(true)}
          onOpenHelp={() => setHelp(true)}
          onToggleLeft={() => setLeftOpen((v) => !v)}
          onToggleRight={() => setRightOpen((v) => !v)}
        />
        <CreateCharacterScreen partyId={partyId} joinCode={undefined} />
        <RpgToaster />
        {help && <HelpOverlay onClose={() => setHelp(false)} />}
      </div>
    );
  }

  // In-game
  const modo = cena?.modo;
  const isLobby = modo === "lobby" || (!cena && partyState);

  return (
    <div className="h-full w-full flex flex-col">
      <RpgHeader
        onOpenJournal={() => setJournal(true)}
        onOpenHelp={() => setHelp(true)}
        onToggleLeft={() => setLeftOpen((v) => !v)}
        onToggleRight={() => setRightOpen((v) => !v)}
      />
      <Compass />

      <div className="flex-1 flex min-h-0 relative">
        {/* Left sidebar */}
        <aside
          className="hidden md:block w-72 shrink-0 border-r-2 rpg-panel-dark"
          style={{ borderColor: "var(--leather)", borderRight: "2px solid var(--leather)" }}
        >
          <PartyList />
        </aside>

        {/* Mobile drawers */}
        <aside className={`md:hidden rpg-drawer ${leftOpen ? "open" : ""}`}>
          <PartyList />
        </aside>
        <aside className={`md:hidden rpg-drawer right ${rightOpen ? "open" : ""}`}>
          <StonePath />
        </aside>

        {/* Main */}
        <main className="flex-1 flex flex-col min-h-0">
          {isLobby ? (
            <LobbyScreen />
          ) : modo === "derrota" ? (
            <DefeatScreen />
          ) : (
            <>
              <Stage>
                {modo === "combate" && <CombatStage />}
                {modo === "cidade" && <CityStage />}
                {modo === "quest" && <QuestStage />}
                {modo === "exploracao" && <ExplorationStage />}
                {!modo && (
                  <div className="h-full flex items-center justify-center rpg-system text-xs opacity-60">
                    carregando cena…
                  </div>
                )}
              </Stage>

              <NarrationLog />

              <div
                className="shrink-0 border-t-2 rpg-panel-dark px-4 py-3"
                style={{ borderColor: "var(--leather)", minHeight: 120 }}
              >
                {modo === "combate" && <CombatActions />}
                {modo === "cidade" && (
                  <div className="space-y-3">
                    <CityActions />
                    <PortaPanel />
                  </div>
                )}
                {modo === "quest" && <QuestActions />}
                {modo === "exploracao" && <ExplorationActions />}
              </div>
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside
          className="hidden md:block w-24 shrink-0 border-l-2 rpg-panel-dark"
          style={{ borderColor: "var(--leather)" }}
        >
          <StonePath />
        </aside>
      </div>

      <RpgToaster />
      <OnboardingOverlay />
      <ObjectRevealOverlay />
      <RevelacaoOverlay />
      <LevelUpOverlay />
      <JournalOverlay open={journal} onClose={() => setJournal(false)} />
      {help && <HelpOverlay onClose={() => setHelp(false)} />}
    </div>
  );
}

function DefeatScreen() {
  const { clearSession } = useRpg();
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="rpg-overlay-panel text-center">
        <div className="rpg-glyph-xl mb-3">💀</div>
        <div className="rpg-narration text-2xl mb-3">A party caiu</div>
        <p className="rpg-narration text-sm mb-4">O silêncio da caverna se fecha sobre vocês.</p>
        <button className="rpg-btn rpg-btn-primary" onClick={clearSession}>
          Nova aventura
        </button>
      </div>
    </div>
  );
}
