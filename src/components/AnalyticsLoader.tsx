import { useEffect } from "react";

/**
 * Loads third-party analytics (GA4, Meta Pixel, Microsoft Clarity)
 * ONLY on first user interaction or after idle, so they don't compete
 * with the React app for FCP/LCP. Synchronous stubs queue any early
 * events so nothing is lost.
 */
const GA_ID = "G-VN454LL7QF";
const FB_PIXEL_ID = "727901213560105";
const CLARITY_ID = "wqrw7kj8n1";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const w = typeof window !== "undefined" ? (window as any) : ({} as any);

let stubsInstalled = false;
let loaded = false;

const installStubs = () => {
  if (stubsInstalled || typeof window === "undefined") return;
  stubsInstalled = true;

  // GA / GTM stub
  w.dataLayer = w.dataLayer || [];
  if (!w.gtag) {
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer.push(arguments);
    };
    w.gtag("js", new Date());
    w.gtag("config", GA_ID);
  }

  // Meta Pixel stub with queue
  if (!w.fbq) {
    const n: any = function () {
      // eslint-disable-next-line prefer-rest-params
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    w.fbq = n;
    w._fbq = n;
    w.fbq("init", FB_PIXEL_ID);
    w.fbq("track", "PageView");
  }

  // Clarity stub with queue
  if (!w.clarity) {
    w.clarity = function () {
      (w.clarity.q = w.clarity.q || []).push(arguments);
    };
  }
};

const loadAnalytics = () => {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  installStubs();

  // GA4
  const gaScript = document.createElement("script");
  gaScript.async = true;
  gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(gaScript);

  // Meta Pixel
  const fbScript = document.createElement("script");
  fbScript.async = true;
  fbScript.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(fbScript);

  // Microsoft Clarity
  const clarityScript = document.createElement("script");
  clarityScript.async = true;
  clarityScript.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(clarityScript);
};

const AnalyticsLoader = () => {
  useEffect(() => {
    if (loaded) return;
    installStubs();

    const events: Array<keyof WindowEventMap> = ["pointerdown", "keydown", "scroll"];
    const trigger = () => {
      cleanup();
      loadAnalytics();
    };
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, trigger));
      if (idleId && "cancelIdleCallback" in window) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).cancelIdleCallback(idleId);
      }
      if (timeoutId) window.clearTimeout(timeoutId);
    };

    events.forEach((e) =>
      window.addEventListener(e, trigger, { once: true, passive: true } as AddEventListenerOptions),
    );

    let idleId: number | undefined;
    let timeoutId: number | undefined;
    const scheduleIdle = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ric: any = (window as any).requestIdleCallback;
      if (typeof ric === "function") {
        idleId = ric(trigger, { timeout: 5000 });
      } else {
        timeoutId = window.setTimeout(trigger, 5000);
      }
    };

    if (document.readyState === "complete") {
      scheduleIdle();
    } else {
      window.addEventListener("load", scheduleIdle, { once: true });
    }

    return cleanup;
  }, []);

  return null;
};

export default AnalyticsLoader;
