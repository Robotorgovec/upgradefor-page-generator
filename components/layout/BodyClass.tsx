"use client";

import { useEffect } from "react";

export default function BodyClass({ className }: { className: string }) {
  useEffect(() => {
    document.body.classList.add(className);
    const main = document.getElementById("main");
    main?.classList.add(className);
    return () => {
      document.body.classList.remove(className);
      main?.classList.remove(className);
    };
  }, [className]);

  return null;
}
