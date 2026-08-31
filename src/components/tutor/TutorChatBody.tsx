import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Send, GraduationCap } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import AkashaMessageContent from "@/components/akasha/AkashaMessageContent";

export const TUTOR_WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/tutor-curso";

export interface TutorCurso {
  id: string;
  slug: string;
  titulo: string;
  card_logo_url: string | null;
  card_cor_primaria: string | null;
  card_cor_secundaria: string | null;
}

export interface TutorMessage {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

export const formatBrazilTime = (value?: string | Date | null) => {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(date);
};

const nowTime = () => formatBrazilTime(new Date());

const mapHistoryMessage = (message: any): TutorMessage | null => {
  const role =
    message?.type === "human"
      ? "user"
      : message?.type === "ai" || message?.type === "assistant"
        ? "assistant"
        : null;
  const content = typeof message?.content === "string" ? message.content.trim() : "";
  if (!role || !content) return null;
  return { role, content, time: formatBrazilTime(message?.data_hora ?? message?.timestamp ?? null) };
};

export const TutorAvatar = ({
  curso,
  className = "w-8 h-8",
}: {
  curso: TutorCurso;
  className?: string;
}) => {
  const cor = curso.card_cor_primaria || "#352F54";
  if (curso.card_logo_url) {
    return (
      <img
        src={curso.card_logo_url}
        alt=""
        className={`${className} rounded-full object-cover shrink-0`}
        style={{ boxShadow: `0 0 0 2px ${cor}55` }}
        loading="lazy"
        decoding="async"
      />
    );
  }
  return (
    <span
      className={`${className} rounded-full shrink-0 flex items-center justify-center text-white`}
      style={{ background: cor }}
    >
      <GraduationCap className="w-1/2 h-1/2" />
    </span>
  );
};

interface Props {
  curso: TutorCurso;
  className?: string;
  onNavigate?: () => void;
}

const TutorChatBody = ({ curso, className = "", onNavigate }: Props) => {
  const { user, profile } = useUser();
  const queryClient = useQueryClient();

  const [messages, setMessages] = useState<TutorMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasHydratedRef = useRef(false);

  const cor = curso.card_cor_primaria || "#352F54";
  const cor2 = curso.card_cor_secundaria || cor;

  const email = user?.email || "visitante@portalayurveda.com";
  const nome = profile?.nome || "Aluno";

  const cacheKey = ["tutor-history", curso.slug, email] as const;

  const boasVindas: TutorMessage = {
    role: "assistant",
    content: `Boas-vindas! Sou o tutor do seu curso de ${curso.titulo}. Pode me perguntar o que quiser que sou especializado nesse tema🦉`,
  };

  const { data: cachedHistory, isLoading: loadingHistory } = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      try {
        const response = await fetch(TUTOR_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            curso: curso.slug,
            nome_curso: curso.titulo,
            nome,
            message: "",
            action: "get_history",
          }),
        });
        const data = await response.json();
        const history = Array.isArray(data?.history)
          ? data.history.map(mapHistoryMessage).filter((m: any): m is TutorMessage => Boolean(m))
          : [];
        return history as TutorMessage[];
      } catch (err) {
        console.error("Failed to load tutor history:", err);
        return [] as TutorMessage[];
      }
    },
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const updateCache = useCallback(
    (msgs: TutorMessage[]) => {
      queryClient.setQueryData(cacheKey, msgs);
    },
    [queryClient, curso.slug, email],
  );

  useEffect(() => {
    if (cachedHistory === undefined) return;
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    setMessages(cachedHistory.length > 0 ? cachedHistory : [boasVindas]);
  }, [cachedHistory]);

  const scrollChatToBottom = useCallback(() => {
    const el = chatContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    requestAnimationFrame(scrollChatToBottom);
  }, [messages, sending, scrollChatToBottom]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => {
      const next = [...prev, { role: "user" as const, content: userMsg, time: nowTime() }];
      updateCache(next);
      return next;
    });
    setSending(true);
    try {
      const response = await fetch(TUTOR_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          curso: curso.slug,
          nome_curso: curso.titulo,
          nome,
          message: userMsg,
          action: "",
        }),
      });
      const data = await response.json();
      const reply =
        data?.resposta || data?.output || data?.text || "Desculpe, não consegui processar sua mensagem.";
      setMessages((prev) => {
        const next = [...prev, { role: "assistant" as const, content: reply, time: nowTime() }];
        updateCache(next);
        return next;
      });
    } catch {
      setMessages((prev) => {
        const next = [
          ...prev,
          { role: "assistant" as const, content: "Erro ao conectar com o tutor. Tente novamente.", time: nowTime() },
        ];
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

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto overscroll-contain space-y-3 px-3 py-3"
      >
        {loadingHistory && messages.length === 0 && (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: cor }} />
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            {msg.role === "assistant" && <TutorAvatar curso={curso} className="w-6 h-6 mt-1" />}
            <div
              className="max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed text-foreground"
              style={{
                background: msg.role === "user" ? `${cor2}22` : `${cor}12`,
              }}
            >
              {msg.role === "user" ? (
                <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
              ) : (
                <AkashaMessageContent
                  content={msg.content}
                  proseClassName="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_p]:my-1 [&_li]:text-sm [&_strong]:text-foreground"
                  onNavigate={onNavigate}
                />
              )}
              {msg.time && (
                <p
                  className={`mt-1 text-[10px] ${msg.role === "user" ? "text-right text-foreground/60" : "text-muted-foreground"}`}
                >
                  {msg.time}
                </p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex items-start gap-2">
            <TutorAvatar curso={curso} className="w-6 h-6 mt-1" />
            <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: `${cor}12` }}>
              <div className="flex gap-1">
                {[0, 150, 300].map((d) => (
                  <span
                    key={d}
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: `${cor}99`, animationDelay: `${d}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border p-2">
        <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte ao tutor..."
            disabled={sending}
            enterKeyHint="send"
            autoComplete="off"
            className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-sm"
            style={{ fontSize: "16px" }}
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center disabled:opacity-40 hover:opacity-90"
            style={{ background: cor }}
            aria-label="Enviar"
          >
            {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorChatBody;
