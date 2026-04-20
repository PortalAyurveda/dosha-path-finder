import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import type { CourseModulesData, CourseBranding } from "@/data/courses/courseTypes";

interface ModulesSectionProps {
  data: CourseModulesData;
  branding: CourseBranding;
}

const ModulesSection = ({ data, branding }: ModulesSectionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-4xl mb-10 text-center"
          style={{ color: "#352F54" }}
        >
          {data.title}
        </motion.h2>

        <div className="space-y-3">
          {data.modules.map((mod, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={mod.number}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-white border border-gray-200 hover:border-gray-300 shadow-sm transition-all rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 md:gap-5 p-5 md:p-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className="shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-lg md:text-xl text-white"
                    style={{ background: branding.darkColor }}
                  >
                    {mod.number}
                  </span>
                  <h3
                    className="flex-1 font-serif font-bold text-lg md:text-xl leading-tight"
                    style={{ color: "#352F54" }}
                  >
                    {mod.title}
                  </h3>
                  <ChevronDown
                    className="shrink-0 h-5 w-5 text-gray-500 transition-transform duration-300"
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
                      <div className="px-5 md:px-6 pb-6 pl-[76px] md:pl-[88px]">
                        <p className="text-base text-gray-700 leading-relaxed mb-4">
                          {mod.description}
                        </p>
                        {mod.highlights && mod.highlights.length > 0 && (
                          <ul className="space-y-2 mt-3">
                            {mod.highlights.map((h, hi) => (
                              <li key={hi} className="flex items-start gap-3">
                                <span
                                  className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-1"
                                  style={{ background: branding.darkColor }}
                                >
                                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                                </span>
                                <span className="text-sm md:text-base text-gray-700">{h}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ModulesSection;
