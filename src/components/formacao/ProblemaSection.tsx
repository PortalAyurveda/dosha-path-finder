import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["problema"];
  branding: FormacaoData["branding"];
}

const ProblemaSection = ({ data, branding }: Props) => (
  <section className="py-12 md:py-16" style={{ background: "#FFF7ED" }}>
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
        {data.intro}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className="relative p-7 md:p-8 mb-8 rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm shadow-lg text-white"
        style={{ background: branding.darkColor }}
      >
        <Quote
          className="absolute top-4 left-4 h-10 w-10 md:h-12 md:w-12 opacity-20"
          style={{ color: branding.accentColor }}
          strokeWidth={1.5}
        />
        <div className="relative pl-6 md:pl-8">
          <p
            className="font-serif italic font-bold text-base md:text-lg mb-3 leading-snug"
            style={{ color: branding.accentColor }}
          >
            {data.box.title}
          </p>
          <p className="text-sm md:text-base text-white leading-relaxed whitespace-pre-line">
            {data.box.body}
          </p>
        </div>
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
