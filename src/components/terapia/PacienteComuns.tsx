import { LockKeyhole } from 'lucide-react';
import { ReactNode } from 'react';
export function TituloPaciente({ children }: { children: ReactNode }) { return <h2 className="mb-3 font-serif text-lg font-bold text-primary">{children}</h2>; }
export function Trancado({ nome, assunto }: { nome: string; assunto: string }) {
  return <section className="py-12 text-center"><LockKeyhole className="mx-auto mb-4 h-10 w-10 rounded-full bg-muted p-2 text-muted-foreground" /><h2 className="text-lg font-semibold">{nome.split(' ')[0]} não liberou {assunto}</h2><p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Ela pode liberar em Minha conta, Meu terapeuta.{assunto === 'as conversas com a Akasha' && ' Liberado, aparece aqui o resumo dos temas das últimas conversas, não as conversas inteiras.'}</p></section>;
}