import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import type { CourseTestimonial, CourseBranding } from "@/data/courses/courseTypes";

interface TestimonialsSectionProps {
  testimonials: CourseTestimonial[];
  branding: CourseBranding;
}

const TestimonialsSection = ({ testimonials, branding }: TestimonialsSectionProps) => {
  return (
    <section className="py-12 md:py-16" style={{ background: "#FAF9F6" }}>
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="font-serif italic font-bold text-3xl md:text-4xl mb-10 text-center"
          style={{ color: "#352F54" }}
        >
          O que nossos alunos dizem
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {testimonials.map((t, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: (i % 2) * 0.08 }}
              className="relative bg-white p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow rounded-tl-3xl rounded-br-3xl rounded-tr-sm rounded-bl-sm"
            >
              <Quote
                className="absolute top-4 right-4 h-7 w-7 opacity-40"
                style={{ color: branding.darkColor }}
                fill="currentColor"
              />
              <p
                className="font-bold text-sm uppercase tracking-wide mb-3 pr-10"
                style={{ color: branding.darkColor }}
              >
                "{t.highlight}"
              </p>
              <p className="text-base text-gray-700 leading-relaxed mb-4">
                {t.quote}
              </p>
              <p className="font-bold text-sm" style={{ color: "#352F54" }}>
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
