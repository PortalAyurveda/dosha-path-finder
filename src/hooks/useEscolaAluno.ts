import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/contexts/UserContext";

export type AlunoRow = {
  id: string;
  email: string;
  nome_completo: string;
  status: string;
  turma_id: string | null;
  matricula: string | null;
  cpf: string | null;
  whatsapp: string | null;
  cidade: string | null;
  contrato_valor_total: string | null;
  contrato_forma_pagamento: string | null;
  contrato_observacao: string | null;
  contrato_disponivel_aluno: boolean | null;
};

type Result = {
  loading: boolean;
  needsLogin: boolean;
  notApproved: boolean;
  aluno: AlunoRow | null;
};

export function useEscolaAluno(): Result {
  const { user, loading: authLoading } = useUser();
  const [loading, setLoading] = useState(true);
  const [aluno, setAluno] = useState<AlunoRow | null>(null);
  const [notApproved, setNotApproved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (authLoading) return;

    if (!user?.email) {
      setLoading(false);
      setAluno(null);
      setNotApproved(false);
      return;
    }

    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("escola_alunos")
        .select("id,email,nome_completo,status,turma_id,matricula")
        .eq("email", user.email!.toLowerCase())
        .eq("status", "aprovado")
        .maybeSingle();
      if (cancelled) return;
      if (!data) {
        setAluno(null);
        setNotApproved(true);
      } else {
        setAluno(data as AlunoRow);
        setNotApproved(false);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return {
    loading: authLoading || loading,
    needsLogin: !authLoading && !user,
    notApproved,
    aluno,
  };
}
