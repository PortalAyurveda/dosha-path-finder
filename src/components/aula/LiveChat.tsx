import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Users } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

interface ChatMessage {
  id: string;
  slug: string;
  nome: string;
  mensagem: string;
  user_id: string | null;
  created_at: string;
  fonte: string | null;
}

const LS_NAME_KEY = "chat_aula_nome";

function formatHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).replace(":", "h");
}

interface Props {
  slug: string;
}

const LiveChat = ({ slug }: Props) => {
  const { user, profile } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(LS_NAME_KEY) || "";
  });
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loggedName = profile?.nome || user?.email?.split("@")[0] || "";
  const displayName = user ? loggedName : guestName;

  // Initial fetch
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("chat_aula")
        .select("*")
        .eq("slug", slug)
        .order("created_at", { ascending: false })
        .limit(50);
      if (active && data) {
        setMessages((data as ChatMessage[]).slice().reverse());
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat_aula_${slug}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_aula",
          filter: `slug=eq.${slug}`,
        },
        (payload) => {
          setMessages((prev) => {
            const incoming = payload.new as ChatMessage;
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Active in last 5 min
  const activeCount = useMemo(() => {
    const cutoff = Date.now() - 5 * 60 * 1000;
    const names = new Set<string>();
    messages.forEach((m) => {
      if (new Date(m.created_at).getTime() >= cutoff) names.add(m.nome);
    });
    return names.size;
  }, [messages]);

  const send = async () => {
    const msg = text.trim();
    const name = displayName.trim();
    if (!msg || !name || sending) return;
    if (msg.length > 300) return;
    setSending(true);
    if (!user) localStorage.setItem(LS_NAME_KEY, name);
    const { error } = await supabase.from("chat_aula").insert({
      slug,
      nome: name,
      mensagem: msg,
      user_id: user?.id ?? null,
    });
    if (!error) setText("");
    setSending(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/40">
        <h3 className="font-heading text-sm font-semibold text-foreground">Chat ao vivo</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3.5 w-3.5" />
          <span>{activeCount} no chat</span>
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            Seja o primeiro a comentar.
          </p>
        ) : (
          messages.map((m, i) => (
            <div
              key={m.id}
              className={`px-2 py-1.5 rounded-md text-sm ${
                i % 2 === 0 ? "bg-transparent" : "bg-muted/40"
              }`}
            >
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-semibold text-primary text-[13px]">{m.nome}</span>
                <span className="text-[10px] text-muted-foreground">
                  {formatHora(m.created_at)}
                </span>
              </div>
              <p className="text-foreground/90 leading-snug whitespace-pre-wrap break-words">
                {m.mensagem}
              </p>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-border p-2 space-y-2 bg-background">
        {!user && (
          <Input
            value={guestName}
            onChange={(e) => setGuestName(e.target.value.slice(0, 40))}
            placeholder="Seu nome"
            className="h-8 text-sm"
          />
        )}
        <div className="flex gap-2 items-end">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 300))}
            onKeyDown={onKey}
            placeholder="Escreva uma mensagem…"
            className="h-9 text-sm"
            maxLength={300}
            disabled={!displayName.trim()}
          />
          <Button
            size="sm"
            onClick={send}
            disabled={!text.trim() || !displayName.trim() || sending}
            className="h-9 shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex justify-between text-[10px] text-muted-foreground px-1">
          <span>Ctrl+Enter envia</span>
          <span>{text.length}/300</span>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
