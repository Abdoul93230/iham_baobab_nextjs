"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const prevPath = useRef(pathname);
  const [width, setWidth] = useState(0);
  const [visible, setVisible] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clear = () => timers.current.forEach(clearTimeout);

  const complete = () => {
    clear();
    setWidth(100);
    const t = setTimeout(() => { setVisible(false); setWidth(0); }, 300);
    timers.current = [t];
  };

  // Fires when the new page has actually mounted (navigation done)
  useEffect(() => {
    if (pathname !== prevPath.current) {
      prevPath.current = pathname;
      complete();
    }
  }, [pathname]);

  // Public API: expose start so link wrappers can call it
  useEffect(() => {
    const handler = () => {
      clear();
      setVisible(true);
      setWidth(15);
      const t1 = setTimeout(() => setWidth(40), 200);
      const t2 = setTimeout(() => setWidth(65), 600);
      const t3 = setTimeout(() => setWidth(80), 1200);
      timers.current = [t1, t2, t3];
    };
    window.addEventListener("navstart", handler);
    return () => window.removeEventListener("navstart", handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-[9999] h-[2px] pointer-events-none">
      <div
        className="h-full bg-[#30A08B] transition-all ease-out"
        style={{ width: `${width}%`, transitionDuration: width === 100 ? "150ms" : "400ms" }}
      />
    </div>
  );
}

// Call this before any router.push() to immediately show the bar
export function triggerNavProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("navstart"));
  }
}
