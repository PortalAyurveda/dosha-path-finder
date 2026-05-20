import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const LS_NAME_KEY = "portalayurveda:comment:name";
const MAX = 500;

interface CommentRow {
  id: string;
  nome: string;
  mensagem: string;
  created_at: string | null;
}

interface Props {
  slug: string;
  title?: string;
}

const Comments = ({ slug, title = "O que você está achando da aula?" }: Props) => {
  const { user, profile } = useUser();
  const [items, setItems] = useState<CommentRow[]>([]);
  const [text, setText] = useState("");
  const [guestName, setGuestName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem(LS_NAME_KEY) || "";
  });
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const loggedName = profile?.nome || user?.email?.split("@")[0] || "";

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("chat_aula")
        .select("id, nome, mensagem, created_at")
        .eq("slug", slug)
        .eq("tipo", "comentario")
        .order("created_at", { ascending: false })
        .limit(200);
      if (active) {
        setItems((data as CommentRow[]) || []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  const handleSubmit = async () => {
    const mensagem = text.trim();
    if (!mensagem) return;
    const nome = (user ? loggedName : guestName).trim();
    if (!nome) {
      toast.error("Digite seu nome");
      return;
    }
    if (mensagem.length > MAX) {
      toast.error(`Máximo ${MAX} caracteres`);
      return;
    }
    setSending(true);
    const { data, error } = await supabase
      .from("chat_aula")
      .insert({
        slug,
        nome,
        mensagem,
        tipo: "comentario",
        fonte: "portal",
        user_id: user?.id ?? null,
      })
      .select("id, nome, mensagem, created_at")
      .single();
    setSending(false);
    if (error) {
      toast.error("Erro ao enviar comentário");
      return;
    }
    if (!user && guestName) localStorage.setItem(LS_NAME_KEY, guestName);
    setItems((prev) => [data as CommentRow, ...prev]);
    setText("");
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4 md:p-5 flex flex-col h-full">
      <h2 className="font-heading text-lg md:text-xl font-semibold text-primary mb-3">
        {title}
      </h2>

      <div className="space-y-3 mb-4">
        {!user && (
          <Input
            placeholder="Seu nome"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              localStorage.setItem(LS_NAME_KEY, e.target.value);
            }}
            maxLength={60}
          />
        )}
        <Textarea
          placeholder="Escreva seu comentário..."
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX))}
          rows={3}
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">{text.length}/{MAX}</span>
          <Button
            onClick={handleSubmit}
            disabled={sending || !text.trim() || (!user && !guestName.trim())}
            size="sm"
          >
            {sending ? "Enviando..." : "Comentar"}
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando comentários...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Seja o primeiro a comentar.</p>
        ) : (
          items.map((c) => (
            <div key={c.id} className="border-b border-border/60 pb-2 last:border-0">
              <p className="font-body text-sm font-semibold text-primary">{c.nome}</p>
              <p className="font-body text-sm text-foreground/90 whitespace-pre-line break-words">
                {c.mensagem}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default Comments;
