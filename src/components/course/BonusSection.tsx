import { motion } from "framer-motion";
import { Calendar, Heart, Users, Award, Sparkles, Check, type LucideIcon } from "lucide-react";
import type { CourseBonusData, CourseBranding } from "@/data/courses/courseTypes";

const ICONS: Record<string, LucideIcon> = {
  Calendar,
  Heart,
  Users,
  Award,
  Sparkles,
};

interface BonusSectionProps {
  data: CourseBonusData;
  branding: CourseBranding;
}

const BonusSection = ({ data, branding }: BonusSectionProps) => {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-5xl text-foreground mb-12 text-center"
        >
          {data.title}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14">
          {/* Inclusos */}
          <div>
            <h3 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-6">
              Inclusos no curso
            </h3>
            <ul className="space-y-3">
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
                    className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center mt-0.5"
                    style={{ background: branding.darkColor }}
                  >
                    <Check className="h-4 w-4 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-sm md:text-base text-foreground/85 leading-relaxed">
                    {item}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Bônus cards */}
          <div>
            <h3 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-6">
              Bônus exclusivos
            </h3>
            <div className="space-y-4">
              {data.bonuses.map((bonus, i) => {
                const Icon = ICONS[bonus.iconName] ?? Sparkles;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-start gap-4 p-5 bg-white shadow-md border-l-4 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm"
                    style={{ borderLeftColor: branding.darkColor }}
                  >
                    <span
                      className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ background: `${branding.primaryColor}30` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: branding.darkColor }} />
                    </span>
                    <div className="flex-1">
                      <h4 className="font-bold text-base md:text-lg text-foreground leading-snug">
                        {bonus.title}
                      </h4>
                      {bonus.description && (
                        <p className="text-sm text-foreground/70 mt-1">{bonus.description}</p>
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
