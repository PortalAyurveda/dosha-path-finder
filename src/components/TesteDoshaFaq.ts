import { createElement as h } from "react";
import { TESTE_DOSHA_FAQ } from "@/lib/testeDoshaFaq";

export default function TesteDoshaFaq() {
  return h(
    "section",
    { className: "mt-8" },
    h("h2", { className: "font-serif text-base font-medium text-muted-foreground text-center mb-2" }, "Dúvidas sobre o teste"),
    ...TESTE_DOSHA_FAQ.map((f) =>
      h(
        "details",
        { key: f.q, className: "group border-b border-border" },
        h(
          "summary",
          { className: "flex items-center justify-between gap-3 py-4 cursor-pointer list-none text-[15px] text-foreground [&::-webkit-details-marker]:hidden" },
          h("span", null, f.q),
          h("span", { className: "text-lg text-primary/70 group-open:hidden", "aria-hidden": true }, "+"),
          h("span", { className: "text-lg text-primary/70 hidden group-open:inline", "aria-hidden": true }, "−"),
        ),
        h("p", { className: "text-sm leading-relaxed text-muted-foreground pb-4" }, f.a),
      ),
    ),
  );
}
