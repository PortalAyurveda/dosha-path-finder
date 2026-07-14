import { useEffect, useState, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Send, Loader2, Lock } from "lucide-react";
import AkashaMessageContent from "@/components/akasha/AkashaMessageContent";
import { Link } from "react-router-dom";

// Tokens renovam no 1º dia de cada mês
const getNextResetLabel = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const dia = next.getDate();
  const mes = next.toLocaleDateString("pt-BR", { month: "long" });
  return `${dia} de ${mes}`;
};

const AKASHA_LOGO = "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/chat-ayurveda";

interface AkashaTabProps {
  idPublico: string;
  nome: string | null;
  doshaprincipal: string | null;
  imc: number | null;
  idade: number | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  conhecimentoAyurveda: string | null;
  email?: string | null;
  initialPergunta?: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

const formatBrazilTime = (value?: string | Date | null) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
};

const getNowBrazilTime = () => formatBrazilTime(new Date());

const mapN8nHistoryMessage = (message: any): ChatMessage | null => {
  const role = message?.type === "human"
    ? "user"
    : message?.type === "ai" || message?.type === "assistant"
      ? "assistant"
      : null;
  const content = typeof message?.content === "string" ? message.content.trim() : "";
  if (!role || !content) return null;
  return { role, content, time: formatBrazilTime(message?.data_hora ?? message?.timestamp ?? null) };
};

const mapDbHistoryMessage = (row: any): ChatMessage | null => {
  let parsed = row?.message;
  if (typeof parsed === "string") {
    try { parsed = JSON.parse(parsed); } catch { return null; }
  }
  if (!parsed || typeof parsed !== "object") return null;
  const role = parsed?.type === "human" ? "user" : parsed?.type === "ai" || parsed?.type === "assistant" ? "assistant" : null;
  const content = typeof parsed?.content === "string" ? parsed.content.trim() : "";
  if (!role || !content) return null;
  return { role, content, time: formatBrazilTime(row?.data_hora ?? null) };
};

