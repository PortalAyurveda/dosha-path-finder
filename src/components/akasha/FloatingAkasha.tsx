import { useEffect, useState, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Send, Loader2, X, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Link } from "react-router-dom";

const AKASHA_LOGO = "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/chat-ayurveda";
const OPEN_KEY = "akasha-floating-open";

// Rotas onde o widget NÃO deve aparecer
const HIDDEN_PREFIXES = [
  "/meu-dosha",
  "/akasha",
  "/teste-de-dosha",
  "/assinar",
  "/auth",
];
const HIDDEN_INCLUDES = ["/obrigado"];

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

const FloatingAkasha = () => {
  const location = useLocation();
  const { user, profile, doshaResult } = useUser();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(OPEN_KEY) === "1";
  });
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const hasHydratedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resolvedEmail = user?.email || "visitante@portalayurveda.com";
  const resolvedNome = profile?.nome || doshaResult?.nome || (user ? "Você" : "Visitante");
  const idPublico = doshaResult?.idPublico || null;
  const doshaprincipal = doshaResult?.doshaprincipal || null;
  const vatascore = doshaResult?.vatascore ?? null;
  const pittascore = doshaResult?.pittascore ?? null;
  const kaphascore = doshaResult?.kaphascore ?? null;

  // Mesma cacheKey de AkashaTab → compartilha histórico instantaneamente
  const cacheKey = ["akasha-history", resolvedEmail] as const;

  const shouldHide = HIDDEN_PREFIXES.some((p) => location.pathname.startsWith(p))
    || HIDDEN_INCLUDES.some((p) => location.pathname.includes(p));

  useEffect(() => {
    try { localStorage.setItem(OPEN_KEY, open ? "1" : "0"); } catch {}
  }, [open]);

  const scrollChatToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        scrollChatToBottom();
        inputRef.current?.focus();
      });
    }
  }, [open, messages, sending, scrollChatToBottom]);

  const { data: cachedHistory, isLoading: loadingHistory } = useQuery({
    queryKey: cacheKey,
    enabled: open && !shouldHide,
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
          .limit(20);

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

  const updateCache = useCallback((msgs: ChatMessage[]) => {
    queryClient.setQueryData(cacheKey, msgs);
  }, [queryClient, resolvedEmail]);

  useEffect(() => {
    if (cachedHistory === undefined) return;
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    if (cachedHistory.length > 0) setMessages(cachedHistory);
  }, [cachedHistory]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    const isPremium = profile?.is_premium === true;
    const tokens = profile?.tokens_akasha ?? 10;
    if (user && !isPremium && tokens <= 0) {
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
        scores: { vata: vatascore, pitta: pittascore, kapha: kaphascore },
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

  if (shouldHide) return null;

  const isPremium = profile?.is_premium === true;
  const tokens = profile?.tokens_akasha ?? 10;
  const canChat = !user || isPremium || tokens > 0;

  return (
    <>
      {/* Janela flutuante */}
      <div
        className={`fixed z-[60] transition-all duration-200 origin-bottom-right ${
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"
        } bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] h-[70vh] sm:h-[560px] max-h-[640px] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden`}
        role="dialog"
        aria-label="Akasha IA"
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-border bg-akasha/5">
          <div className="flex items-center gap-2 min-w-0">
            <img src={AKASHA_LOGO} alt="" className="w-8 h-8 object-contain shrink-0" />
            <div className="flex flex-col leading-tight min-w-0">
              <h3 className="font-serif text-sm font-bold text-akasha truncate">Akasha IA</h3>
              <p className="text-[10px] text-muted-foreground truncate">
                {user
                  ? (isPremium ? "Conversas ilimitadas ✨" : `${tokens} conversas restantes`)
                  : "Faça login para conversas personalizadas"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="shrink-0 w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensagens */}
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto overscroll-contain space-y-3 px-3 py-3 bg-background">
          {loadingHistory && messages.length === 0 && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-akasha" />
            </div>
          )}

          {!loadingHistory && messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center px-4 py-6 gap-2">
              <img src={AKASHA_LOGO} alt="" className="w-12 h-12 object-contain" />
              <p className="font-serif text-sm font-bold text-akasha">Olá! Sou a Akasha</p>
              <p className="text-xs text-muted-foreground">
                {user
                  ? "Pergunte qualquer coisa sobre Ayurveda, seu dosha ou sua rotina."
                  : "Posso te ajudar com perguntas sobre Ayurveda. Para conversas personalizadas com seu dosha, faça o teste!"}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <img src={AKASHA_LOGO} alt="" className="w-6 h-6 rounded-full object-contain shrink-0 mt-1 bg-akasha/10 p-0.5" />
              )}
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary/20 text-foreground rounded-tr-sm"
                  : "bg-akasha/10 text-foreground rounded-tl-sm"
              }`}>
                {msg.role === "user" ? (
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_p]:my-1 [&_li]:text-sm [&_strong]:text-foreground">
                    <ReactMarkdown skipHtml>{msg.content}</ReactMarkdown>
                  </div>
                )}
                {msg.time && (
                  <p className={`mt-1 text-[10px] ${msg.role === "user" ? "text-right text-foreground/60" : "text-muted-foreground"}`}>
                    {msg.time}
                  </p>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex items-start gap-2">
              <img src={AKASHA_LOGO} alt="" className="w-6 h-6 rounded-full object-contain shrink-0 mt-1 bg-akasha/10 p-0.5" />
              <div className="bg-akasha/10 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-akasha/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-akasha/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-akasha/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-2 bg-background">
          {canChat ? (
            <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte à Akasha..."
                disabled={sending}
                enterKeyHint="send"
                autoComplete="off"
                className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
                style={{ fontSize: "16px" }}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="shrink-0 w-8 h-8 rounded-full bg-akasha text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90"
                aria-label="Enviar"
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </div>
          ) : (
            <Link
              to="/assinar"
              className="block text-center py-2.5 rounded-full bg-akasha text-white text-sm font-medium hover:opacity-90"
            >
              Conversas esgotadas — Assinar →
            </Link>
          )}
        </div>
      </div>

      {/* Botão flutuante */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] w-14 h-14 rounded-full bg-akasha shadow-xl shadow-akasha/30 flex items-center justify-center text-white hover:scale-105 transition-transform"
        aria-label={open ? "Fechar Akasha" : "Abrir Akasha"}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <img src={AKASHA_LOGO} alt="Akasha" className="w-8 h-8 object-contain" />
        )}
      </button>
    </>
  );
};

export default FloatingAkasha;
