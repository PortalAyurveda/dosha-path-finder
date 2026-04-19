import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { samkhyaTokens } from "./tokens";
import type { SamkhyaClinico } from "@/integrations/supabase/loja-client";

interface TabsConteudoProps {
  clinico: SamkhyaClinico | null;
}

const TABS = [
  { id: "oque", icon: "📖", label: "O que é", key: "O que é" as const },
  { id: "indica", icon: "🌿", label: "Para quem é", key: "Indicações" as const },
  { id: "uso", icon: "🥄", label: "Como usar", key: "Posologia" as const },
  { id: "esperar", icon: "✨", label: "O que esperar", key: "Efeitos esperados" as const },
];

const TabsConteudo = ({ clinico }: TabsConteudoProps) => {
  return (
    <Tabs defaultValue="oque" className="w-full">
      <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 h-auto bg-transparent gap-1 p-0">
        {TABS.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="text-xs sm:text-sm py-2.5 flex items-center justify-center gap-1.5 rounded-md data-[state=active]:text-white"
            style={
              {
                "--tw-ring-color": samkhyaTokens.roxo,
              } as React.CSSProperties
            }
          >
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((t) => {
        const body = clinico?.[t.key];
        return (
          <TabsContent key={t.id} value={t.id} className="pt-5">
            {body ? (
              <p
                className="whitespace-pre-line text-sm leading-relaxed"
                style={{ color: samkhyaTokens.texto }}
              >
                {body}
              </p>
            ) : (
              <p className="text-sm italic" style={{ color: samkhyaTokens.textoSec }}>
                Conteúdo em preparação.
              </p>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
};

export default TabsConteudo;
