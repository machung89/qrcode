"use client";

import { useEffect, useRef } from "react";

/**
 * Chèn mã quảng cáo HTML/JS tùy ý. Dùng createContextualFragment để
 * các thẻ <script> (inline hoặc src) được thực thi, khác với innerHTML.
 */
export function AdCode({ code, className }: { code: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.replaceChildren(document.createRange().createContextualFragment(code));
    return () => el.replaceChildren();
  }, [code]);

  return <div ref={ref} className={className} />;
}

/** Chèn mã vào <head> hoặc cuối <body>, mỗi mẫu chỉ 1 lần trong suốt phiên. */
export function injectOnce(id: string, code: string, target: HTMLElement) {
  if (document.querySelector(`[data-ad-unit="${CSS.escape(id)}"]`)) return;
  const fragment = document.createRange().createContextualFragment(code);
  const nodes = Array.from(fragment.childNodes);
  if (!nodes.some((n) => n instanceof Element)) {
    const marker = document.createElement("template");
    marker.dataset.adUnit = id;
    target.appendChild(marker);
  }
  for (const node of nodes) {
    if (node instanceof Element) node.setAttribute("data-ad-unit", id);
    target.appendChild(node);
  }
}
