import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * Guarda e devolve o lugar da pessoa.
 * - Ida nova (clicou num link): sobe pro topo, como sempre foi.
 * - Voltar / avançar / F5: devolve a posição que ela tinha naquela tela.
 * - Só mudou o "?" da mesma tela (a ?pagina das listas, a aba do /meu-dosha, a aula
 *   do curso): não mexe em nada, e uma restauração em curso continua viva.
 */

const CHAVE_ARMAZEM = "portal:rolagem";
const TEMPO_MAXIMO_MS = 5000;
const ESTABILIDADE_MS = 400;
const LIMITE_DE_ENTRADAS = 50;

// Telas que deslizam sozinhas até um card quando os dados chegam.
const ROTAS_QUE_MANDAM_NA_PROPRIA_ROLAGEM = ["/escola/aluno/modulos"];

// Identidade da entrada do histórico. O react-router grava { idx, key } em
// history.state, e isso sobrevive ao F5. A key é única por entrada; o idx é
// reaproveitado quando a pessoa volta e navega de novo, então ele serve só de reserva
// pra entrada com que o documento carregou, que é a única sem key.
const chaveDaEntrada = () => {
  const estado = window.history.state as { idx?: number; key?: string } | null;
  const identidade =
    typeof estado?.key === "string" && estado.key
      ? estado.key
      : `i${typeof estado?.idx === "number" ? estado.idx : 0}`;
  return `${identidade}|${window.location.pathname}|${window.location.search}`;
};

const posicoes = new Map<string, number>();
let armazemLido = false;
let restaurando = false;
let gravacaoAgendada: ReturnType<typeof setTimeout> | null = null;
let restauracaoAtiva: { caminho: string; parar: (foiAPessoa?: boolean) => void } | null = null;

// Reinsere a chave no fim da fila: a poda passa a jogar fora a entrada mais antiga DE
// USO, e não a lista em que a pessoa começou a sessão.
const anotarPosicao = (valor: number) => {
  const chave = chaveDaEntrada();
  posicoes.delete(chave);
  posicoes.set(chave, valor);
};

const lerArmazem = () => {
  if (armazemLido) return;
  armazemLido = true;
  try {
    const cru = sessionStorage.getItem(CHAVE_ARMAZEM);
    if (!cru) return;
    const salvo = JSON.parse(cru) as Record<string, unknown>;
    Object.keys(salvo).forEach((chave) => {
      const valor = salvo[chave];
      if (typeof valor === "number") posicoes.set(chave, valor);
    });
  } catch {
    // aba anônima, armazenamento bloqueado ou conteúdo estragado: segue sem memória
  }
};

const gravarArmazem = () => {
  if (gravacaoAgendada) {
    clearTimeout(gravacaoAgendada);
    gravacaoAgendada = null;
  }
  try {
    while (posicoes.size > LIMITE_DE_ENTRADAS) {
      const maisAntiga = posicoes.keys().next().value as string | undefined;
      if (maisAntiga === undefined) break;
      posicoes.delete(maisAntiga);
    }
    const plano: Record<string, number> = {};
    posicoes.forEach((valor, chave) => {
      plano[chave] = valor;
    });
    sessionStorage.setItem(CHAVE_ARMAZEM, JSON.stringify(plano));
  } catch {
    // idem
  }
};

const agendarGravacao = () => {
  if (gravacaoAgendada) return;
  gravacaoAgendada = setTimeout(gravarArmazem, 300);
};

/**
 * Devolve a posição sem pressa. No instante do "voltar" a lista ainda não chegou do
 * banco e a página tem altura de uma tela só, então insiste quadro a quadro até a
 * página crescer o bastante pra CABER o alvo e ficar parada por 400ms.
 */
