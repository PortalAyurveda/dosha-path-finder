import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { samkhyaTokens } from "./tokens";
import type { SamkhyaClinico } from "@/integrations/supabase/loja-client";

interface AcordeoConteudoProps {
  clinico: SamkhyaClinico | null;
}

const AcordeoConteudo = ({ clinico }: AcordeoConteudoProps) => {
  const sections = [
    { id: "oque", title: "O que é", body: clinico?.["O que é"] },
    { id: "indica", title: "Para quem é", body: clinico?.["Indicações"] },
    { id: "uso", title: "Como usar", body: clinico?.["Posologia"] },
    { id: "esperar", title: "O que esperar", body: clinico?.["Efeitos esperados"] },
  ];

  return (
    <Accordion type="multiple" className="w-full" defaultValue={["oque"]}>
      {sections.map((s) => (
        <AccordionItem key={s.id} value={s.id} style={{ borderColor: samkhyaTokens.cardBorder }}>
          <AccordionTrigger
            className="text-left hover:no-underline"
            style={{ color: samkhyaTokens.roxo, fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {s.title}
          </AccordionTrigger>
          <AccordionContent>
            {s.body ? (
              <p className="whitespace-pre-line text-sm leading-relaxed" style={{ color: samkhyaTokens.texto }}>
                {s.body}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: samkhyaTokens.textoSec }}>
                Conteúdo em preparação.
              </p>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default AcordeoConteudo;
