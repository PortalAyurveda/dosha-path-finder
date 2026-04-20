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
    <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-4xl mb-4 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-base md:text-lg text-gray-700 max-w-3xl mx-auto text-center mb-12 leading-relaxed"
        >
          {data.description}
        </motion.p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                className="bg-white p-6 md:p-7 shadow-sm hover:shadow-md border border-gray-100 transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-5"
                  style={{ background: `${branding.primaryColor}25` }}
                >
                  <Icon className="h-7 w-7" style={{ color: branding.darkColor }} />
                </div>
                <h3
                  className="font-serif font-bold text-xl md:text-2xl mb-3"
                  style={{ color: "#352F54" }}
                >
                  {benefit.title}
                </h3>
                <p className="text-base text-gray-700 leading-relaxed">
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
