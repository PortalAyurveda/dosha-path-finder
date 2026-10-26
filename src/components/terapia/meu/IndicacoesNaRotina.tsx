import { useQuery } from "@tanstack/react-query";
import { meu } from "@/lib/terapiaMeu";
import FolhasDoTerapeuta from "./FolhasDoTerapeuta";

/** Topo da Minha Rotina: só aparece quando minhas_indicacoes() devolve alguma folha. */
export default function IndicacoesNaRotina() {
  const q = useQuery({ queryKey: ["minhas-indicacoes"], queryFn: meu.indicacoes });
  const folha = q.data?.[0];
  if (!folha) return null;
  return <div className="mb-6"><FolhasDoTerapeuta inicial={folha} /></div>;
}
