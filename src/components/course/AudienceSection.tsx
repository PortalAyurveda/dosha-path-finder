import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CourseAudienceData, CourseBranding } from "@/data/courses/courseTypes";

interface AudienceSectionProps {
  data: CourseAudienceData;
  branding: CourseBranding;
}

const AudienceSection = ({ data, branding }: AudienceSectionProps) => {
  return (
    <section className="bg-white py-12 md:py-20">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-5xl text-foreground mb-12 text-center"
        >
          {data.title}
        </motion.h2>

        <ul className="space-y-5">
          {data.audiences.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-start gap-4 md:gap-5"
            >
              <span
                className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mt-0.5 shadow-md"
                style={{ background: branding.darkColor }}
              >
                <Check className="h-5 w-5 md:h-6 md:w-6 text-white" strokeWidth={3} />
              </span>
              <div>
                <h3 className="font-serif font-bold text-lg md:text-xl text-foreground leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-foreground/70 mt-1">
                  {item.description}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AudienceSection;
