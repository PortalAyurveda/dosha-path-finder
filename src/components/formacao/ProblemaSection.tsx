import { motion } from "framer-motion";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["problema"];
  branding: FormacaoData["branding"];
}

// Render **bold** segments inside plain text while preserving line breaks
const renderRich = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
};

const ProblemaSection = ({ data, branding }: Props) => (
  <section className="py-12 md:py-16" style={{ background: "#F0F4FF" }}>
    <div className="max-w-2xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center mb-5"
      >
        <img
          src={branding.bulletSvg}
          alt="Portal Ayurveda"
          className="h-16 md:h-20 w-auto"
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5 }}
        className="font-serif italic font-bold text-2xl md:text-3xl mb-6 text-center"
        style={{ color: branding.darkColor }}
      >
        {data.title}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base text-gray-700 leading-relaxed mb-8 whitespace-pre-line"
      >
        {renderRich(data.intro)}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line"
      >
        {renderRich(data.closing)}
      </motion.div>
    </div>
  </section>
);

export default ProblemaSection;
