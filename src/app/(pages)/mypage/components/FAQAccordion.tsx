"use client";

import { useState } from "react";

export type FaqItem = {
  q: string;
  a: string | React.ReactNode;
};

export default function FAQAccordion({
  items,
  title = "FAQ",
  className = "",
}: {
  items: FaqItem[];
  title?: string;
  className?: string;
}) {
  const [openMap, setOpenMap] = useState<Record<number, boolean>>({});

  return (
    <section className={`px-6 md:px-12 py-14 overflow-visible ${className}`}>
      <h2 className="text-white text-4xl font-bold pl-[40px] md:pl-[100px]">
        {title}
      </h2>

      <ul className="list-none divide-y divide-white/20">
        {items.map((it, idx) => {
          const isOpen = !!openMap[idx];
          return (
            <li
              key={idx}
              className={`py-6 md:py-10 bg-transparent ${
                isOpen ? "pb-[20px] md:pb-[20px]" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-6">
                <p className="text-white text-[22px] md:text-[36px] leading-tight font-semibold">
                  {it.q}
                </p>

                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-${idx}`}
                  onClick={() =>
                    setOpenMap((prev) => ({ ...prev, [idx]: !prev[idx] }))
                  }
                  className="
                    shrink-0 p-2
                    bg-transparent border-0 rounded-none
                    outline-none ring-0 shadow-none
                    hover:bg-transparent focus:bg-transparent
                    appearance-none
                  "
                >
                  {!isOpen ? (
                    <svg width="28" height="28" viewBox="0 0 24 24">
                      <path
                        d="M12 5v14M5 12h14"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24">
                      <path
                        d="M5 12h14"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {isOpen && (
                <div id={`faq-${idx}`} className="pt-8 md:pt-10">
                  <div className="text-white/85 text-base md:text-xl leading-relaxed">
                    {it.a}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
