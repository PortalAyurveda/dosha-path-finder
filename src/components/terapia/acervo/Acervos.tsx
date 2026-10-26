import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Painel } from "@/lib/terapia";
import MeuAcervo from "./MeuAcervo";
import BibliotecaPortal from "./BibliotecaPortal";

export default function Acervos({ userId, painel }: { userId?: string; painel: Painel }) {
  const [aba, setAba] = useState<"portal" | "pessoal">("portal");
  return (
    <>
      <nav aria-label="Bibliotecas" className="mb-5 flex flex-wrap border-b border-border">
        {([["portal", "Biblioteca do Portal"], ["pessoal", "Biblioteca pessoal"]] as const).map(([v, n]) => (
          <Button key={v} variant="ghost" aria-pressed={aba === v} className={`rounded-none border-b-2 ${aba === v ? "border-secondary bg-secondary/10 font-semibold" : "border-transparent text-muted-foreground"}`} onClick={() => setAba(v)}>{n}</Button>
        ))}
      </nav>
      {aba === "portal" ? <BibliotecaPortal /> : <MeuAcervo userId={userId} painel={painel} />}
    </>
  );
}
