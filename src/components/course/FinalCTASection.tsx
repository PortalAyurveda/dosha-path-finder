import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { CourseFinalCTAData, CourseBranding } from "@/data/courses/courseTypes";

interface FinalCTASectionProps {
  data: CourseFinalCTAData;
  branding: CourseBranding;
  onCtaClick: () => void;
}

const FinalCTASection = ({ data, branding, onCtaClick }: FinalCTASectionProps) => {
  return (
    <section className="py-12 md:py-16" style={{ background: branding.primaryColor }}>
      <div className="max-w-2xl mx-auto px-6 text-center" style={{ color: "#352F54" }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-4 leading-tight"
          style={{ color: "#352F54" }}
        >
          {data.headline}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed"
          style={{ color: "#352F54" }}
        >
          {data.subheadline}
        </motion.p>

        {data.priceNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex flex-col items-center gap-1 mb-7"
          >
            <p className="font-serif font-bold text-3xl md:text-4xl text-secondary">{data.priceNew}</p>
            {data.installments && <p className="text-xs md:text-sm text-white/80">ou {data.installments}</p>}
            {data.highlight && (
              <p className="text-[11px] md:text-xs text-white/70 italic mt-1.5 max-w-md">
                {data.highlight}
              </p>
            )}
          </motion.div>
        )}

        <motion.button
          onClick={onCtaClick}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="group inline-flex items-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-7 md:px-10 py-3.5 md:py-4 shadow-lg hover:shadow-xl rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto md:max-w-md justify-center text-white"
          style={{ background: "#352F54" }}
        >
          {data.ctaText}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>
    </section>
  );
};

export default FinalCTASection;
