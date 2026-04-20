import { motion } from "framer-motion";
import { Brain, Sparkles, Target, Heart, Calendar, Users, Award, Zap, type LucideIcon } from "lucide-react";
import type { CourseSolutionData, CourseBranding } from "@/data/courses/courseTypes";

const ICONS: Record<string, LucideIcon> = {
  Brain,
  Sparkles,
  Target,
  Heart,
  Calendar,
  Users,
  Award,
  Zap,
};

interface SolutionSectionProps {
  data: CourseSolutionData;
  branding: CourseBranding;
}

const SolutionSection = ({ data, branding }: SolutionSectionProps) => {
  return (
    <section className="py-12 md:py-20" style={{ background: branding.warmBg }}>
      <div className="max-w-6xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-5xl text-foreground mb-6 text-center"
        >
          {data.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base md:text-lg text-foreground/80 max-w-3xl mx-auto text-center mb-12 leading-relaxed"
        >
          {data.description}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {data.benefits.map((benefit, i) => {
            const Icon = ICONS[benefit.iconName] ?? Brain;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="bg-white p-6 md:p-8 shadow-md hover:shadow-xl border-2 border-transparent hover:border-current transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
                style={{ color: branding.darkColor }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
                  style={{ background: `${branding.primaryColor}30` }}
                >
                  <Icon className="h-8 w-8" style={{ color: branding.darkColor }} />
                </div>
                <h3 className="font-serif font-bold text-xl md:text-2xl text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-foreground/70 leading-relaxed">
                  {benefit.text}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
