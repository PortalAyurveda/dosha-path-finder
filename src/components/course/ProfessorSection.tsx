import { motion } from "framer-motion";
import type { CourseProfessorData, CourseBranding } from "@/data/courses/courseTypes";

interface ProfessorSectionProps {
  data: CourseProfessorData;
  branding: CourseBranding;
}

const ProfessorSection = ({ data, branding }: ProfessorSectionProps) => {
  return (
    <section className="py-10 md:py-14" style={{ background: "#FAF9F6" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-8 md:gap-10 items-stretch">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="mx-auto md:mx-0 h-full"
          >
            <div
              className="w-[200px] md:w-[220px] h-full min-h-[280px] overflow-hidden shadow-md rounded-t-full rounded-b-none"
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
            <p className="text-[11px] uppercase tracking-widest font-bold mb-2.5" style={{ color: branding.darkColor }}>
              Conheça seu professor
            </p>
            <h2 className="font-serif italic font-bold text-2xl md:text-3xl mb-4" style={{ color: "#352F54" }}>
              {data.name}
            </h2>
            <div className="space-y-2.5">
              {data.bio.map((para, i) => (
                <p key={i} className="text-sm md:text-base text-gray-700 leading-relaxed">
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
