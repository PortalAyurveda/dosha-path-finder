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
    <section className="py-12 md:py-16" style={{ background: "linear-gradient(180deg, #F5FBF7 0%, #FAF9F6 100%)" }}>
      <div className="max-w-2xl mx-auto px-6 text-center" style={{ color: "#352F54" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-lg md:text-xl mb-6 leading-relaxed"
          style={{ color: "#352F54" }}
        >
          <p>{data.headline}</p>
        </motion.div>

        {data.subheadline && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm md:text-base max-w-xl mx-auto mb-8 leading-relaxed"
          >
            {data.subheadline}
          </motion.p>
        )}

        {data.priceNew && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center gap-1 mb-7"
          >
            <p className="text-sm md:text-base">
              {data.priceOld && <span className="line-through text-gray-500 mr-2">De {data.priceOld}</span>}
              <span className="font-serif font-bold text-2xl md:text-3xl" style={{ color: "#352F54" }}>→ {data.priceNew}</span>
            </p>
            {data.installments && <p className="text-xs md:text-sm" style={{ color: "#352F54" }}>{data.installments}{data.highlight ? ` · ${data.highlight}` : ""}</p>}
          </motion.div>
        )}

        <div className="flex justify-center">
          <motion.button
            onClick={onCtaClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="group inline-flex items-center gap-2.5 font-bold text-xs md:text-sm uppercase tracking-wide px-7 md:px-10 py-3.5 md:py-4 shadow-lg hover:shadow-xl rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center whitespace-nowrap"
            style={{ background: branding.darkColor, color: "#352F54" }}
          >
            {data.ctaText}
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>

        {data.quote && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10"
          >
            <p className="font-serif italic text-base md:text-lg whitespace-pre-line" style={{ color: "#352F54" }}>
              "{data.quote}"
            </p>
            {data.quoteAuthor && (
              <p className="text-sm mt-2" style={{ color: "#352F54" }}>— {data.quoteAuthor}</p>
            )}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FinalCTASection;
