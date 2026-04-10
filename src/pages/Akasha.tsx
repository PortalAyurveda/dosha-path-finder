import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import PageContainer from "@/components/PageContainer";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AKASHA_LOGO = "https://static.wixstatic.com/media/b8f47f_105371e1ade24ccd9bd3406b83bd925e~mv2.png";
const WEBHOOK_URL = "https://n8n.portalayurveda.com/webhook/chat-ayurveda";
const USER_CONTEXT_SELECT = "idPublico, nome, email, doshaprincipal, imc, vatascore, pittascore, kaphascore, agniPrincipal, conhecimentoAyurveda";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  time?: string;
}

interface UserRecord {
  idPublico: string | null;
  nome: string | null;
  email: string | null;
  doshaprincipal: string | null;
  imc: number | null;
  vatascore: number | null;
  pittascore: number | null;
  kaphascore: number | null;
  agniPrincipal: string | null;
  conhecimentoAyurveda: string | null;
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
  historySessionId: string;
}

const hasUsableEmail = (email?: string | null) => {
  if (!email) return false;
  const normalized = email.trim();
  return normalized.includes("@") && !normalized.includes("{{") && !normalized.includes("}}");
};

const sanitizeEmail = (email: string | null | undefined, fallbackContactId: string) => {
  if (hasUsableEmail(email)) {
    return email!.trim().toLowerCase();
  }
  return `${fallbackContactId}@visitante.com`;
};

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

const parseStoredMessage = (rawMessage: unknown) => {
  if (!rawMessage) return null;

  if (typeof rawMessage === "string") {
    try {
      return JSON.parse(rawMessage);
    } catch {
      return null;
    }
  }

  if (typeof rawMessage === "object") {
    return rawMessage;
  }

  return null;
};

const mapN8nHistoryMessage = (message: any): ChatMessage | null => {
  const role = message?.type === "human"
    ? "user"
    : message?.type === "ai" || message?.type === "assistant"
      ? "assistant"
      : null;

  const content = typeof message?.content === "string" ? message.content.trim() : "";

  if (!role || !content) return null;

  return {
    role,
    content,
    time: formatBrazilTime(message?.data_hora ?? message?.timestamp ?? message?.created_at ?? null),
  };
};

const mapDbHistoryMessage = (row: any): ChatMessage | null => {
  const parsed = parseStoredMessage(row?.message);
  const role = parsed?.type === "human"
    ? "user"
    : parsed?.type === "ai" || parsed?.type === "assistant"
      ? "assistant"
      : null;

  const content = typeof parsed?.content === "string" ? parsed.content.trim() : "";

  if (!role || !content) return null;

  return {
    role,
    content,
    time: formatBrazilTime(row?.data_hora ?? null),
  };
};

const buildVisitorContext = (visitorId: string): UserContext => ({
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
  historySessionId: `${visitorId}@visitante.com`,
});

const buildUserContext = (
  currentRecord: UserRecord | null,
  legacyRecord: UserRecord | null,
  fallbackContactId?: string,
  fallbackEmail?: string | null,
): UserContext | null => {
  const source = currentRecord ?? legacyRecord;
  if (!source) return null;

  const preferredEmail = [currentRecord?.email, legacyRecord?.email, fallbackEmail].find(hasUsableEmail) ?? source.email;
  const contactId = source.idPublico || fallbackContactId;

  if (!contactId) return null;

  const resolvedEmail = sanitizeEmail(preferredEmail, contactId);

  return {
    nome: source.nome || "Visitante",
    email: resolvedEmail,
    doshaprincipal: source.doshaprincipal || "Não informado",
    imc: source.imc,
    vatascore: source.vatascore,
    pittascore: source.pittascore,
    kaphascore: source.kaphascore,
    agniPrincipal: source.agniPrincipal || "Não informado",
    conhecimentoAyurveda: source.conhecimentoAyurveda || "Não informado",
    contactId,
    historySessionId: resolvedEmail,
  };
};

const fetchUserRecordsById = async (publicId: string) => {
  const [currentResponse, legacyResponse] = await Promise.all([
    supabase
      .from("doshas_registros2")
      .select(USER_CONTEXT_SELECT)
      .eq("idPublico", publicId)
      .maybeSingle(),
    supabase
      .from("doshas_registros")
      .select(USER_CONTEXT_SELECT)
      .eq("idPublico", publicId)
      .maybeSingle(),
  ]);

  return {
    current: (currentResponse.data as UserRecord | null) ?? null,
    legacy: (legacyResponse.data as UserRecord | null) ?? null,
  };
};

const fetchLatestUserRecordsByEmail = async (email: string) => {
  const [currentResponse, legacyResponse] = await Promise.all([
    supabase
      .from("doshas_registros2")
      .select(USER_CONTEXT_SELECT)
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("doshas_registros")
      .select(USER_CONTEXT_SELECT)
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1),
  ]);

  return {
    current: ((currentResponse.data as UserRecord[] | null) ?? [])[0] ?? null,
    legacy: ((legacyResponse.data as UserRecord[] | null) ?? [])[0] ?? null,
  };
};

const loadFallbackHistory = async (sessionIds: string[]) => {
  const uniqueSessionIds = Array.from(new Set(sessionIds.filter(Boolean)));
  if (!uniqueSessionIds.length) return [] as ChatMessage[];

  const { data, error } = await supabase
    .from("chat_histories")
    .select("message, data_hora, session_id")
    .in("session_id", uniqueSessionIds)
    .order("data_hora", { ascending: false })
    .limit(2);

  if (error || !data) return [] as ChatMessage[];

  return [...data]
    .reverse()
    .map(mapDbHistoryMessage)
    .filter((message): message is ChatMessage => Boolean(message));
};

