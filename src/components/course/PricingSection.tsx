import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import type { CoursePricingData, CourseBranding } from "@/data/courses/courseTypes";

interface PricingSectionProps {
  data: CoursePricingData;
  branding: CourseBranding;
  onCtaClick: () => void;
}

const PricingSection = ({ data, branding, onCtaClick }: PricingSectionProps) => {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center bg-white border border-gray-200 shadow-sm p-8 md:p-12 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
        >
          <span
            className="text-xs md:text-sm uppercase tracking-widest font-bold"
            style={{ color: branding.darkColor }}
          >
            Investimento
          </span>

          <p className="text-lg md:text-xl line-through text-gray-400 mt-5 mb-1">
            {data.priceOld}
          </p>

          <p
            className="font-serif font-bold text-5xl md:text-6xl mb-3 leading-none"
            style={{ color: "#352F54" }}
          >
            {data.priceNew}
          </p>

          <p className="text-base md:text-lg text-gray-700 mb-2">
            ou <span className="font-bold">{data.installments}</span>
          </p>

          <p className="text-sm md:text-base text-gray-500 italic mb-8">
            {data.highlight}
          </p>

          <motion.button
            onClick={onCtaClick}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="group inline-flex items-center gap-3 font-bold text-sm md:text-base uppercase tracking-wide px-8 md:px-12 py-4 md:py-5 shadow-md hover:shadow-xl transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm w-full md:w-auto justify-center"
            style={{
              background: branding.darkColor,
              color: "#FFFFFF",
            }}
          >
            {data.ctaText}
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div
            className="mt-8 inline-flex items-start gap-3 p-4 max-w-xl mx-auto border border-gray-200 bg-gray-50 rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm text-left"
          >
            <span
              className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: branding.darkColor }}
            >
              <ShieldCheck className="h-5 w-5 text-white" />
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">
              {data.guarantee}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