const AkashaTab = ({
  idPublico, nome, doshaprincipal, imc, idade,
  vatascore, pittascore, kaphascore, agniPrincipal,
  conhecimentoAyurveda, email, initialPergunta,
}: AkashaTabProps) => {
  const { user, profile } = useUser();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState(initialPergunta || "");
  const [sending, setSending] = useState(false);
  const prefilledRef = useRef(false);
  useEffect(() => {
    if (initialPergunta && !prefilledRef.current) {
      prefilledRef.current = true;
      setInput(initialPergunta);
    }
  }, [initialPergunta]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const hasHydratedRef = useRef(false);

  const resolvedEmail = email || user?.email || `${idPublico}@visitante.com`;
  const resolvedNome = nome || profile?.nome || "Visitante";

  const cacheKey = ['akasha-history', resolvedEmail] as const;

  // Scroll only the chat container, never the page
  const scrollChatToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, sending, scrollChatToBottom]);

  // Load history via React Query — cached across tab switches
  const { data: cachedHistory, isLoading: loadingHistory } = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const sessionId = resolvedEmail;
      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_history", session_id: sessionId }),
        });
        const data = await response.json();
        const history = Array.isArray(data?.history)
          ? data.history.map(mapN8nHistoryMessage).filter((m: any): m is ChatMessage => Boolean(m))
          : [];
        if (history.length > 0) return history;

        const { data: dbHistory } = await supabase
          .from("chat_histories")
          .select("message, data_hora")
          .eq("session_id", sessionId)
          .order("data_hora", { ascending: false })
          .limit(2);

        if (dbHistory && dbHistory.length > 0) {
          const parsed = [...dbHistory].reverse().map(mapDbHistoryMessage).filter((m): m is ChatMessage => Boolean(m));
          if (parsed.length > 0) return parsed;
        }
        return [] as ChatMessage[];
      } catch (err) {
        console.error("Failed to load Akasha history:", err);
        return [] as ChatMessage[];
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Sync messages to query cache so they survive tab switches
  const updateCache = useCallback((msgs: ChatMessage[]) => {
    queryClient.setQueryData(cacheKey, msgs);
  }, [queryClient, resolvedEmail]);

  // Hydrate from cache on mount (instant if cached)
  useEffect(() => {
    if (cachedHistory === undefined) return;
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    if (cachedHistory.length > 0) {
      setMessages(cachedHistory);
    }
  }, [cachedHistory]);



  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const isPremium = profile?.is_premium === true;
    const tokens = profile?.tokens_akasha ?? 10;
    if (!isPremium && tokens <= 0) {
      const noTokenMsg: ChatMessage = {
        role: "assistant",
        content: "Seus tokens Akasha acabaram. Em breve esta funcionalidade estará disponível como serviço premium. 🙏",
        time: getNowBrazilTime(),
      };
      setMessages(prev => {
        const next = [...prev, noTokenMsg];
        updateCache(next);
        return next;
      });
      return;
    }

    const userMsg = input.trim();
    setInput("");
    const userChatMsg: ChatMessage = { role: "user", content: userMsg, time: getNowBrazilTime() };
    setMessages(prev => {
      const next = [...prev, userChatMsg];
      updateCache(next);
      return next;
    });
    setSending(true);

    try {
      if (user?.id && !isPremium) {
        await supabase
          .from("user_profiles")
          .update({ tokens_akasha: Math.max(tokens - 1, 0) } as any)
          .eq("id", user.id);
      }

      const payload = {
        message: userMsg,
        email: resolvedEmail,
        contactId: idPublico,
        nome: resolvedNome,
        dosha: doshaprincipal,
        imc,
        idade,
        scores: { vata: vatascore, pitta: pittascore, kapha: kaphascore, agni: agniPrincipal },
        nivelDeConhecimento: conhecimentoAyurveda,
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const botReply = data?.resposta || data?.output || data?.text || "Desculpe, não consegui processar sua mensagem.";

      const botMsg: ChatMessage = { role: "assistant", content: botReply, time: getNowBrazilTime() };
      setMessages(prev => {
        const next = [...prev, botMsg];
        updateCache(next);
        return next;
      });
    } catch {
      const errMsg: ChatMessage = { role: "assistant", content: "Erro ao conectar com a Akasha. Tente novamente.", time: getNowBrazilTime() };
      setMessages(prev => {
        const next = [...prev, errMsg];
        updateCache(next);
        return next;
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isPremium = profile?.is_premium === true;
  const tokens = profile?.tokens_akasha ?? 10;

  return (
    <div className="flex flex-col mt-2">
      {/* Messages - scrolls only inside this container */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto overscroll-contain space-y-3 pb-3 px-1 min-h-[50vh]">
        {/* Akasha Header - compacto */}
        <div className="flex items-center justify-center gap-2 pb-2 pt-1">
          <img src={AKASHA_LOGO} alt="Akasha IA" className="w-7 h-7 object-contain shrink-0" />
          <div className="flex flex-col leading-tight">
            <h2 className="font-serif text-sm font-bold text-akasha">Akasha IA</h2>
            <p className="text-[10px] text-muted-foreground/80">
              {isPremium ? "Conversas ilimitadas ✨" : tokens > 0 ? `${tokens} conversas restantes` : "Tokens esgotados"}
            </p>
          </div>
        </div>


        {loadingHistory && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-akasha" />
            <span className="ml-2 text-sm text-muted-foreground">Carregando...</span>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && (
              <img src={AKASHA_LOGO} alt="" className="w-7 h-7 rounded-full object-contain shrink-0 mt-1 bg-akasha/10 p-0.5" />
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary/20 text-foreground rounded-tr-sm"
                : "bg-akasha/10 text-foreground rounded-tl-sm"
            }`}>
              {msg.role === "user" ? (
                <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_p]:my-0">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-sm [&_li]:text-foreground [&_strong]:text-foreground">
                  <ReactMarkdown skipHtml>{msg.content}</ReactMarkdown>
                </div>
              )}
              {msg.time && (
                <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-right text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {msg.time}
                </p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-start gap-2">
            <img src={AKASHA_LOGO} alt="" className="w-7 h-7 rounded-full object-contain shrink-0 mt-1 bg-akasha/10 p-0.5" />
            <div className="bg-akasha/10 rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-akasha/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-akasha/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-akasha/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input ou bloqueio de tokens — sticky para nunca sumir no mobile */}
      <div
        className="sticky bottom-0 z-10 bg-background pt-2 pb-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        {(isPremium || tokens > 0) ? (
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg shadow-akasha/5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={(e) => {
                  // Garante que o input não fique escondido atrás do teclado no mobile
                  setTimeout(() => e.currentTarget?.scrollIntoView({ block: "nearest", behavior: "smooth" }), 200);
                }}
                placeholder="Pergunte sobre Ayurveda… ou escreva Portal para ajuda com links e acesso"
                disabled={sending}
                enterKeyHint="send"
                autoComplete="off"
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
                style={{ fontSize: "16px" }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="shrink-0 w-9 h-9 rounded-full bg-akasha text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
                aria-label="Enviar"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center px-2">
              Escreva <span className="font-medium">Portal</span> para ajuda com o site • escreva <span className="font-medium">Akasha</span> para voltar
            </p>
          </div>


        ) : (
          <div
            className="rounded-2xl border p-5 flex flex-col items-center text-center gap-3"
            style={{ backgroundColor: "#FFF5F5", borderColor: "#FFD1D1" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "#FF7676" }}
            >
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1">
              <p className="font-serif text-base font-bold" style={{ color: "#352F54" }}>
                Você usou suas 10 conversas deste mês
              </p>
              <p className="text-xs text-muted-foreground">
                Seus tokens renovam em <strong>{getNextResetLabel()}</strong>
              </p>
            </div>
            <Link
              to="/assinar"
              className="inline-block py-3 px-6 rounded-xl text-white font-medium text-sm transition-colors"
              style={{ backgroundColor: "#FF7676" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FF5A5A")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#FF7676")}
            >
              Comprar mais conversas →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default AkashaTab;