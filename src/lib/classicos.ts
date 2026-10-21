import { supabase } from "@/integrations/supabase/client";

export async function rpcClassicos<T>(nome: string, args: Record<string, unknown> = {}): Promise<T[]> {
  const { data, error } = await supabase.rpc(nome as never, args as never);
  if (error) throw error;
  return (data ?? []) as T[];
}

export const ESTANTES: { chave: string; titulo: string }[] = [
  { chave: "ayurveda", titulo: "Ayurveda: os tratados" },
  { chave: "nighantu", titulo: "Dicionários de plantas (nighaṇṭu)" },
  { chave: "yoga", titulo: "Yoga e Vedānta" },
  { chave: "darsana", titulo: "Darśanas" },
  { chave: "upanishad", titulo: "Upaniṣads" },
  { chave: "purana", titulo: "Purāṇas" },
  { chave: "tantra", titulo: "Tantra" },
  { chave: "outros", titulo: "Outros" },
];

export const fonteDevanagari = { fontFamily: "'Noto Serif Devanagari', 'Roboto Serif', serif" };

export const numero = (n: number | null | undefined) => (n ?? 0).toLocaleString("pt-BR");

export type ObraLista = {
  estante: string; slug: string; nome: string; nome_devanagari: string | null;
  autor: string | null; epoca: string | null; apresentacao: string | null;
  capa_url: string | null; completude: string | null; nota_estado: string | null;
  total_versos: number; total_capitulos: number;
};
