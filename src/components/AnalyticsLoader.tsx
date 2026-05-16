import { useEffect } from "react";

/**
 * Loads third-party analytics (GA4, Meta Pixel, Microsoft Clarity)
 * AFTER the page has finished loading, so they don't compete with
 * the React app for FCP/LCP. IDs are preserved from the previous
 * inline <head> scripts.
 */
const GA_ID = "G-VN454LL7QF";
const FB_PIXEL_ID = "727901213560105";
const CLARITY_ID = "wqrw7kj8n1";

let loaded = false;

const loadAnalytics = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  // --- Google Analytics 4 ---
  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(gaScript);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).dataLayer = (window as any).dataLayer || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function gtag(...args: any[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).dataLayer.push(args);
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_ID);

  // --- Meta Pixel ---
  /* eslint-disable */
  // @ts-nocheck
  (function (f: any, b: any, e: any, v: any) {
    if (f.fbq) return;
    const n: any = (f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    });
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
    const t: any = b.createElement(e);
    t.async = !0;
    t.src = v;
    const s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  (window as any).fbq("init", FB_PIXEL_ID);
  (window as any).fbq("track", "PageView");
  /* eslint-enable */

  // --- Microsoft Clarity ---
  /* eslint-disable */
  (function (c: any, l: any, a: any, r: any, i: any) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    const t: any = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    const y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", CLARITY_ID);
  /* eslint-enable */
};

const AnalyticsLoader = () => {
  useEffect(() => {
    if (loaded) return;

    let timeoutId: number | undefined;
    const onLoad = () => loadAnalytics();

    if (document.readyState === "complete") {
      timeoutId = window.setTimeout(loadAnalytics, 3000);
    } else {
      window.addEventListener("load", onLoad, { once: true });
      // Fallback: never wait more than 5s after mount
      timeoutId = window.setTimeout(loadAnalytics, 5000);
    }

    return () => {
      window.removeEventListener("load", onLoad);
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  return null;
};

export default AnalyticsLoader;
