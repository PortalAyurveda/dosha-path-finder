import { useEffect, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";
import Seo from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TIPOS = ["Sugestão", "Contato", "Bug", "Elogio"] as const;

const schema = z.object({
  nome: z.string().trim().min(1, "Informe seu nome").max(100),
  email: z.string().trim().email("E-mail inválido").max(255),
  tipo: z.enum(TIPOS),
  assunto: z.string().trim().min(1, "Informe um assunto").max(150),
  mensagem: z.string().trim().min(1, "Escreva uma mensagem").max(2000),
});

const Contato = () => {
  const { user, profile } = useUser();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipo, setTipo] = useState<(typeof TIPOS)[number]>("Sugestão");
  const [assunto, setAssunto] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile) {
      const p = profile as any;
      setNome((prev) => prev || p.nome_completo || p.nome || "");
      setEmail((prev) => prev || p.email || "");
    }
  }, [profile]);

  const reset = () => {
    setAssunto("");
    setMensagem("");
    setTipo("Sugestão");
    if (!user) {
      setNome("");
      setEmail("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ nome, email, tipo, assunto, mensagem });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("mensagens").insert([
      { user_id: user?.id ?? null, ...parsed.data },
    ]);
    setSubmitting(false);
    if (error) {
      toast.error("Não foi possível enviar. Tente novamente.");
      return;
    }
    toast.success("Mensagem enviada! Obrigado pelo contato.");
    reset();
  };

  return (
    <>
      <Seo
        title="Contato & Sugestões — Portal Ayurveda"
        description="Envie sua sugestão, dúvida ou elogio para o time do Portal Ayurveda."
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-heading text-3xl text-foreground mb-2">
          Contato & Sugestões
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Sua opinião nos ajuda a melhorar o portal. Responderemos pelo e-mail
          informado quando necessário.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 bg-card border border-border rounded-xl p-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={100}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={255}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as any)}>
              <SelectTrigger id="tipo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPOS.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assunto">Assunto</Label>
            <Input
              id="assunto"
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              maxLength={150}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              maxLength={2000}
              rows={6}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {mensagem.length}/2000
            </p>
          </div>

          <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
            {submitting ? "Enviando..." : "Enviar mensagem"}
          </Button>
        </form>
      </div>
    </>
  );
};

export default Contato;
