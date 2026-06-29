// Root do modulo RPG: monta provider, escolhe a tela pelo modo.
import { Helmet } from "react-helmet-async";
import { GameProvider, useGame } from "./GameContext";
import { LobbyFlow } from "./screens/Lobby";
import { City, Combat, Defeat, Exploration, Quest } from "./screens/Game";
import { ChatMesa } from "./ChatMesa";

function Switcher() {
  const { estado, mode, player } = useGame();
  // sem player ou ainda no lobby
  if (!player || !estado || mode === "lobby" || mode === null) {
    return <LobbyFlow />;
  }
  switch (mode) {
    case "exploracao":
      return <Exploration />;
    case "cidade":
      return <City />;
    case "quest":
      return <Quest />;
    case "combate":
      return <Combat />;
    case "derrota":
      return <Defeat />;
    default:
      return <Exploration />;
  }
}

export default function RpgApp() {
  return (
    <div data-rpg-theme className="min-h-screen">
      <Helmet>
        <title>Aventura · Portal Ayurveda</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=EB+Garamond:ital,wght@0,400;0,600;1,400&display=swap"
          rel="stylesheet"
        />
      </Helmet>
      <main className="max-w-5xl mx-auto px-3 md:px-6 py-4 md:py-8">
        <GameProvider>
          <Switcher />
          <ChatMesa />
        </GameProvider>
      </main>
    </div>
  );
}
