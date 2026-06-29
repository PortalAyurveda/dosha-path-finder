// Chat OOC entre jogadores da mesa. SEPARADO da Cronica (que e o feed do JOGO).
// Painel flutuante recolhivel, disponivel em todas as fases.
import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useGame } from "./GameContext";
import { rpcChatMesa, rpcEnviarChat } from "./api";

type Msg = { quando: string; player_id: string; nome: string; classe?: string; mensagem: string };

export function ChatMesa() {
  const { player, estado } = useGame();
  const party_id = player?.party_id ?? estado?.party?.id ?? null;
  const meuId = player?.player_id ?? null;
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [unread, setUnread] = useState(0);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastCountRef = useRef(0);

  useEffect(() => {
    if (!party_id) return;
    let alive = true;
    const tick = async () => {
      const r = await rpcChatMesa(party_id);
      if (!alive) return;
      if (r.ok) {
        const raw: any = r.data;
        const arr: Msg[] = Array.isArray(raw) ? raw : (raw?.mensagens ?? raw?.itens ?? []);
        setMsgs(arr);
        if (!open && arr.length > lastCountRef.current) {
          setUnread((u) => u + (arr.length - lastCountRef.current));
        }
        lastCountRef.current = arr.length;
      }
    };
    tick();
    const id = window.setInterval(tick, 3000);
    return () => {
      alive = false;
      window.clearInterval(id);
    };
  }, [party_id, open]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      requestAnimationFrame(() => {
        if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
      });
    }
  }, [open, msgs.length]);

  if (!party_id) return null;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = texto.trim();
    if (!t || !meuId || enviando) return;
    setEnviando(true);
    const r = await rpcEnviarChat(meuId, t);
    setEnviando(false);
    if (r.ok) {
      setTexto("");
      const r2 = await rpcChatMesa(party_id);
      if (r2.ok) {
        const raw: any = r2.data;
        const arr: Msg[] = Array.isArray(raw) ? raw : (raw?.mensagens ?? raw?.itens ?? []);
        setMsgs(arr);
        lastCountRef.current = arr.length;
      }
    }
  };

  return (
    <div style={{ position: "fixed", right: 12, bottom: 12, zIndex: 60 }}>
      {open ? (
        <div
          className="rpg-card flex flex-col"
          style={{ width: 320, height: 420, boxShadow: "0 10px 30px rgba(0,0,0,0.25)" }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: "hsl(41 70% 50% / 0.3)" }}>
            <div className="text-sm font-semibold inline-flex items-center gap-2">
              <MessageCircle size={14} /> Chat da Mesa
            </div>
            <button className="rpg-ink-soft" onClick={() => setOpen(false)} aria-label="fechar">
              <X size={14} />
            </button>
          </div>
          <div className="px-3 py-1 text-[11px] rpg-ink-soft border-b" style={{ borderColor: "hsl(41 70% 50% / 0.2)" }}>
            Conversa entre jogadores (OOC). A narracao do jogo fica na Cronica.
          </div>
          <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
            {msgs.map((m, i) => {
              const isEu = m.player_id === meuId;
              return (
                <div key={i} className={`flex flex-col ${isEu ? "items-end" : "items-start"}`}>
                  <div className="text-[10px] rpg-ink-soft">
                    {m.nome}{m.classe ? ` · ${m.classe}` : ""}
                  </div>
                  <div
                    className="text-sm px-3 py-1 rounded mt-0.5 max-w-[85%]"
                    style={{ background: isEu ? "hsl(130 30% 28% / 0.18)" : "hsl(28 22% 30% / 0.12)" }}
                  >
                    {m.mensagem}
                  </div>
                </div>
              );
            })}
            {!msgs.length ? (
              <div className="rpg-ink-soft text-xs">Diga um "ola" pra mesa.</div>
            ) : null}
          </div>
          <form onSubmit={enviar} className="flex gap-1 p-2 border-t" style={{ borderColor: "hsl(41 70% 50% / 0.3)" }}>
            <input
              className="flex-1 px-2 py-1 text-sm"
              placeholder="Mensagem para a mesa..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              disabled={enviando}
            />
            <button type="submit" className="rpg-btn text-xs inline-flex items-center gap-1" disabled={enviando || !texto.trim()}>
              <Send size={12} />
            </button>
          </form>
        </div>
      ) : (
        <button
          className="rpg-btn rpg-btn-primary inline-flex items-center gap-2 relative"
          onClick={() => setOpen(true)}
        >
          <MessageCircle size={14} /> Chat da Mesa
          {unread > 0 ? (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-full"
              style={{ background: "hsl(348 70% 45%)", color: "#fff" }}
            >
              {unread}
            </span>
          ) : null}
        </button>
      )}
    </div>
  );
}
