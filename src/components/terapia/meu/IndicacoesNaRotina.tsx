import { useQuery } from "@tanstack/react-query";
import { meu } from "@/lib/terapiaMeu";
import FolhasDoTerapeuta from "./FolhasDoTerapeuta";

/** Topo da Minha Rotina: só aparece quando minhas_indicacoes() devolve alguma folha. */
export default function IndicacoesNaRotina() {
  const q = useQuery({ queryKey: ["minhas-indicacoes"], queryFn: meu.indicacoes });
  const folha = q.data?.[0];
  if (!folha) return null;
  return <div className="mb-6 border-b border-border pb-6"><h2 className="mb-3 font-serif text-xl font-bold text-primary">Orientações do seu terapeuta {folha.terapeuta.primeiro_nome}</h2><FolhasDoTerapeuta inicial={folha} semFita /></div>;
}
