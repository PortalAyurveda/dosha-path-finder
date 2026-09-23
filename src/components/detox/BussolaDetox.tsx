import { CASA_DOSHA, ETAPAS, MARCA_LEITURA, emPalavras, montarBussola } from "@/data/detoxLingua";
import { getFaixa, type DoshaNome } from "@/data/doshaLevels";

type Props = {
  dosha: DoshaNome;
  scores: Record<DoshaNome, number>;
  tags: string | null | undefined;
  marcas: string[];
};

const Bloco = ({ children }: { children: React.ReactNode }) => (
  <div className="border-t border-detox-divider pt-6 first:border-t-0 first:pt-0">{children}</div>
);

const Sub = ({ children }: { children: React.ReactNode }) => (
  <h4 className="font-serif text-lg font-bold text-detox-text">{children}</h4>
);

const BussolaDetox = ({ dosha, scores, tags, marcas }: Props) => {
  const bussola = montarBussola(dosha, tags);
  const nomes: DoshaNome[] = ["vata", "pitta", "kapha"];
  const ordenados = [...nomes].sort((a, b) => scores[b] - scores[a]);
  const alto = ordenados[0];
  const baixo = ordenados[ordenados.length - 1];
  const rotulo = (d: DoshaNome) => `${d[0].toUpperCase()}${d.slice(1)}`;

  return (
    <div className="space-y-6">
      <Bloco>
        <Sub>Os seus números</Sub>
        <p className="mt-2 text-sm leading-relaxed text-detox-text md:text-base">
          O seu dosha mais alto é o {rotulo(alto)}: {scores[alto]}. Faixa: {getFaixa(alto, scores[alto]).toLowerCase()}.
        </p>
        <p className="mt-1 text-sm leading-relaxed text-detox-text md:text-base">
          O seu dosha mais baixo é o {rotulo(baixo)}: {scores[baixo]}. Faixa: {getFaixa(baixo, scores[baixo]).toLowerCase()}.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-detox-muted">Sempre tem um dosha baixo para outro estar alto.</p>
      </Bloco>

      <Bloco>
        <Sub>A casa dele</Sub>
        <p className="mt-2 text-sm leading-relaxed text-detox-text md:text-base">
          A casa do {dosha} é o {CASA_DOSHA[dosha]}.
        </p>
        {bussola.naCasa.length ? (
          <>
            <p className="mt-2 text-sm leading-relaxed text-detox-text md:text-base">
              Você marcou {bussola.naCasa.length} {bussola.naCasa.length === 1 ? "sinal" : "sinais"} dentro da casa:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-detox-muted md:text-base">
              {bussola.naCasa.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-detox-muted md:text-base">Você não marcou nenhum sinal dentro da casa.</p>
        )}
      </Bloco>

      <Bloco>
        <Sub>E ele já saiu de casa</Sub>
        {bussola.fora.length ? (
          <>
            <ul className="mt-2 space-y-1 text-sm text-detox-text md:text-base">
              {bussola.fora.map((item) => <li key={item.tag}>{item.frase}</li>)}
            </ul>
            <p className="mt-2 text-sm leading-relaxed text-detox-muted">
              {bussola.fora.length === 1 ? "É um lugar fora da casa." : `São ${emPalavras(bussola.fora.length)} lugares fora da casa.`}
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-detox-muted md:text-base">Os seus sinais não saíram da casa.</p>
        )}
        {bussola.soltos.map((tag) => (
          <p key={tag} className="mt-3 text-sm leading-relaxed text-detox-muted">
            Você também marcou {tag}. Esse sinal não está na lista dos lugares para onde o {dosha} vai, então eu deixo ele aqui de lado.
          </p>
        ))}
      </Bloco>

      {bussola.etapa && (
        <Bloco>
          <Sub>Onde você está nas seis etapas</Sub>
          <ol className="mt-4 flex flex-wrap items-center gap-2">
            {ETAPAS.map((etapa) => (
              <li
                key={etapa}
                aria-current={etapa === bussola.etapa ? "step" : undefined}
                className={`rounded-full px-3 py-2 text-xs font-bold uppercase ${etapa === bussola.etapa ? "bg-detox-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {etapa}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-sm leading-relaxed text-detox-text md:text-base">{bussola.explicacao}</p>
          <p className="mt-1 text-sm leading-relaxed text-detox-muted">Isso não é ruim nem é raro.</p>
        </Bloco>
      )}

      <Bloco>
        <Sub>A língua conta a mesma história?</Sub>
        {marcas.length ? (
          <>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-detox-text md:text-base">
              {marcas.filter((slug) => MARCA_LEITURA[slug]).map((slug) => <li key={slug}>{MARCA_LEITURA[slug]}</li>)}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-detox-muted">
              Uma marca sozinha não fecha nada. O próprio professor diz que tem risco central e fleuma amarela, e se sente com vitalidade. Ninguém tem língua perfeita.
            </p>
          </>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-detox-muted md:text-base">
            Marque o que você está vendo lá em cima e eu ponho a sua língua ao lado da sua bússola.
          </p>
        )}
      </Bloco>
    </div>
  );
};

export default BussolaDetox;
