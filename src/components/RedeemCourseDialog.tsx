import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ERROS: Record<string, string> = {
  nao_autenticado: "Você precisa estar logado para resgatar um código.",
  codigo_invalido: "Esse código não existe. Confira se digitou certinho.",
  codigo_ja_usado: "Esse código já foi usado.",
  codigo_nao_pertence_a_essa_conta:
    "Esse código foi emitido para outro email. Entre com o mesmo email da sua compra original e tente de novo.",
};

export function RedeemCourseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleResgatar = async () => {
    if (!codigo.trim()) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("resgatar_codigo_migracao", { p_codigo: codigo.trim() });
    setLoading(false);

    if (error || !data?.ok) {
      const erro = (data as any)?.erro as string | undefined;
      toast({
        title: "Não foi possível resgatar",
        description: erro && ERROS[erro] ? ERROS[erro] : "Tente novamente em alguns instantes.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: (data as any).ja_matriculado ? "Você já tinha acesso a este curso" : "Curso liberado!",
      description: "Atualize a página pra ver o curso na sua área de cursos.",
    });
    setCodigo("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Resgatar curso</DialogTitle>
          <DialogDescription>
            Se você já comprou um curso em outra plataforma e recebeu um código de acesso,
            digite ele aqui.
          </DialogDescription>
        </DialogHeader>
        <Input
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Seu código"
          onKeyDown={(e) => e.key === "Enter" && handleResgatar()}
        />
        <DialogFooter>
          <Button onClick={handleResgatar} disabled={loading || !codigo.trim()}>
            {loading ? "Resgatando..." : "Resgatar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
