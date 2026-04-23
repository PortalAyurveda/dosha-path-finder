import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { FormacaoData } from "@/data/courses/formacao";

interface Props {
  data: FormacaoData["faq"];
  branding: FormacaoData["branding"];
}

const FaqSection = ({ data, branding }: Props) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-10 text-center"
          style={{ color: branding.darkColor }}
        >
          {data.title}
        </motion.h2>

        <div className="space-y-3">
          {data.items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 shadow-sm rounded-tl-2xl rounded-br-2xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-3 p-4 md:p-5 text-left"
                  aria-expanded={isOpen}
                >
                  <h3
                    className="flex-1 font-serif font-bold text-sm md:text-base leading-snug"
                    style={{ color: branding.darkColor }}
                  >
                    {item.question}
                  </h3>
                  <ChevronDown
                    className="shrink-0 h-4 w-4 text-gray-500 transition-transform duration-300"
                    style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 md:px-5 pb-5 text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
