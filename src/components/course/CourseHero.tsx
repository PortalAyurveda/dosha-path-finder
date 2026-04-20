import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CourseHeroData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseHeroProps {
  data: CourseHeroData;
  branding: CourseBranding;
  onCtaClick: () => void;
  logo?: string;
  courseName?: string;
}

const CourseHero = ({ data, branding, onCtaClick, logo, courseName = "Alimentação Ayurveda" }: CourseHeroProps) => {
  return (
    <section
      id="top"
      className="relative w-full py-12 md:py-16 overflow-hidden"
      style={{
        background: `linear-gradient(180deg, #F5FBF7 0%, #FAF9F6 100%)`,
      }}
    >
      <div
        className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-25 pointer-events-none"
        style={{ background: branding.primaryColor }}
        aria-hidden
      />
      <div
        className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-20 pointer-events-none"
        style={{ background: branding.primaryColor }}
        aria-hidden
      />

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-3 mb-7"
        >
          <img
            src={logo ?? branding.logo}
            alt={courseName}
            className="h-14 md:h-16 w-auto object-contain"
          />
          <h2
            className="font-serif italic font-bold text-2xl md:text-3xl leading-tight"
            style={{ color: branding.darkColor }}
          >
            {courseName.split(" ").map((word, i) => (
              <span key={i} className="block">{word}</span>
            ))}
          </h2>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif italic font-bold text-3xl md:text-4xl leading-tight mb-3"
          style={{ color: "#352F54" }}
        >
          {data.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-serif text-xl md:text-2xl mb-5 font-bold"
          style={{ color: branding.darkColor }}
        >
          {data.subheadline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-sm md:text-base max-w-xl mx-auto mb-8 text-gray-700 leading-relaxed"
        >
          {data.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="inline-flex flex-col items-center gap-2 mb-7"
        >
          <div className="flex items-baseline gap-2.5 flex-wrap justify-center">
            <span className="text-sm md:text-base line-through text-gray-400">
              {data.priceOld}
            </span>
            <span className="font-serif font-bold text-3xl md:text-4xl" style={{ color: "#352F54" }}>
              {data.priceNew}
            </span>
          </div>
          <span
            className="text-[11px] md:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white"
            style={{ background: branding.accentColor }}
          >
            {data.accessYears}
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={onCtaClick}
          className="group inline-flex items-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-7 md:px-10 py-3.5 md:py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center text-white"
          style={{ background: branding.darkColor }}
        >
          {data.ctaText}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
};

export default CourseHero;
