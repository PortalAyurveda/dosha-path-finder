import { slugify } from "@/lib/slugify";

type TherapistSlugSource = {
  ["terapeutas(dinamica)"]?: string | null;
  nome?: string | null;
  title?: string | null;
};

const therapistThemeClasses = [
  "therapist-theme-yellow",
  "therapist-theme-green",
  "therapist-theme-salmon",
  "therapist-theme-orange",
  "therapist-theme-navy",
  "therapist-theme-purple",
] as const;

function normalizeWhitespace(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function hashString(value: string) {
  return value.split("").reduce((hash, character) => {
    return (hash << 5) - hash + character.charCodeAt(0);
  }, 0);
}

export function cleanTherapistText(value: string | null | undefined) {
  return normalizeWhitespace(value);
}

export function getTherapistDisplayName(value: string | null | undefined) {
  return normalizeWhitespace(value) || "Terapeuta";
}

export function getTherapistLocation(cidade: string | null | undefined, estado: string | null | undefined) {
  return [normalizeWhitespace(cidade), normalizeWhitespace(estado)]
    .filter(Boolean)
    .join(" — ");
}

export function normalizeTherapistSlug(value: string | null | undefined) {
  const rawValue = value?.replace(/["']/g, "").trim() ?? "";

  if (!rawValue) return "";

  const segments = rawValue
    .split("/")
    .map((segment) => segment.trim())
    .filter(Boolean);

  const candidate = segments.at(-1) ?? rawValue;
  return slugify(candidate);
}

export function therapistMatchesSlug(slug: string | null | undefined, therapist: TherapistSlugSource) {
  const normalizedSlug = normalizeTherapistSlug(slug);

  if (!normalizedSlug) return false;

  return [therapist["terapeutas(dinamica)"], therapist.nome, therapist.title].some(
    (value) => normalizeTherapistSlug(value) === normalizedSlug,
  );
}

export function getTherapistProfilePath(slug: string | null | undefined) {
  const normalizedSlug = normalizeTherapistSlug(slug);
  return normalizedSlug ? `/terapeutas/${normalizedSlug}` : "/terapeutas-do-brasil";
}

export function getTherapistThemeClass(seed: string | null | undefined) {
  const normalizedSeed = normalizeTherapistSlug(seed) || normalizeWhitespace(seed) || "portal-ayurveda";
  return therapistThemeClasses[Math.abs(hashString(normalizedSeed)) % therapistThemeClasses.length];
}

export function splitTherapistSpecialties(value: string | null | undefined) {
  return (value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getInstagramHandle(value: string | null | undefined) {
  const handle = value?.replace(/^['"\s]*@?/, "").trim().replace(/\/+$/, "") ?? "";
  return handle || null;
}

export const NOME_CURTO_ESPECIALIDADES: Array<[string, string]> = [
  ["Ahara", "Alimentação"],
  ["Yoga & Dinacharya", "Rotina e Yoga"],
  ["Dravya Guna", "Ervas e fitoterapia"],
  ["Rasayana", "Longevidade"],
  ["Manas", "Saúde mental"],
  ["Stri Roga", "Saúde da mulher"],
  ["Nidana & Pareeksha", "Diagnóstico"],
  ["Panchakarma", "Desintoxicação"],
  ["Bala & Performance", "Esporte e vigor"],
  ["Vajikarana", "Vitalidade"],
  ["Prasuti & Balachikitsa", "Mãe e criança"],
  ["Abhyanga", "Massagem"],
];

export function nomeCurtoEspecialidade(especialidade: string) {
  const found = NOME_CURTO_ESPECIALIDADES.find(([chave]) =>
    especialidade.startsWith(chave),
  );
  return found ? found[1] : especialidade;
}