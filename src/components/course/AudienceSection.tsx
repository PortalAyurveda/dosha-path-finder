import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CourseAudienceData, CourseBranding } from "@/data/courses/courseTypes";

interface AudienceSectionProps {
  data: CourseAudienceData;
  branding: CourseBranding;
}

const AudienceSection = ({ data, branding }: AudienceSectionProps) => {
  return (
    <section className="bg-white py-10 md:py-14">
      <div className="max-w-2xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-8 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <ul className="space-y-4">
          {data.audiences.map((item, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-3.5"
            >
              <span
                className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: branding.darkColor }}
              >
                <Check className="h-4 w-4 text-white" strokeWidth={3} />
              </span>
              <div>
                <h3 className="font-serif font-bold text-base md:text-lg leading-snug" style={{ color: "#352F54" }}>
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-gray-700 mt-0.5">
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
