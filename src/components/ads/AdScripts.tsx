"use client";

import { useEffect } from "react";
import { injectOnce } from "./AdCode";
import { useAds } from "./AdsProvider";

/** Mã toàn trang: vị trí "head" (thẻ script/meta trong <head>) và "body_end". */
export function AdScripts() {
  const head = useAds("head");
  const bodyEnd = useAds("body_end");

  useEffect(() => {
    for (const u of head) injectOnce(u.id, u.code, document.head);
    for (const u of bodyEnd) injectOnce(u.id, u.code, document.body);
  }, [head, bodyEnd]);

  return null;
}
