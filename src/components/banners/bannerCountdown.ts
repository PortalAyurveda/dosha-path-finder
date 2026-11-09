/** Update only countdown fields; all other CMS HTML remains untouched. */
export function mountBannerCountdown(root: HTMLElement): () => void {
  const counters = Array.from(root.querySelectorAll<HTMLElement>("[data-contagem]"))
    .map((element) => ({
      element,
      deadline: Date.parse(element.dataset.contagem ?? ""),
      fields: Array.from(element.querySelectorAll<HTMLElement>("[data-un]"))
        .filter((field) => field.closest("[data-contagem]") === element),
    }))
    .filter((counter) => Number.isFinite(counter.deadline));

  if (counters.length === 0) return () => {};

  const visible = new Set<HTMLElement>();
  let timer: ReturnType<typeof setInterval> | undefined;

  const update = (counter: typeof counters[number]) => {
    const seconds = Math.max(0, Math.floor((counter.deadline - Date.now()) / 1000));
    const values: Record<string, number> = {
      d: Math.floor(seconds / 86400),
      h: Math.floor(seconds / 3600) % 24,
      m: Math.floor(seconds / 60) % 60,
      s: seconds % 60,
    };
    for (const field of counter.fields) {
      const value = values[field.dataset.un ?? ""];
      if (value !== undefined) field.textContent = String(value).padStart(2, "0");
    }
  };

  const stop = () => {
    if (timer !== undefined) clearInterval(timer);
    timer = undefined;
  };

  const tick = () => {
    for (const counter of counters) {
      if (visible.has(counter.element)) update(counter);
    }
    if (!counters.some((counter) => visible.has(counter.element) && counter.deadline > Date.now())) stop();
  };

  // Populate immediately, then run only while a countdown is on screen.
  counters.forEach(update);
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.add(entry.target as HTMLElement);
      else visible.delete(entry.target as HTMLElement);
    }
    tick();
    if (timer === undefined && counters.some((counter) => visible.has(counter.element) && counter.deadline > Date.now())) {
      timer = setInterval(tick, 1000);
    }
  });
  counters.forEach((counter) => observer.observe(counter.element));

  return () => {
    stop();
    observer.disconnect();
  };
}