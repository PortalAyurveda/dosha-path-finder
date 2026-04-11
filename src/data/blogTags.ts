export const BLOG_TAGS = [
  "🌬️Vata",
  "🔥Pitta",
  "🪵Kapha",
  "🪔Metabolismo e digestão",
  "☣️Ama e biotoxinas",
  "🧬Fisiologia e Doshas",
  "🚽Excreção e dejetos",
  "🍯Vitalidade & Ojas",
  "✨Prana e espiritualidade",
  "🧠Mente e consciência",
  "🛏️Sono e descanso",
  "🕊️Sattva & Equilibrio",
  "🐅Rajas & Agitação",
  "🪨Tamas & Inércia",
  "🥘Alimentação & Receitas",
  "⚗️Dravyaguna & Herbologia",
  "🕰️Rotina * Horarios",
  "💊Antídotos & Incompatíveis",
  "💆Terapias Ayurveda",
  "🏗️Detox e restrições",
  "🎯Indicações e dicas",
  "📉Emagrecimento",
  "📈Ganho de Peso",
  "🔍Diagnóstico",
  "🧪Doenças Avançadas",
] as const;

export type BlogTag = (typeof BLOG_TAGS)[number];

export interface TagCategory {
  name: string;
  tags: BlogTag[];
}

export const TAG_CATEGORIES: TagCategory[] = [
  {
    name: "Doshas",
    tags: ["🌬️Vata", "🔥Pitta", "🪵Kapha", "🧬Fisiologia e Doshas"],
  },
  {
    name: "Corpo & Metabolismo",
    tags: ["🪔Metabolismo e digestão", "☣️Ama e biotoxinas", "🚽Excreção e dejetos", "🍯Vitalidade & Ojas"],
  },
  {
    name: "Mente & Energia",
    tags: ["✨Prana e espiritualidade", "🧠Mente e consciência", "🛏️Sono e descanso", "🕊️Sattva & Equilibrio", "🐅Rajas & Agitação", "🪨Tamas & Inércia"],
  },
  {
    name: "Alimentação",
    tags: ["🥘Alimentação & Receitas", "⚗️Dravyaguna & Herbologia", "💊Antídotos & Incompatíveis"],
  },
  {
    name: "Terapias & Rotina",
    tags: ["💆Terapias Ayurveda", "🕰️Rotina * Horarios", "🏗️Detox e restrições", "🎯Indicações e dicas"],
  },
  {
    name: "Saúde & Peso",
    tags: ["📉Emagrecimento", "📈Ganho de Peso", "🔍Diagnóstico", "🧪Doenças Avançadas"],
  },
];
