import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CourseHeroData, CourseBranding } from "@/data/courses/courseTypes";

interface CourseHeroProps {
  data: CourseHeroData;
  branding: CourseBranding;
  onCtaClick: () => void;
  logo?: string;
  courseName?: string;
  heroImage?: string;
}

const CourseHero = ({ data, branding, onCtaClick, logo, courseName = "Alimentação Ayurveda", heroImage }: CourseHeroProps) => {
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

      <div className={`relative max-w-6xl mx-auto px-6 ${heroImage ? "grid grid-cols-1 md:grid-cols-[1.6fr_1fr] gap-10 items-center" : "max-w-4xl text-center"}`}>
        <div className={heroImage ? "text-left" : "text-center"}>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`flex items-center mb-7 ${heroImage ? "justify-start" : "justify-center"}`}
          >
            <img
              src={logo ?? branding.logo}
              alt={courseName}
              className="h-20 md:h-28 w-auto object-contain"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-serif italic font-bold text-3xl md:text-4xl leading-tight mb-3 whitespace-pre-line"
            style={{ color: "#352F54" }}
          >
            {data.headline}
          </motion.h1>

          {data.subheadline && (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-serif text-xl md:text-2xl mb-5 font-bold"
              style={{ color: branding.darkColor }}
            >
              {data.subheadline}
            </motion.p>
          )}

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={`text-sm md:text-base mb-6 text-gray-700 leading-relaxed ${heroImage ? "" : "max-w-xl mx-auto"}`}
          >
            {data.description}
          </motion.p>

          <div className="flex flex-col items-center">
            {(data.priceOld || data.priceNew) && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="text-sm md:text-base mb-6 text-center w-full"
                style={{ color: "#352F54" }}
              >
                {data.priceOld && <span className="line-through text-gray-400 mr-2">De {data.priceOld}</span>}
                {data.priceNew && <span className="font-bold">→ {data.priceNew}</span>}
                {data.installments && <span className="text-gray-700"> ou {data.installments}</span>}
                {data.accessYears && <span className="text-gray-700"> · {data.accessYears}</span>}
              </motion.p>
            )}

            <motion.button
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onClick={onCtaClick}
              className="group inline-flex items-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-7 md:px-10 py-3.5 md:py-4 shadow-md hover:shadow-xl transition-all hover:scale-[1.03] rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center text-white whitespace-nowrap"
              style={{ background: branding.darkColor }}
            >
              {data.ctaText}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>

        {heroImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="order-first md:order-last"
          >
            <img
              src={heroImage}
              alt={courseName}
              className="w-full max-w-[280px] h-[240px] md:h-[320px] mx-auto object-cover rounded-tl-[3rem] rounded-br-[3rem] rounded-tr-md rounded-bl-md shadow-lg"
            />
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default CourseHero;