const Akasha = () => {
  const [searchParams] = useSearchParams();
  const { user, profile, loading: authLoading } = useUser();
  const idPublico = searchParams.get("id") || "";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [userCtx, setUserCtx] = useState<UserContext | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadContext = async () => {
      if (!idPublico && authLoading) return;

      let nextContext: UserContext | null = null;

      if (idPublico) {
        const { current, legacy } = await fetchUserRecordsById(idPublico);
        nextContext = buildUserContext(current, legacy, idPublico, user?.email ?? null);
      } else if (user?.email) {
        const fallbackDoshaId = localStorage.getItem("activeDoshaId") || profile?.visitor_id || undefined;
        const { current, legacy } = await fetchLatestUserRecordsByEmail(user.email);
        nextContext = buildUserContext(current, legacy, fallbackDoshaId, user.email);
      }

      if (!nextContext) {
        let visitorId = profile?.visitor_id || localStorage.getItem("akasha_visitorId");
        if (!visitorId) {
          visitorId = `anon_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem("akasha_visitorId", visitorId);
        }
        nextContext = buildVisitorContext(visitorId);
      }

      if (!isMounted) return;

      if (
        nextContext.contactId &&
        !nextContext.contactId.startsWith("anon_") &&
        !nextContext.contactId.includes("@")
      ) {
        localStorage.setItem("activeDoshaId", nextContext.contactId);
      }

      setUserCtx(nextContext);
    };

    loadContext();

    return () => {
      isMounted = false;
    };
  }, [authLoading, idPublico, profile?.visitor_id, user?.email]);

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!userCtx?.historySessionId) return;

      setLoadingHistory(true);
      setMessages([]);

      const fallbackSessionIds = [
        userCtx.historySessionId,
        userCtx.email,
        userCtx.contactId,
        `${userCtx.contactId}@visitante.com`,
      ];

      try {
        const response = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "get_history",
            session_id: userCtx.historySessionId,
          }),
        });

        const data = await response.json();
        const history = Array.isArray(data?.history)
          ? data.history
              .map(mapN8nHistoryMessage)
              .filter((message): message is ChatMessage => Boolean(message))
          : [];

        if (history.length > 0) {
          if (isMounted) setMessages(history);
          return;
        }

        const fallbackHistory = await loadFallbackHistory(fallbackSessionIds);
        if (isMounted && fallbackHistory.length > 0) {
          setMessages(fallbackHistory);
        }
      } catch (error) {
        console.error("Failed to load history:", error);

        const fallbackHistory = await loadFallbackHistory(fallbackSessionIds);
        if (isMounted && fallbackHistory.length > 0) {
          setMessages(fallbackHistory);
        }
      } finally {
        if (isMounted) setLoadingHistory(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, [userCtx?.contactId, userCtx?.email, userCtx?.historySessionId]);

  const sendMessage = async () => {
    if (!input.trim() || sending || !userCtx) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: userMsg, time: getNowBrazilTime() },
    ]);
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

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const botReply = data?.resposta || data?.output || data?.text || "Desculpe, não consegui processar sua mensagem.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: botReply, time: getNowBrazilTime() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erro ao conectar com a Akasha. Tente novamente.", time: getNowBrazilTime() },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const hasHistory = messages.length > 0 && !loadingHistory;

  return (
    <PageContainer title="Akasha IA — Ayurveda" description="Sua assistente pessoal de Ayurveda com inteligência artificial.">
      <div className="max-w-2xl mx-auto flex flex-col" style={{ minHeight: "calc(100vh - 200px)" }}>
        <div className="flex-1 overflow-y-auto space-y-3 pb-4 px-1">
          <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
            <img src={AKASHA_LOGO} alt="Akasha IA" className="w-14 h-14 object-contain" />
            <h1 className="font-serif text-xl font-bold text-akasha">Akasha IA</h1>
            <p className="text-muted-foreground text-sm max-w-sm">
              Olá{userCtx?.nome && userCtx.nome !== "Visitante" ? `, ${userCtx.nome}` : ""}! Sou a Akasha, sua guia de Ayurveda. Pergunte-me sobre alimentação, rotinas, doshas e mais.
            </p>
          </div>

          {loadingHistory && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-akasha" />
              <span className="ml-2 text-sm text-muted-foreground">Carregando histórico...</span>
            </div>
          )}

          {hasHistory && (
            <>
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">Histórico Recente</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {messages.map((msg, index) => (
                <MessageBubble key={`msg-${index}`} msg={msg} />
              ))}
            </>
          )}

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

        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm pt-2" style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <div className="flex items-center gap-2 bg-card border border-border rounded-full px-4 py-2 shadow-lg shadow-akasha/5">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
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
            ? "bg-primary/20 text-foreground rounded-tr-sm"
            : "bg-akasha/10 text-foreground rounded-tl-sm"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:leading-relaxed [&_p]:text-foreground [&_li]:text-sm [&_li]:text-foreground [&_strong]:text-foreground [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm">
            <ReactMarkdown skipHtml>{msg.content}</ReactMarkdown>
          </div>
        )}

        {msg.time && (
          <p className={`mt-2 text-[11px] ${isUser ? "text-right text-primary-foreground/70" : "text-muted-foreground"}`}>
            {msg.time}
          </p>
        )}
      </div>
    </div>
  );
};

export default Akasha;
