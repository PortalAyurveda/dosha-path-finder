import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CourseHeroData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseHeroProps {
  data: CourseHeroData;
  branding: CourseBranding;
  onCtaClick: () => void;
}

const CourseHero = ({ data, branding, onCtaClick }: CourseHeroProps) => {
  return (
    <section
      id="top"
      className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden py-16 md:py-24"
      style={{
        background: `linear-gradient(135deg, ${branding.darkColor} 0%, ${branding.primaryColor} 100%)`,
      }}
    >
      {/* Decorative overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.3) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.2) 0%, transparent 40%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-6 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif italic font-bold text-3xl md:text-5xl lg:text-6xl leading-tight mb-4 drop-shadow-lg"
        >
          {data.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-serif text-xl md:text-3xl lg:text-4xl mb-6 drop-shadow-md"
          style={{ color: branding.accentColor }}
        >
          {data.subheadline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base md:text-lg max-w-3xl mx-auto mb-10 text-white/90 leading-relaxed"
        >
          {data.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="inline-flex flex-col items-center gap-3 mb-8 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border border-white/20"
        >
          <div className="flex items-baseline gap-3 flex-wrap justify-center">
            <span className="text-lg md:text-xl line-through text-white/60">{data.priceOld}</span>
            <span className="font-serif font-bold text-3xl md:text-5xl text-white">
              {data.priceNew}
            </span>
          </div>
          <span
            className="text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: branding.accentColor, color: branding.darkColor }}
          >
            {data.accessYears}
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={onCtaClick}
          className="group inline-flex items-center gap-3 font-bold text-base md:text-lg uppercase tracking-wide px-8 md:px-12 py-5 md:py-6 bg-white shadow-2xl hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)] transition-all hover:scale-105 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center"
          style={{ color: branding.darkColor }}
        >
          {data.ctaText}
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
};

export default CourseHero;
