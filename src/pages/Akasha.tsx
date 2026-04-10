import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AKASHA_LOGO = "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/chat-ayurveda";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface UserContext {
  nome: string;
  email: string;
  doshaprincipal: string;
  imc: number | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string;
  conhecimentoAyurveda: string;
  contactId: string;
}

const Akasha = () => {
  const [searchParams] = useSearchParams();
  const idPublico = searchParams.get("id") || "";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [userCtx, setUserCtx] = useState<UserContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const shouldScrollRef = useRef(false);

  // Only scroll when we explicitly want to (new bot reply)
  useEffect(() => {
    if (shouldScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      shouldScrollRef.current = false;
    }
  }, [messages]);

  // 1. Load user context
  useEffect(() => {
    const loadContext = async () => {
      if (idPublico) {
        const { data } = await supabase
          .from("doshas_registros2")
          .select("nome, email, doshaprincipal, imc, vatascore, pittascore, kaphascore, agniPrincipal, conhecimentoAyurveda")
          .eq("idPublico", idPublico)
          .maybeSingle();

        if (data) {
          // Use idPublico as session_id always — email field may contain template strings
          setUserCtx({
            nome: data.nome || "Visitante",
            email: data.email && !data.email.includes("{{") ? data.email : `${idPublico}@visitante.com`,
            doshaprincipal: data.doshaprincipal || "Não informado",
            imc: data.imc,
            vatascore: data.vatascore,
            pittascore: data.pittascore,
            kaphascore: data.kaphascore,
            agniPrincipal: data.agniPrincipal || "Não informado",
            conhecimentoAyurveda: data.conhecimentoAyurveda || "Não informado",
            contactId: idPublico,
          });
          return;
        }
      }

      // Fallback: visitor
      let visitorId = localStorage.getItem("akasha_visitorId");
      if (!visitorId) {
        visitorId = `anon_${Math.random().toString(36).slice(2, 8)}`;
        localStorage.setItem("akasha_visitorId", visitorId);
      }
      setUserCtx({
        nome: "Visitante",
        email: `${visitorId}@visitante.com`,
        doshaprincipal: "Não informado",
        imc: null,
        vatascore: null,
        pittascore: null,
        kaphascore: null,
        agniPrincipal: "Não informado",
        conhecimentoAyurveda: "Não informado",
        contactId: visitorId,
      });
    };
    loadContext();
  }, [idPublico]);

  // 2. Load history ONLY after userCtx is ready
  useEffect(() => {
    if (!userCtx || !userCtx.contactId) return;

    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        // Always use contactId (idPublico) as session_id for consistency
        const sessionId = userCtx.contactId;

        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "get_history", session_id: sessionId }),
        });
        const data = await res.json();
        if (data?.history && Array.isArray(data.history) && data.history.length > 0) {
          const hist: ChatMessage[] = data.history.map((m: any) => ({
            role: m.type === "human" ? "user" as const : "assistant" as const,
            content: m.content,
          }));
          setMessages(hist);
        }
      } catch (e) {
        console.error("Failed to load history:", e);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [userCtx]);

  const sendMessage = async () => {
    if (!input.trim() || sending || !userCtx) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setSending(true);

    try {
      const payload = {
        message: userMsg,
        email: userCtx.email,
        contactId: userCtx.contactId,
        nome: userCtx.nome,
        dosha: userCtx.doshaprincipal,
        imc: userCtx.imc,
        scores: {
          vata: userCtx.vatascore,
          pitta: userCtx.pittascore,
          kapha: userCtx.kaphascore,
          agni: userCtx.agniPrincipal,
        },
        nivelDeConhecimento: userCtx.conhecimentoAyurveda,
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      const botReply = data?.resposta || data?.output || data?.text || "Desculpe, não consegui processar sua mensagem.";
      shouldScrollRef.current = true;
      setMessages(prev => [...prev, { role: "assistant", content: botReply }]);
    } catch (e) {
      shouldScrollRef.current = true;
      setMessages(prev => [...prev, { role: "assistant", content: "Erro ao conectar com a Akasha. Tente novamente." }]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const hasHistory = messages.length > 0 && !loadingHistory;

  return (
    <PageContainer title="Akasha IA — Ayurveda" description="Sua assistente pessoal de Ayurveda com inteligência artificial.">
      <div className="max-w-2xl mx-auto flex flex-col relative" style={{ minHeight: "calc(100vh - 200px)" }}>

        {/* Background watermark logo */}
        <div
          className="pointer-events-none fixed inset-0 flex items-center justify-center z-0"
          style={{ opacity: 0.06 }}
        >
          <img src={AKASHA_LOGO} alt="" className="w-72 h-72 md:w-96 md:h-96 object-contain" />
        </div>

        {/* Chat messages area */}
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-1 relative z-10">

          {/* Welcome — always visible at top */}
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <img src={AKASHA_LOGO} alt="Akasha IA" className="w-14 h-14 object-contain" />
            <h2 className="font-serif text-xl font-bold text-akasha">Akasha IA</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
              Olá{userCtx?.nome && userCtx.nome !== "Visitante" ? `, ${userCtx.nome}` : ""}! Sou a Akasha, sua guia de Ayurveda. Pergunte-me sobre alimentação, rotinas, doshas e mais.
            </p>
          </div>

          {/* Loading history */}
          {loadingHistory && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-akasha" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando histórico...</span>
            </div>
          )}

          {/* History divider + messages */}
          {hasHistory && (
            <>
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Histórico Recente</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              {messages.map((msg, i) => (
                <MessageBubble key={`msg-${i}`} msg={msg} />
              ))}
            </>
          )}

          {/* Typing indicator */}
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

          <div ref={messagesEndRef} />
        </div>

        {/* Input capsule */}
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm pt-2 z-10" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg shadow-akasha/5">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte à Akasha..."
              disabled={sending}
              className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
              style={{ fontSize: "16px" }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              className="shrink-0 w-9 h-9 rounded-full bg-akasha text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

const MessageBubble = ({ msg }: { msg: ChatMessage }) => {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      {!isUser && (
        <img src={AKASHA_LOGO} alt="" className="w-7 h-7 rounded-full object-contain shrink-0 mt-1 bg-akasha/10 p-0.5" />
      )}
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-akasha/10 text-foreground rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-sm [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default Akasha;
