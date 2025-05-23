"use client";

import { useEffect } from "react";

export function TempoInit() {
  useEffect(() => {
    const init = async () => {
      if (process.env.NEXT_PUBLIC_TEMPO && typeof window !== "undefined") {
        const { TempoDevtools } = await import("tempo-devtools");
        TempoDevtools.init();
      }
    };

    init();
  }, []);

  return null;
}
