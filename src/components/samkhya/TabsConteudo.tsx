import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { samkhyaTokens } from "./tokens";

interface TabsConteudoProps {
  descricaoProduto: string | null | undefined;
}

// Cabeçalhos esperados (ordem fixa) e label da aba
const SECOES = [
  { id: "oque", label: "O que é", header: "O que é" },
  { id: "indica", label: "Para quem é", header: "Indicações" },
  { id: "uso", label: "Como usar", header: "Posologia" },
  { id: "esperar", label: "O que esperar", header: "Efeitos esperados" },
  { id: "ingredientes", label: "Ingredientes", header: "Ingredientes" },
  { id: "curiosidades", label: "Curiosidades", header: "Curiosidades" },
] as const;

/**
 * Quebra `descricao_produto` em seções, identificando as linhas que correspondem
 * exatamente a um cabeçalho conhecido. Tudo entre dois cabeçalhos vira o corpo.
 */
function parseDescricao(texto: string): Record<string, string> {
  const headers: string[] = SECOES.map((s) => s.header);
  const linhas = texto.split(/\r?\n/);
  const result: Record<string, string> = {};
  let atual: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (atual) {
      result[atual] = buffer.join("\n").trim();
    }
    buffer = [];
  };

  for (const raw of linhas) {
    const linha = raw.trim();
    if (headers.includes(linha)) {
      flush();
      atual = linha;
    } else if (atual) {
      buffer.push(raw);
    }
  }
  flush();
  return result;
}

const TabsConteudo = ({ descricaoProduto }: TabsConteudoProps) => {
  if (!descricaoProduto?.trim()) return null;

  const secoes = parseDescricao(descricaoProduto);
  const abasComConteudo = SECOES.filter((s) => secoes[s.header]);
  if (abasComConteudo.length === 0) return null;

  const cols = Math.min(abasComConteudo.length, 6);

  return (
    <Tabs defaultValue={abasComConteudo[0].id} className="w-full">
      <TabsList
        className="w-full grid h-auto bg-transparent gap-0 p-0 rounded-none border-b"
        style={{
          borderColor: samkhyaTokens.cardBorder,
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {abasComConteudo.map((t) => (
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

      {abasComConteudo.map((t) => (
        <TabsContent key={t.id} value={t.id} className="pt-6">
          <p
            className="whitespace-pre-line text-sm md:text-base leading-relaxed text-justify"
            style={{ color: samkhyaTokens.texto }}
          >
            {secoes[t.header]}
          </p>
        </TabsContent>
      ))}

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
