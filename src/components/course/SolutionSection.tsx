import { motion } from "framer-motion";
import { Brain, Sparkles, Target, Heart, Calendar, Users, Award, Zap, type LucideIcon } from "lucide-react";
import type { CourseSolutionData, CourseBranding } from "@/data/courses/courseTypes";

const ICONS: Record<string, LucideIcon> = {
  Brain, Sparkles, Target, Heart, Calendar, Users, Award, Zap,
};

interface SolutionSectionProps {
  data: CourseSolutionData;
  branding: CourseBranding;
}

const SolutionSection = ({ data, branding }: SolutionSectionProps) => {
  return (
    <section className="py-10 md:py-14" style={{ background: "#FAF9F6" }}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-3 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm md:text-base text-gray-700 max-w-2xl mx-auto text-center mb-10 leading-relaxed"
        >
          {data.description}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {data.benefits.map((benefit, i) => {
            const Icon = ICONS[benefit.iconName] ?? Brain;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="bg-white p-5 md:p-6 shadow-sm hover:shadow-md border border-gray-100 transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: `${branding.primaryColor}40` }}
                >
                  <Icon className="h-6 w-6" style={{ color: branding.darkColor }} />
                </div>
                <h3
                  className="font-serif font-bold text-lg md:text-xl mb-2.5"
                  style={{ color: "#352F54" }}
                >
                  {benefit.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 leading-relaxed">
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
