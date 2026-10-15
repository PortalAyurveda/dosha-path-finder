import { readFileSync } from "node:fs";
import ts from "typescript";
import { afterEach, describe, expect, it, vi } from "vitest";

// Exercise the actual permission expressions without changing the supplied front-end code.
function permission(file: string, name: string, profile: unknown): boolean {
  const source = ts.createSourceFile(file, readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let expression: string | undefined;
  function visit(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name && node.initializer) {
      expression = node.initializer.getText(source);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!expression) throw new Error(`Missing permission ${name} in ${file}`);
  const js = ts.transpile(`(${expression})`, { target: ts.ScriptTarget.ES2020 });
  return Boolean(new Function("profile", `return ${js}`)(profile));
}

afterEach(() => vi.useRealTimers());

describe("Meu Dosha routine access", () => {
  const check = (profile: unknown) => permission("src/pages/MeuDosha.tsx", "temAcessoRotina", profile);
  it("includes premium independently of subscription status or expiry", () => {
    expect(check({ is_premium: true, subscription_status: "canceled", premium_until: "2000-01-01" })).toBe(true);
    expect(check(null)).toBe(false);
  });
  it.each(["rotina", "mensal", "anual"])("includes an active %s plan without an expiry", (plano) => {
    expect(check({ subscription_status: "active", plano })).toBe(true);
    expect(check({ subscription_status: "canceled", plano })).toBe(false);
  });
  it("requires a future expiry when supplied", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-14T02:24:00Z"));
    expect(check({ subscription_status: "active", plano: "rotina", premium_until: "2026-10-15T00:00:00Z" })).toBe(true);
    expect(check({ subscription_status: "active", plano: "rotina", premium_until: "2026-10-14T02:24:00Z" })).toBe(false);
    expect(check({ subscription_status: "active", plano: "rotina", premium_until: "2026-10-13T00:00:00Z" })).toBe(false);
  });
  it("excludes other plans even when active", () => {
    expect(check({ subscription_status: "active", plano: "outro" })).toBe(false);
  });
});

describe("Premium inclusion", () => {
  it.each([
    ["src/components/meudosha/ArtigosTab.tsx", "isAssinante"],
    ["src/components/meudosha/VideosTab.tsx", "isAssinante"],
    ["src/components/akasha/MemoriaBadge.tsx", "ativo"],
  ])("includes premium or active subscribers in %s", (file, name) => {
    expect(permission(file, name, { is_premium: true, subscription_status: "canceled" })).toBe(true);
    expect(permission(file, name, { is_premium: false, subscription_status: "active" })).toBe(true);
    expect(permission(file, name, { is_premium: false, subscription_status: "canceled" })).toBe(false);
    expect(permission(file, name, null)).toBe(false);
  });
});