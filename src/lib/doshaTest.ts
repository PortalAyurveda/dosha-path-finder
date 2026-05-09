import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  PART1_QUESTIONS as V1_PART1,
  PART2_QUESTIONS as V1_PART2,
  PART3_QUESTIONS as V1_PART3,
  PART4_QUESTIONS as V1_PART4,
  PART5_QUESTIONS as V1_PART5,
  PART6_QUESTIONS as V1_PART6,
  PART7_QUESTIONS as V1_PART7,
  FOOD_TAGS as V1_FOOD_TAGS,
  AGRAVAMENTOS_VATA as V1_AGV,
  AGRAVAMENTOS_PITTA as V1_AGP,
  AGRAVAMENTOS_KAPHA as V1_AGK,
} from "@/data/doshaTestQuestions.v1";

export interface ScoreValues {
  v?: number;
  p?: number;
  k?: number;
  agni_irregular?: number;
  agni_forte?: number;
  agni_fraco?: number;
}

export interface QuestionOption {
  label: string;
  scores: ScoreValues;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface FoodTag {
  label: string;
  dosha: "v" | "p" | "k";
}

export interface DoshaTestRow {
  id: string;
  part: string;
  group: string | null;
  sort_order: number;
  text: string | null;
  options: QuestionOption[];
  tag_label: string | null;
}

export interface DoshaTestContent {
  part1: Question[];
  part2: Question[];
  part3: Question[];
  part4: Question[];
  part5: Question[];
  part6: Question[];
  part7: Question[];
  foodTags: FoodTag[];
  agravamentosVata: string[];
  agravamentosPitta: string[];
  agravamentosKapha: string[];
}

export const SCORE_AXES: { key: keyof ScoreValues; label: string; range: number[] }[] = [
  { key: "v", label: "Vata", range: [-3, -2, -1, 1, 2, 3] },
  { key: "p", label: "Pitta", range: [-3, -2, -1, 1, 2, 3] },
  { key: "k", label: "Kapha", range: [-3, -2, -1, 1, 2, 3] },
  { key: "agni_irregular", label: "Agni Irregular", range: [-2, -1, 1, 2] },
  { key: "agni_forte", label: "Agni Forte", range: [-2, -1, 1, 2] },
  { key: "agni_fraco", label: "Agni Fraco", range: [-2, -1, 1, 2] },
];

export const STEP_CONFIG = [
  { title: "Parte 1: Mente e Emoções", subtitle: "Comportamento, expressão e concentração.", part: "part1" },
  { title: "Parte 2: Digestão e Fome", subtitle: "Apetite, pós-refeição e alimentação.", part: "part2" },
  { title: "Parte 3: Excreção", subtitle: "Urina, suor e evacuações.", part: "part3" },
  { title: "Parte 4: Tecidos Corporais", subtitle: "Corpo, articulações, pele e ciclo.", part: "part4" },
  { title: "Parte 5: Vitalidade", subtitle: "Energia e imunidade.", part: "part5" },
  { title: "Parte 6: Rotina Diária", subtitle: "Sono, ritmo, trabalho e lazer.", part: "part6" },
  { title: "Parte 7: Adicionais", subtitle: "Clima, decisões e constituição.", part: "part7" },
  { title: "Parte 8: Agravamentos", subtitle: "Marque os sintomas que você sente atualmente.", part: "part8" },
  { title: "Finalização", subtitle: "Seus dados complementares, interesses e relato pessoal.", part: "interests" },
];

const FALLBACK: DoshaTestContent = {
  part1: V1_PART1,
  part2: V1_PART2,
  part3: V1_PART3,
  part4: V1_PART4,
  part5: V1_PART5,
  part6: V1_PART6,
  part7: V1_PART7,
  foodTags: V1_FOOD_TAGS,
  agravamentosVata: V1_AGV,
  agravamentosPitta: V1_AGP,
  agravamentosKapha: V1_AGK,
};

export function rowsToContent(rows: DoshaTestRow[]): DoshaTestContent {
  const partQuestions: Record<string, Question[]> = {
    part1: [], part2: [], part3: [], part4: [], part5: [], part6: [], part7: [],
  };
  const foodTags: FoodTag[] = [];
  const ag: Record<"vata" | "pitta" | "kapha", string[]> = { vata: [], pitta: [], kapha: [] };

  const sorted = [...rows].sort((a, b) => {
    if (a.part !== b.part) return a.part.localeCompare(b.part);
    if ((a.group ?? "") !== (b.group ?? "")) return (a.group ?? "").localeCompare(b.group ?? "");
    return a.sort_order - b.sort_order;
  });

  for (const r of sorted) {
    if (r.part.startsWith("part") && partQuestions[r.part]) {
      partQuestions[r.part].push({
        id: `${r.part}_${r.sort_order}`,
        text: r.text ?? "",
        options: r.options ?? [],
      });
    } else if (r.part === "foods" && r.tag_label) {
      const dosha = (r.group === "vata" ? "v" : r.group === "pitta" ? "p" : "k") as "v" | "p" | "k";
      foodTags.push({ label: r.tag_label, dosha });
    } else if (r.part === "agravamentos" && r.tag_label && r.group && ag[r.group as keyof typeof ag]) {
      ag[r.group as keyof typeof ag].push(r.tag_label);
    }
  }

  return {
    part1: partQuestions.part1,
    part2: partQuestions.part2,
    part3: partQuestions.part3,
    part4: partQuestions.part4,
    part5: partQuestions.part5,
    part6: partQuestions.part6,
    part7: partQuestions.part7,
    foodTags,
    agravamentosVata: ag.vata,
    agravamentosPitta: ag.pitta,
    agravamentosKapha: ag.kapha,
  };
}

export async function fetchDoshaTestRows(): Promise<DoshaTestRow[]> {
  const { data, error } = await supabase
    .from("dosha_test_questions" as any)
    .select("*");
  if (error) throw error;
  return (data ?? []) as unknown as DoshaTestRow[];
}

export function useDoshaTestContent() {
  const [content, setContent] = useState<DoshaTestContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const rows = await fetchDoshaTestRows();
        if (!alive) return;
        if (rows.length === 0) {
          setContent(FALLBACK);
        } else {
          setContent(rowsToContent(rows));
        }
      } catch (e: any) {
        console.error("[useDoshaTestContent] fallback to v1 snapshot:", e);
        if (alive) {
          setError(e);
          setContent(FALLBACK);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return { content, loading, error };
}

// Helpers for the editor
export function summarizeScores(scores: ScoreValues): string {
  const parts: string[] = [];
  for (const axis of SCORE_AXES) {
    const v = scores[axis.key];
    if (v && v !== 0) {
      const sign = v > 0 ? "+" : "";
      parts.push(`${axis.label === "Vata" ? "v" : axis.label === "Pitta" ? "p" : axis.label === "Kapha" ? "k" : axis.label.toLowerCase().replace(/\s/g, "_")}${sign}${v}`);
    }
  }
  return parts.join(" · ");
}
