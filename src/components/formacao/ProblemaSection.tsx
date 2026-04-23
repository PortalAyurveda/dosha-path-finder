import { motion } from "framer-motion";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["problema"];
  branding: FormacaoData["branding"];
}

const ProblemaSection = ({ data, branding }: Props) => (
  <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
    <div className="max-w-2xl mx-auto px-6">
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
        {data.intro}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="p-6 md:p-7 mb-8 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm border-l-4"
        style={{
          background: `${branding.primaryColor}18`,
          borderColor: branding.darkColor,
        }}
      >
        <p
          className="font-serif italic font-bold text-base md:text-lg mb-3 leading-snug"
          style={{ color: branding.darkColor }}
        >
          {data.box.title}
        </p>
        <p className="text-sm md:text-base text-gray-800 leading-relaxed whitespace-pre-line">
          {data.box.body}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line"
      >
        {data.closing}
      </motion.div>
    </div>
  </section>
);

export default ProblemaSection;
