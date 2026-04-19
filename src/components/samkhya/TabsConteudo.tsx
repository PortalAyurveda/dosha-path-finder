import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { samkhyaTokens } from "./tokens";
import type { SamkhyaClinico } from "@/integrations/supabase/loja-client";

interface TabsConteudoProps {
  clinico: SamkhyaClinico | null;
}

const TABS = [
  { id: "oque", label: "O que é", key: "O que é" as const },
  { id: "indica", label: "Para quem é", key: "Indicações" as const },
  { id: "uso", label: "Como usar", key: "Posologia" as const },
  { id: "esperar", label: "O que esperar", key: "Efeitos esperados" as const },
  { id: "ingredientes", label: "Ingredientes", key: "Ingredientes" as const },
];

const TabsConteudo = ({ clinico }: TabsConteudoProps) => {
  if (!clinico) return null;

  const hasAnyContent = TABS.some((t) => clinico[t.key]);
  if (!hasAnyContent) return null;

  return (
    <Tabs defaultValue="oque" className="w-full">
      <TabsList
        className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 h-auto bg-transparent gap-0 p-0 rounded-none border-b"
        style={{ borderColor: samkhyaTokens.cardBorder }}
      >
        {TABS.map((t) => (
          <TabsTrigger
            key={t.id}
            value={t.id}
            className="text-sm py-3 rounded-none bg-transparent border-b-2 border-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none transition-colors"
            style={
              {
                color: samkhyaTokens.roxo,
                "--tw-ring-color": samkhyaTokens.roxo,
              } as React.CSSProperties
            }
            data-samkhya-tab
          >
            {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {TABS.map((t) => {
        const body = clinico[t.key];
        return (
          <TabsContent key={t.id} value={t.id} className="pt-6">
            {body ? (
              <p
                className="whitespace-pre-line text-sm md:text-base leading-relaxed text-justify"
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

      {/* Active tab underline via inline style override */}
      <style>{`
        [data-samkhya-tab][data-state="active"] {
          border-bottom-color: ${samkhyaTokens.roxo} !important;
          background-color: #f3eaf0 !important;
          font-weight: 600;
        }
      `}</style>
    </Tabs>
  );
};

export default TabsConteudo;
