export interface CourseBranding {
  logo: string;
  primaryColor: string;
  darkColor: string;
  lightColor: string;
  accentColor: string;
  warmBg: string;
}

export interface CourseMeta {
  slug: string;
  title: string;
  description: string;
}

export interface CourseHeroData {
  headline: string;
  subheadline: string;
  description: string;
  priceOld: string;
  priceNew: string;
  accessYears: string;
  installments?: string;
  ctaText: string;
}

export interface CourseProblemData {
  title: string;
  intro: string;
  bullets: string[];
  closing: string;
  examples?: string[];
  finalNote?: string;
}

export type CourseIconName =
  | "Brain"
  | "Sparkles"
  | "Target"
  | "Heart"
  | "Calendar"
  | "Users"
  | "Award"
  | "Zap"
  | "Bot"
  | "BookOpen"
  | "Clock"
  | "AlertTriangle"
  | "Sprout"
  | "Puzzle"
  | "Stethoscope"
  | "Check";

export interface CourseBenefit {
  iconName: CourseIconName;
  title: string;
  text: string;
}

export interface CourseSolutionData {
  title: string;
  description: string;
  benefits: CourseBenefit[];
}

export interface CourseModule {
  number: number;
  title: string;
  description: string;
  highlights?: string[];
}

export interface CourseModulesData {
  title: string;
  modules: CourseModule[];
}

export interface CourseBonusItem {
  iconName: CourseIconName;
  title: string;
  description?: string;
}

export interface CourseBonusData {
  title: string;
  included: string[];
  bonuses: CourseBonusItem[];
}

export interface CoursePricingData {
  priceOld: string;
  priceNew: string;
  installments: string;
  highlight: string;
  context?: string;
  ctaText: string;
  guarantee: string;
}

export interface CourseTestimonial {
  highlight: string;
  quote: string;
  name: string;
}

export interface CourseAudienceItem {
  iconName?: CourseIconName;
  title: string;
  description: string;
}

export interface CourseAudienceData {
  title: string;
  audiences: CourseAudienceItem[];
}

export interface CourseProfessorData {
  name: string;
  photo: string;
  bio: string[];
}

export interface CourseFinalCTAData {
  headline: string;
  subheadline: string;
  priceOld?: string;
  priceNew: string;
  installments: string;
  highlight: string;
  ctaText: string;
  quote?: string;
  quoteAuthor?: string;
}

export interface CourseFooterData {
  tagline: string;
  phone: string;
  email: string;
  instagram: string;
}

export interface CourseOpportunityData {
  title: string;
  paragraphs: string[];
  highlight: string;
  closing: string;
}

export interface CourseData {
  meta: CourseMeta;
  branding: CourseBranding;
  hero: CourseHeroData;
  problem: CourseProblemData;
  opportunity?: CourseOpportunityData;
  solution: CourseSolutionData;
  modules: CourseModulesData;
  bonus: CourseBonusData;
  pricing: CoursePricingData;
  testimonials: CourseTestimonial[];
  audience: CourseAudienceData;
  professor: CourseProfessorData;
  finalCta: CourseFinalCTAData;
  footer: CourseFooterData;
  checkoutUrl: string;
}
