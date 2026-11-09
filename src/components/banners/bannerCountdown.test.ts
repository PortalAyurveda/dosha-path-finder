// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mountBannerCountdown } from "./bannerCountdown";

describe("CMS banner countdown", () => {
  let notify: IntersectionObserverCallback;
  const disconnect = vi.fn();
  const observe = vi.fn();
  let cleanup: () => void;
  const now = Date.parse("2026-11-09T01:32:00Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    observe.mockClear();
    disconnect.mockClear();
    vi.stubGlobal("IntersectionObserver", class {
      constructor(callback: IntersectionObserverCallback) { notify = callback; }
      observe = observe;
      disconnect = disconnect;
    });
    cleanup = () => {};
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  function setup(deadline: string) {
    const root = document.createElement("div");
    root.innerHTML = `<div data-contagem="${deadline}"><span data-un="d"></span><span data-un="h"></span><span data-un="m"></span><span data-un="s"></span></div>`;
    cleanup = mountBannerCountdown(root);
    const counter = root.firstElementChild;
    if (!(counter instanceof HTMLElement)) throw new Error("Missing counter");
    const values = () => Array.from(counter.children).map((field) => field.textContent);
    const visibility = (isIntersecting: boolean) => notify([{
      target: counter, isIntersecting, time: Date.now(),
      boundingClientRect: counter.getBoundingClientRect(),
      intersectionRect: counter.getBoundingClientRect(), rootBounds: null,
      intersectionRatio: isIntersecting ? 1 : 0,
    }], {} as IntersectionObserver);
    return { values, visibility };
  }

  it("shows ISO date differences as padded days, hours, minutes and seconds", () => {
    const { values } = setup("2026-11-11T04:36:05Z");
    expect(values()).toEqual(["02", "03", "04", "05"]);
  });

  it("updates every second while visible", () => {
    const { values, visibility } = setup("2026-11-09T01:32:05Z");
    visibility(true);
    vi.advanceTimersByTime(1000);
    expect(values()).toEqual(["00", "00", "00", "04"]);
  });

  it("stays at 00 when the deadline arrives and releases the timer", () => {
    const { values, visibility } = setup("2026-11-09T01:32:01Z");
    visibility(true);
    vi.advanceTimersByTime(3000);
    expect(values()).toEqual(["00", "00", "00", "00"]);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops off screen and catches up to real time when shown again", () => {
    const { values, visibility } = setup("2026-11-09T01:33:00Z");
    visibility(true);
    visibility(false);
    expect(vi.getTimerCount()).toBe(0);
    vi.advanceTimersByTime(10000);
    expect(values()).toEqual(["00", "00", "01", "00"]);
    visibility(true);
    expect(values()).toEqual(["00", "00", "00", "50"]);
  });

  it("leaves banners without data-contagem unchanged and creates no observer or timer", () => {
    const root = document.createElement("div");
    root.innerHTML = '<a href="/assina"><span data-un="s">Oferta</span></a>';
    const original = root.innerHTML;
    cleanup = mountBannerCountdown(root);
    expect(root.innerHTML).toBe(original);
    expect(observe).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("disconnects and clears timers on banner removal", () => {
    const { visibility } = setup("2026-11-09T01:33:00Z");
    visibility(true);
    cleanup();
    expect(disconnect).toHaveBeenCalledOnce();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("ignores invalid dates without changing their fields", () => {
    const root = document.createElement("div");
    root.innerHTML = '<div data-contagem="invalid"><span data-un="s">Original</span></div>';
    cleanup = mountBannerCountdown(root);
    expect(root.textContent).toBe("Original");
    expect(vi.getTimerCount()).toBe(0);
  });
});