const devolverPosicao = (alvo: number) => {
  restaurando = true;
  const inicio = performance.now();
  let quadro = 0;
  let alturaAnterior = -1;
  let chegouEm = 0;

  const encerrar = (foiAPessoa = false) => {
    cancelAnimationFrame(quadro);
    window.removeEventListener("wheel", pararAgora);
    window.removeEventListener("keydown", pararAgora);
    window.removeEventListener("touchmove", pararAgora);
    window.removeEventListener("pointerdown", pararSeForMouse);
    restauracaoAtiva = null;
    if (foiAPessoa) {
      restaurando = false;
      return;
    }
    // O evento de rolagem do último scrollTo chega no quadro seguinte; soltar agora
    // gravaria uma posição pela metade por cima da que está guardada.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if (!restauracaoAtiva) restaurando = false;
      })
    );
  };

  function pararAgora() {
    encerrar(true);
  }

  // Dedo pousado na tela (o gesto de voltar do celular) deixa a restauração seguir;
  // quem cancela pelo dedo é o touchmove. Mouse na barra de rolagem cancela na hora.
  function pararSeForMouse(e: PointerEvent) {
    if (e.pointerType !== "touch") encerrar(true);
  }

  const tentar = () => {
    if (Math.abs(window.scrollY - alvo) > 2) window.scrollTo(0, alvo);
    const altura = document.documentElement.scrollHeight;
    const cabe = altura - window.innerHeight >= alvo - 2;
    const chegou = Math.abs(window.scrollY - alvo) <= 2;
    if (!cabe || !chegou || altura !== alturaAnterior) chegouEm = 0;
    else if (!chegouEm) chegouEm = performance.now();
    alturaAnterior = altura;
    if (chegouEm > 0 && performance.now() - chegouEm >= ESTABILIDADE_MS) {
      anotarPosicao(alvo);
      agendarGravacao();
      encerrar();
      return;
    }
    if (performance.now() - inicio > TEMPO_MAXIMO_MS) {
      encerrar();
      return;
    }
    quadro = requestAnimationFrame(tentar);
  };

  window.addEventListener("wheel", pararAgora, { passive: true });
  window.addEventListener("keydown", pararAgora);
  window.addEventListener("touchmove", pararAgora, { passive: true });
  window.addEventListener("pointerdown", pararSeForMouse, { passive: true });
  quadro = requestAnimationFrame(tentar);
  return encerrar;
};

// /biblioteca/vata -> /biblioteca/vata/alimentacao é troca de aba: as pílulas fazem a
// própria rolagem até o conteúdo. /biblioteca/horarios -> /biblioteca/vata é tela nova
// e sobe pro topo, como qualquer outra.
const trocaDeAbaDaBiblioteca = (de: string | null, para: string) => {
  if (!de) return false;
  const a = de.split("/");
  const b = para.split("/");
  return a[1] === "biblioteca" && b[1] === "biblioteca" && !!a[2] && a[2] === b[2];
};

const useEfeitoVisual = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const ScrollToTop = () => {
  const { pathname, search, hash } = useLocation();
  const tipoDeNavegacao = useNavigationType(); // POP = voltar, avançar ou carga nova
  const caminhoAnterior = useRef<string | null>(null);

  // Anota a posição da entrada em que a pessoa está, a cada rolagem.
  useEffect(() => {
    lerArmazem();
    const aoRolar = () => {
      if (restaurando) return;
      anotarPosicao(Math.round(window.scrollY));
      agendarGravacao();
    };
    window.addEventListener("scroll", aoRolar, { passive: true });
    window.addEventListener("pagehide", gravarArmazem);
    return () => {
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("pagehide", gravarArmazem);
      gravarArmazem();
      restauracaoAtiva?.parar(true);
    };
  }, []);

  useEfeitoVisual(() => {
    const anterior = caminhoAnterior.current;
    caminhoAnterior.current = pathname;

    if (tipoDeNavegacao === "POP") {
      // Endereço com "#": a âncora manda, a própria tela cuida disso.
      if (hash) return;
      if (ROTAS_QUE_MANDAM_NA_PROPRIA_ROLAGEM.some((r) => pathname.startsWith(r))) return;
      if (restauracaoAtiva?.caminho === pathname) return;
      lerArmazem();
      const alvo = posicoes.get(chaveDaEntrada());
      // Sem posição guardada (aba nova, link do Google, primeiro acesso): o navegador
      // segue fazendo o que já faz hoje.
      if (typeof alvo !== "number" || alvo <= 0) return;
      restauracaoAtiva?.parar(true);
      restauracaoAtiva = { caminho: pathname, parar: devolverPosicao(alvo) };
      return;
    }

    // Só mudou o "?" da mesma tela: é a tela se reorganizando, não uma ida nova.
    if (anterior !== null && pathname === anterior) return;
    if (trocaDeAbaDaBiblioteca(anterior, pathname)) return;

    restauracaoAtiva?.parar(true);
    window.scrollTo({ top: 0, left: 0 });
  }, [pathname, search, hash, tipoDeNavegacao]);

  return null;
};

export default ScrollToTop;
