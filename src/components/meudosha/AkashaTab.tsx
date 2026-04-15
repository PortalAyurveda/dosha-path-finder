import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

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
  conhecimentoAyurveda, email,
}: AkashaTabProps) => {
  const { user, profile } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [initialSent, setInitialSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const resolvedEmail = email || user?.email || `${idPublico}@visitante.com`;
  const resolvedNome = nome || profile?.nome || "Visitante";

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Load history and check if first time
  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setLoadingHistory(true);
      setMessages([]);

      const sessionId = resolvedEmail;

      try {
        // Try webhook history first
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_history", session_id: sessionId }),
        });
        const data = await response.json();
        const history = Array.isArray(data?.history)
          ? data.history.map(mapN8nHistoryMessage).filter((m: any): m is ChatMessage => Boolean(m))
          : [];

        if (history.length > 0) {
          if (isMounted) setMessages(history);
          if (isMounted) setLoadingHistory(false);
          return;
        }

        // Fallback: check chat_histories table
        const { data: dbHistory } = await supabase
          .from("chat_histories")
          .select("message, data_hora")
          .eq("session_id", sessionId)
          .order("data_hora", { ascending: false })
          .limit(2);

        if (dbHistory && dbHistory.length > 0) {
          const parsed = [...dbHistory].reverse().map(mapDbHistoryMessage).filter((m): m is ChatMessage => Boolean(m));
          if (isMounted && parsed.length > 0) {
            setMessages(parsed);
            setLoadingHistory(false);
            return;
          }
        }

        // No history found — send initial message
        if (isMounted && !initialSent) {
          setInitialSent(true);
          await sendInitialMessage();
        }
      } catch (err) {
        console.error("Failed to load Akasha history:", err);
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    loadHistory();
    return () => { isMounted = false; };
  }, [resolvedEmail]);

  const sendInitialMessage = async () => {
    const doshaAgravado = doshaprincipal || "não identificado";
    const nomeDisplay = resolvedNome !== "Visitante" ? resolvedNome : "Visitante";
    const idadeText = idade ? `${idade} anos` : "idade não informada";
    const imcText = imc ? `IMC ${imc}` : "IMC não informado";

    const autoMessage = `Olá meu nome é ${nomeDisplay}. Acabei de chegar aqui e vim conhecer você. Meu dosha agravado é ${doshaAgravado}. Estou com ${idadeText} e ${imcText}. Vamos conversar??`;

    setSending(true);
    setMessages([{ role: "user", content: autoMessage, time: getNowBrazilTime() }]);

    try {
      // Decrement token
      if (user?.id) {
        await supabase
          .from("user_profiles")
          .update({ tokens_akasha: Math.max((profile?.tokens_akasha ?? 10) - 1, 0) } as any)
          .eq("id", user.id);
      }

      const payload = {
        message: autoMessage,
        email: resolvedEmail,
        contactId: idPublico,
        nome: resolvedNome,
        dosha: doshaprincipal,
        imc,
        scores: { vata: vatascore, pitta: pittascore, kapha: kaphascore, agni: agniPrincipal },
        nivelDeConhecimento: conhecimentoAyurveda,
      };

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      const botReply = data?.resposta || data?.output || data?.text || "Olá! Bem-vindo(a). Como posso te ajudar?";

      setMessages(prev => [...prev, { role: "assistant", content: botReply, time: getNowBrazilTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar com a Akasha. Tente novamente.", time: getNowBrazilTime() }]);
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    // Check tokens
    const tokens = profile?.tokens_akasha ?? 10;
    if (tokens <= 0) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Seus tokens Akasha acabaram. Em breve esta funcionalidade estará disponível como serviço premium. 🙏",
        time: getNowBrazilTime(),
      }]);
      return;
    }

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg, time: getNowBrazilTime() }]);
    setSending(true);

    try {
      // Decrement token
      if (user?.id) {
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

      setMessages(prev => [...prev, { role: "assistant", content: botReply, time: getNowBrazilTime() }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar com a Akasha. Tente novamente.", time: getNowBrazilTime() }]);
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

  const tokens = profile?.tokens_akasha ?? 10;

  return (
    <div className="flex flex-col mt-4" style={{ minHeight: "50vh" }}>
      {/* Header */}
      <div className="flex flex-col items-center gap-2 pb-4">
        <img src={AKASHA_LOGO} alt="Akasha IA" className="w-12 h-12 object-contain" />
        <h2 className="font-serif text-lg font-bold text-akasha">Akasha IA</h2>
        <p className="text-xs text-muted-foreground">
          {tokens > 0 ? `${tokens} conversas restantes` : "Tokens esgotados"}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-1 max-h-[50vh]">
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
                <p className="whitespace-pre-wrap">{msg.content}</p>
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
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="pt-2 pb-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg shadow-akasha/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tokens > 0 ? "Pergunte à Akasha..." : "Tokens esgotados"}
            disabled={sending || tokens <= 0}
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || tokens <= 0}
            className="shrink-0 w-9 h-9 rounded-full bg-akasha text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AkashaTab;
