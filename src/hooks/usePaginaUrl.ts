import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/**
 * A página da lista passa a morar no endereço: /blog?pagina=3.
 *
 * - Página 1 não escreve nada: /blog e /blog?pagina=1 seriam dois endereços pra mesma
 *   tela, e o sitemap lista a forma limpa.
 * - Troca sempre com replace: o Voltar sai da lista num toque só, e a página volta
 *   junto porque o endereço guardado naquela entrada do histórico já tem o ?pagina.
 * - Os outros parâmetros do endereço são preservados.
 * - `congelado` = a tela tem filtro ligado que não está no endereço. Aí a página fica
 *   em estado local e o ?pagina sai do endereço, pra ele nunca descrever uma tela
 *   diferente da que a pessoa está vendo.
 */
export function usePaginaUrl(nome = "pagina", congelado = false) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { pathname, hash } = useLocation();
  const [paginaLocal, definirPaginaLocal] = useState(1);

  const bruto = Number(searchParams.get(nome));
  const paginaDoEndereco =
    Number.isFinite(bruto) && bruto > 1 ? Math.min(Math.floor(bruto), 10000) : 1;
  const pagina = congelado ? paginaLocal : paginaDoEndereco;

  useEffect(() => {
    if (!congelado) definirPaginaLocal(1);
  }, [congelado]);

  const definirPagina = useCallback(
    (p: number) => {
      const alvo = Math.max(1, Math.floor(p) || 1);
      if (congelado) definirPaginaLocal(alvo);
      const proximos = new URLSearchParams(searchParams);
      if (congelado || alvo <= 1) proximos.delete(nome);
      else proximos.set(nome, String(alvo));
      const consulta = proximos.toString();
      if (consulta === searchParams.toString()) return;
      navigate({ pathname, search: consulta ? `?${consulta}` : "", hash }, { replace: true });
    },
    [navigate, pathname, hash, searchParams, nome, congelado]
  );

  return [pagina, definirPagina] as const;
}
