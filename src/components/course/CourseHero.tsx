import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CourseHeroData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseHeroProps {
  data: CourseHeroData;
  branding: CourseBranding;
  onCtaClick: () => void;
  logo?: string;
}

const CourseHero = ({ data, branding, onCtaClick, logo }: CourseHeroProps) => {
  return (
    <section
      id="top"
      className="relative w-full py-14 md:py-20"
      style={{ background: branding.primaryColor }}
    >
      <div className="relative max-w-5xl mx-auto px-6 text-center">
        {(logo ?? branding.logo) && (
          <motion.img
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            src={logo ?? branding.logo}
            alt="Curso"
            className="h-16 md:h-20 w-auto mx-auto mb-8 object-contain"
          />
        )}

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-serif italic font-bold text-4xl md:text-5xl leading-tight mb-4"
          style={{ color: "#352F54" }}
        >
          {data.headline}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="font-serif text-2xl md:text-3xl mb-6 font-bold"
          style={{ color: branding.accentColor }}
        >
          {data.subheadline}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-base md:text-lg max-w-2xl mx-auto mb-10 text-white/95 leading-relaxed"
        >
          {data.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="inline-flex flex-col items-center gap-3 mb-8"
        >
          <div className="flex items-baseline gap-3 flex-wrap justify-center">
            <span className="text-base md:text-lg line-through text-white/70">
              {data.priceOld}
            </span>
            <span className="font-serif font-bold text-4xl md:text-5xl text-white">
              {data.priceNew}
            </span>
          </div>
          <span
            className="text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 rounded-full"
            style={{ background: branding.accentColor, color: "#352F54" }}
          >
            {data.accessYears}
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={onCtaClick}
          className="group inline-flex items-center gap-3 font-bold text-sm md:text-base uppercase tracking-wide px-8 md:px-12 py-4 md:py-5 bg-white shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center"
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
