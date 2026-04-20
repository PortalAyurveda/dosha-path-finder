import { motion } from "framer-motion";
import { Calendar, Heart, Users, Award, Sparkles, Check, type LucideIcon } from "lucide-react";
import type { CourseBonusData, CourseBranding } from "@/data/courses/courseTypes";

const ICONS: Record<string, LucideIcon> = { Calendar, Heart, Users, Award, Sparkles };

interface BonusSectionProps {
  data: CourseBonusData;
  branding: CourseBranding;
}

const BonusSection = ({ data, branding }: BonusSectionProps) => {
  return (
    <section className="py-10 md:py-14" style={{ background: "#FAF9F6" }}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">
          <div>
            <h3 className="font-serif font-bold text-lg md:text-xl mb-4" style={{ color: "#352F54" }}>
              Inclusos no curso
            </h3>
            <ul className="space-y-2.5">
              {data.included.map((item, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex items-start gap-3"
                >
                  <span
                    className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: branding.darkColor }}
                  >
                    <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm md:text-base text-gray-700 leading-relaxed">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg md:text-xl mb-4" style={{ color: "#352F54" }}>
              Bônus exclusivos
            </h3>
            <div className="space-y-3.5">
              {data.bonuses.map((bonus, i) => {
                const Icon = ICONS[bonus.iconName] ?? Sparkles;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    className="flex items-start gap-3.5 p-4 bg-white border border-gray-200 shadow-sm rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
                  >
                    <span
                      className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: `${branding.primaryColor}40` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: branding.darkColor }} />
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm md:text-base leading-snug" style={{ color: "#352F54" }}>
                        {bonus.title}
                      </h4>
                      {bonus.description && (
                        <p className="text-xs md:text-sm text-gray-600 mt-1">{bonus.description}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BonusSection;
