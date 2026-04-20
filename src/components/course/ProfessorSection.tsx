import { motion } from "framer-motion";
import type { CourseProfessorData, CourseBranding } from "@/data/courses/courseTypes";

interface ProfessorSectionProps {
  data: CourseProfessorData;
  branding: CourseBranding;
}

const ProfessorSection = ({ data, branding }: ProfessorSectionProps) => {
  return (
    <section className="py-12 md:py-20" style={{ background: `${branding.lightColor}40` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-10 md:gap-14 items-start">
          {/* Photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto md:mx-0"
          >
            <div
              className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] overflow-hidden shadow-xl rounded-t-full rounded-b-none"
              style={{ border: `6px solid ${branding.primaryColor}` }}
            >
              <img
                src={data.photo}
                alt={data.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <p
              className="text-sm uppercase tracking-widest font-bold mb-3"
              style={{ color: branding.darkColor }}
            >
              Conheça seu professor
            </p>
            <h2 className="font-serif italic font-bold text-3xl md:text-5xl text-foreground mb-6">
              {data.name}
            </h2>
            <div className="space-y-4">
              {data.bio.map((para, i) => (
                <p key={i} className="text-base md:text-lg text-foreground/85 leading-relaxed">
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
