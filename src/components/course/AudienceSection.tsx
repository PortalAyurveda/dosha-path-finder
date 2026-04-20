import { motion } from "framer-motion";
import { Check } from "lucide-react";
import type { CourseAudienceData, CourseBranding } from "@/data/courses/courseTypes";

interface AudienceSectionProps {
  data: CourseAudienceData;
  branding: CourseBranding;
}

const AudienceSection = ({ data, branding }: AudienceSectionProps) => {
  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-4xl mb-10 text-center"
          style={{ color: "#352F54" }}
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
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex items-start gap-4"
            >
              <span
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center mt-0.5"
                style={{ background: branding.darkColor }}
              >
                <Check className="h-5 w-5 text-white" strokeWidth={3} />
              </span>
              <div>
                <h3
                  className="font-serif font-bold text-lg md:text-xl leading-snug"
                  style={{ color: "#352F54" }}
                >
                  {item.title}
                </h3>
                <p className="text-base text-gray-700 mt-1">
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
