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
  ctaText: string;
}

export interface CourseProblemData {
  title: string;
  intro: string;
  bullets: string[];
  closing: string;
}

export interface CourseBenefit {
  iconName: "Brain" | "Sparkles" | "Target" | "Heart" | "Calendar" | "Users" | "Award" | "Zap";
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
  iconName: "Calendar" | "Heart" | "Users" | "Award" | "Sparkles";
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
  ctaText: string;
  guarantee: string;
}

export interface CourseTestimonial {
  highlight: string;
  quote: string;
  name: string;
}

export interface CourseAudienceData {
  title: string;
  audiences: { title: string; description: string }[];
}

export interface CourseProfessorData {
  name: string;
  photo: string;
  bio: string[];
}

export interface CourseFinalCTAData {
  headline: string;
  subheadline: string;
  priceNew: string;
  installments: string;
  highlight: string;
  ctaText: string;
}

export interface CourseFooterData {
  tagline: string;
  phone: string;
  email: string;
  instagram: string;
}

export interface CourseData {
  meta: CourseMeta;
  branding: CourseBranding;
  hero: CourseHeroData;
  problem: CourseProblemData;
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
