import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, Check, Calendar, Heart, Users, Award, Sparkles, type LucideIcon } from "lucide-react";
import type { CoursePricingData, CourseBranding, CourseBonusData } from "@/data/courses/courseTypes";

const ICONS: Record<string, LucideIcon> = { Calendar, Heart, Users, Award, Sparkles };

interface PricingSectionProps {
  data: CoursePricingData;
  branding: CourseBranding;
  bonus?: CourseBonusData;
  onCtaClick: () => void;
}

const PricingSection = ({ data, branding, bonus, onCtaClick }: PricingSectionProps) => {
  return (
    <section className="py-10 md:py-14 bg-white">
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white border border-gray-200 shadow-sm p-7 md:p-10 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
        >
          <span
            className="text-[11px] md:text-xs uppercase tracking-widest font-bold"
            style={{ color: branding.darkColor }}
          >
            Investimento
          </span>

          <p className="text-base md:text-lg line-through text-gray-400 mt-4 mb-1">
            {data.priceOld}
          </p>

          <p
            className="font-serif font-bold text-4xl md:text-5xl mb-2.5 leading-none"
            style={{ color: "#352F54" }}
          >
            {data.priceNew}
          </p>

          <p className="text-sm md:text-base text-gray-700 mb-1.5">
            ou <span className="font-bold">{data.installments}</span>
          </p>

          <p className="text-xs md:text-sm text-gray-500 italic mb-7">
            {data.highlight}
          </p>

          <motion.button
            onClick={onCtaClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-7 md:px-10 py-3.5 md:py-4 shadow-md hover:shadow-xl transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center text-white"
            style={{ background: branding.darkColor }}
          >
            {data.ctaText}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="mt-7 inline-flex items-start gap-3 p-3.5 max-w-lg mx-auto border border-gray-200 bg-gray-50 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm text-left">
            <span
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: branding.darkColor }}
            >
              <ShieldCheck className="h-4 w-4 text-white" />
            </span>
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
              {data.guarantee}
            </p>
          </div>

          {bonus && (
            <div className="mt-8 pt-7 border-t border-gray-200 text-left">
              <h3 className="font-serif font-bold text-lg md:text-xl mb-4 text-center" style={{ color: "#352F54" }}>
                {bonus.title}
              </h3>
              <ul className="space-y-2.5 mb-6">
                {bonus.included.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5"
                      style={{ background: branding.darkColor }}
                    >
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </span>
                    <span className="text-sm md:text-base text-gray-700 leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              <h4 className="font-bold text-sm md:text-base mb-3 text-center uppercase tracking-wide" style={{ color: branding.darkColor }}>
                Bônus exclusivos
              </h4>
              <div className="space-y-2.5">
                {bonus.bonuses.map((b, i) => {
                  const Icon = ICONS[b.iconName] ?? Sparkles;
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 border border-gray-200 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
                      style={{ background: `${branding.primaryColor}20` }}
                    >
                      <span
                        className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: `${branding.primaryColor}60` }}
                      >
                        <Icon className="h-4.5 w-4.5" style={{ color: branding.darkColor }} />
                      </span>
                      <div className="flex-1">
                        <h5 className="font-bold text-sm md:text-base leading-snug" style={{ color: "#352F54" }}>
                          {b.title}
                        </h5>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
