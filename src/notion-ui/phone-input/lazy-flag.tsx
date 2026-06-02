import { useEffect, useRef, useState } from "react";
import { getFlagCodepoint } from "@/utils/helper";

export const LazyFlag: React.FC<{
  iso2: string;
  className?: string | string;
}> = ({ iso2, className }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string | undefined>(undefined);
  const codepoint = getFlagCodepoint(iso2);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const fullUrl = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/${codepoint}.svg`;

          const fetchAndCacheSvg = async () => {
            try {
              let response = await fetch(fullUrl);
              if (response.ok) {
                const responseClone = response.clone(); // clone BEFORE consuming body
                const svgText = await response.text();

                setSvgContent(svgText);

                if ("caches" in window) {
                  const cache = await caches.open("flags-cache");
                  await cache.put(codepoint, responseClone);
                }
              } else {
                console.error("Failed to fetch SVG", response.statusText);
              }
            } catch (error) {
              console.error("Error fetching SVG:", error);
            }
          };
          const checkCache = async () => {
            if (!("caches" in window)) {
              fetchAndCacheSvg();
              return;
            }

            const cache = await caches.open("flags-cache");
            const cachedResponse = await cache.match(codepoint);

            if (cachedResponse) {
              const svgText = await cachedResponse.text();

              setSvgContent(svgText);
            } else {
              fetchAndCacheSvg();
            }
          };
          checkCache();

          io.disconnect();
        }
      },
      { rootMargin: "550px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [codepoint]);

  return (
    <div ref={ref}>
      {!svgContent ? (
        <div className={`bg-primary rounded-full size-4 animate-pulse`} />
      ) : (
        <div
          ref={ref}
          className={className}
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      )}
    </div>
  );
};
