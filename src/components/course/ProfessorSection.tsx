import { motion } from "framer-motion";
import type { CourseProfessorData, CourseBranding } from "@/data/courses/courseTypes";

interface ProfessorSectionProps {
  data: CourseProfessorData;
  branding: CourseBranding;
}

const ProfessorSection = ({ data, branding }: ProfessorSectionProps) => {
  return (
    <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto md:mx-0"
          >
            <div
              className="w-[260px] h-[260px] md:w-[340px] md:h-[340px] overflow-hidden shadow-md rounded-t-full rounded-b-none"
              style={{ border: `5px solid ${branding.primaryColor}` }}
            >
              <img
                src={data.photo}
                alt={data.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <p
              className="text-xs uppercase tracking-widest font-bold mb-3"
              style={{ color: branding.darkColor }}
            >
              Conheça seu professor
            </p>
            <h2
              className="font-serif italic font-bold text-3xl md:text-4xl mb-5"
              style={{ color: "#352F54" }}
            >
              {data.name}
            </h2>
            <div className="space-y-3">
              {data.bio.map((para, i) => (
                <p key={i} className="text-base text-gray-700 leading-relaxed">
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfessorSection;
