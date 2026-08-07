export interface ArtigoBase {
  id: string;
  title: string;
  summary?: string | null;
  link_do_artigo?: string | null;
  meta_description?: string | null;
  tags?: string | null;
  image_url?: string | null;
}

export interface ArtigoMatched<T extends ArtigoBase = ArtigoBase> {
  artigo: T;
  matchedSymptom: string;
  matchedDosha: string;
}

export function parseSymptoms(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags.split(",").map((t) => t.trim()).filter(Boolean);
}

export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

export function buildSymptomList(
  agravVataTags: string | null | undefined,
  agravPittaTags: string | null | undefined,
  agravKaphaTags: string | null | undefined
): { symptom: string; dosha: string }[] {
  return [
    ...parseSymptoms(agravVataTags).map((s) => ({ symptom: s, dosha: "Vata" })),
    ...parseSymptoms(agravPittaTags).map((s) => ({ symptom: s, dosha: "Pitta" })),
    ...parseSymptoms(agravKaphaTags).map((s) => ({ symptom: s, dosha: "Kapha" })),
  ];
}

/**
 * Mesmo matching client-side usado na aba "Personalizado" do /meu-dosha:
 * agravamentos do teste × título/tags/descrição dos artigos, em round-robin
 * por sintoma para variar os doshas.
 */
export function matchArtigos<T extends ArtigoBase>(
  artigos: T[],
  sintomas: { symptom: string; dosha: string }[],
  max: number
): ArtigoMatched<T>[] {
  if (sintomas.length === 0 || artigos.length === 0) return [];

  const bySymptom = new Map<string, ArtigoMatched<T>[]>();

  for (const { symptom, dosha } of sintomas) {
    const words = normalizeForSearch(symptom).split(/\s+/).filter((w) => w.length > 2);
    if (words.length === 0) continue;
    const list: ArtigoMatched<T>[] = [];
    for (const a of artigos) {
      const searchable = normalizeForSearch(
        `${a.title} ${a.tags || ""} ${a.meta_description || ""} ${a.summary || ""}`
      );
      if (words.some((w) => searchable.includes(w))) {
        list.push({ artigo: a, matchedSymptom: symptom, matchedDosha: dosha });
      }
    }
    bySymptom.set(`${symptom}|${dosha}`, list);
  }

  const result: ArtigoMatched<T>[] = [];
  const seen = new Set<string>();
  const keys = Array.from(bySymptom.keys());
  const idxMap = new Map<string, number>(keys.map((k) => [k, 0]));

  while (result.length < max) {
    let added = false;
    for (const key of keys) {
      if (result.length >= max) break;
      const matches = bySymptom.get(key)!;
      let idx = idxMap.get(key)!;
      while (idx < matches.length && seen.has(matches[idx].artigo.id)) idx++;
      if (idx < matches.length) {
        seen.add(matches[idx].artigo.id);
        result.push(matches[idx]);
        idxMap.set(key, idx + 1);
        added = true;
      }
    }
    if (!added) break;
  }

  return result;
}
