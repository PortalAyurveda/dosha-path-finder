import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { CourseTestimonial, CourseBranding } from "@/data/courses/courseTypes";

interface TestimonialsSectionProps {
  testimonials: CourseTestimonial[];
  branding: CourseBranding;
}

const TestimonialsSection = ({ testimonials, branding }: TestimonialsSectionProps) => {
  return (
    <section className="py-10 md:py-14" style={{ background: "#FAF9F6" }}>
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-2xl md:text-3xl mb-8 text-center"
          style={{ color: "#352F54" }}
        >
          O que nossos alunos dizem
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          {testimonials.map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
              className="relative bg-white p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
            >
              <Quote
                className="absolute top-3.5 right-3.5 h-6 w-6 opacity-40"
                style={{ color: "#3F7A2E" }}
                fill="currentColor"
              />
              <p
                className="font-bold text-xs md:text-sm uppercase tracking-wide mb-2.5 pr-9"
                style={{ color: "#3F7A2E" }}
              >
                "{t.highlight}"
              </p>
              <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-3.5">
                {t.quote}
              </p>
              <p className="font-bold text-xs md:text-sm" style={{ color: "#352F54" }}>
                — {t.name}
              </p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
