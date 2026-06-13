import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AKASHA_LOGO = "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/reteste-dosha";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

interface RetesteChatProps {
  email: string;
  nome: string;
  sessaoId: string;
  idPublico: string | null;
  initialMessages: ChatMessage[];
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

const RetesteChat = ({ email, nome, sessaoId, idPublico, initialMessages }: RetesteChatProps) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showConcluir, setShowConcluir] = useState(false);
  const [concluding, setConcluding] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const concluirTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollChatToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollChatToBottom();
  }, [messages, sending, showConcluir, scrollChatToBottom]);

  useEffect(() => {
    return () => {
      if (concluirTimerRef.current) clearTimeout(concluirTimerRef.current);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || sending || showConcluir) return;
    const userMsg = input.trim();
    setInput("");
    const userChatMsg: ChatMessage = { role: "user", content: userMsg, time: getNowBrazilTime() };
    setMessages(prev => [...prev, userChatMsg]);
    setSending(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message: userMsg, nome }),
      });
      const data = await response.json();
      const botReply = data?.resposta || data?.output || data?.text || "Desculpe, não consegui processar sua mensagem.";
      const botMsg: ChatMessage = { role: "assistant", content: botReply, time: getNowBrazilTime() };
      setMessages(prev => [...prev, botMsg]);

      if (data?.reteste_concluido === true) {
        concluirTimerRef.current = setTimeout(() => setShowConcluir(true), 2000);
      }
    } catch {
      const errMsg: ChatMessage = { role: "assistant", content: "Erro ao conectar. Tente novamente.", time: getNowBrazilTime() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setSending(false);
    }
  };



  const handleConcluir = async () => {
    if (concluding) return;
    setConcluding(true);
    try {
      await supabase
        .from("reteste_sessao" as any)
        .update({ status: "concluido", updated_at: new Date().toISOString() } as any)
        .eq("id", sessaoId);
    } catch (err) {
      console.error("Failed to mark reteste concluido", err);
    }
    navigate(`/meu-dosha${idPublico ? `?id=${idPublico}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col mt-2">
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto overscroll-contain space-y-3 pb-3 px-1 min-h-[50vh]">
        <div className="flex items-center justify-center gap-2 pb-2 pt-1">
          <img src={AKASHA_LOGO} alt="Akasha IA" className="w-7 h-7 object-contain shrink-0" />
          <div className="flex flex-col leading-tight">
            <h2 className="font-serif text-sm font-bold text-akasha">Akasha IA</h2>
            <p className="text-[10px] text-muted-foreground/80">Revisão do seu diagnóstico</p>
          </div>
        </div>

        {messages.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center text-center px-4 py-6 gap-2">
            <img src={AKASHA_LOGO} alt="" className="w-12 h-12 object-contain" />
            <p className="font-serif text-sm font-bold text-akasha">Vamos revisar seu diagnóstico</p>
            <p className="text-xs text-muted-foreground">Conte como você está se sentindo nos últimos dias.</p>
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
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              ) : (
                <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-sm [&_strong]:text-foreground">
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

        {showConcluir && (
          <div className="flex justify-center pt-2">
            <button
              onClick={handleConcluir}
              disabled={concluding}
              className="px-6 py-3 rounded-full bg-akasha text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center gap-2"
            >
              {concluding && <Loader2 className="w-4 h-4 animate-spin" />}
              Concluir revisão
            </button>
          </div>
        )}
      </div>

      <div
        className="sticky bottom-0 z-10 bg-background pt-2 pb-2"
        style={{ paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg shadow-akasha/5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={showConcluir ? "Revisão concluída" : "Pergunte à Akasha..."}
            disabled={sending || showConcluir}
            enterKeyHint="send"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-base"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim() || showConcluir}
            className="shrink-0 w-9 h-9 rounded-full bg-akasha text-white flex items-center justify-center disabled:opacity-40 transition-opacity hover:opacity-90"
            aria-label="Enviar"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RetesteChat;
