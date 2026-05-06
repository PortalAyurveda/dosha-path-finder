import { motion } from "framer-motion";
import type { CourseOpportunityData, CourseBranding } from "@/data/courses/courseTypes";

interface OpportunitySectionProps {
  data: CourseOpportunityData;
  branding: CourseBranding;
}

const OpportunitySection = ({ data, branding }: OpportunitySectionProps) => {
  return (
    <section className="py-10 md:py-14" style={{ background: "#FAF9F6" }}>
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-xl md:text-2xl mb-6 leading-tight whitespace-pre-line"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        {data.paragraphs.map((p, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            className="text-sm md:text-base text-gray-700 leading-relaxed mb-4"
          >
            {p}
          </motion.p>
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="my-7 inline-block px-6 py-4 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
          style={{ background: branding.primaryColor }}
        >
          <p className="font-serif font-bold text-base md:text-lg" style={{ color: "#352F54" }}>
            {data.highlight}
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-sm md:text-base text-gray-700 leading-relaxed"
        >
          {data.closing}
        </motion.p>
      </div>
    </section>
  );
};

export default OpportunitySection;
