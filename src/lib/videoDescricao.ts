/**
 * Limpa a descrição bruta de um vídeo para exibição:
 *  - remove linhas que são apenas marcações de tempo ("00:00 - Introdução...")
 *    já exibidas no bloco clicável "Índice de Minutos";
 *  - remove a frase de convite que contém a URL do portalayurveda.com
 *    (corta do último ponto final anterior até o fim daquela frase/linha);
 *  - normaliza espaços e quebras de linha.
 */
const TIMESTAMP_LINE = /^\s*(\d{1,2}:)?\d{1,2}:\d{2}\s*[-–—]/;
const PORTAL_URL = /portalayurveda\.com/i;

function removerFraseConvite(texto: string): string {
  if (!PORTAL_URL.test(texto)) return texto;

  // Trabalha linha a linha: em cada linha que cita o domínio, corta da última
  // pontuação final antes da menção até o fim da linha.
  return texto
    .split("\n")
    .map((linha) => {
      const match = PORTAL_URL.exec(linha);
      if (!match) return linha;
      // Recua até o início do "token" da URL (ex.: https://www.portalayurveda.com)
      let inicioToken = match.index;
      while (inicioToken > 0 && !/\s/.test(linha[inicioToken - 1])) inicioToken--;
      const antes = linha.slice(0, inicioToken);
      const corte = Math.max(
        antes.lastIndexOf("."),
        antes.lastIndexOf("!"),
        antes.lastIndexOf("?")
      );
      if (corte === -1) return "";
      return antes.slice(0, corte + 1).trimEnd();
    })
    .join("\n");
}

export function limparDescricaoVideo(texto: string | null | undefined): string {
  if (!texto) return "";

  const semTimestamps = texto
    .split("\n")
    .filter((linha) => !TIMESTAMP_LINE.test(linha))
    .join("\n");

  return removerFraseConvite(semTimestamps)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
