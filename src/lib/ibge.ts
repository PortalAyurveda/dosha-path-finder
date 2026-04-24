// Light client for IBGE Localidades API.
// Docs: https://servicodados.ibge.gov.br/api/docs/localidades

export type IbgeEstado = { id: number; sigla: string; nome: string };
export type IbgeMunicipio = { id: number; nome: string };

const BASE = "https://servicodados.ibge.gov.br/api/v1/localidades";

export async function fetchEstados(): Promise<IbgeEstado[]> {
  const res = await fetch(`${BASE}/estados?orderBy=nome`);
  if (!res.ok) throw new Error("Falha ao carregar estados");
  return res.json();
}

export async function fetchMunicipios(uf: string): Promise<IbgeMunicipio[]> {
  const res = await fetch(`${BASE}/estados/${uf}/municipios`);
  if (!res.ok) throw new Error("Falha ao carregar municípios");
  const data = (await res.json()) as IbgeMunicipio[];
  return data.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
}
