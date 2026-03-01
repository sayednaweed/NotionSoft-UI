import React, { forwardRef, useEffect, useRef, useState } from "react";
import { cn } from "../../utils/cn";
import DOMPurify from "dompurify";
import { Shimmer } from "@/components/notion-ui/shimmer";

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

interface BaseSvgProps extends React.HTMLAttributes<HTMLDivElement> {
  classNames?: {
    shimmerClassName?: string;
  };
}

interface FetchSvgProps extends BaseSvgProps {
  src: string;
  fetch: (src: string) => Promise<Response>;
  apiConfig?: never;
}

interface ApiConfigSvgProps extends BaseSvgProps {
  apiConfig: {
    src: string;
    headers?: Record<string, string>;
  };
  src?: never;
  fetch?: never;
}

type CachedSvgProps = FetchSvgProps | ApiConfigSvgProps;

/* ---------------------------------- */
/* Cache */
/* ---------------------------------- */

const SVG_CACHE = "svg-cache-v1";

/* ---------------------------------- */
/* Sanitizer */
/* ---------------------------------- */

function sanitizeSvg(svg: string): string {
  return DOMPurify.sanitize(svg, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: ["script", "foreignObject", "iframe", "object", "embed"],
    FORBID_ATTR: [
      "onload",
      "onclick",
      "onmouseover",
      "onerror",
      "href",
      "xlink:href",
    ],
  });
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

const CachedSvg = forwardRef<HTMLDivElement, CachedSvgProps>(
  ({ className, classNames, fetch, apiConfig, src: srcProp, ...rest }, ref) => {
    const src = apiConfig?.src ?? srcProp;
    const [svg, setSvg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRef = useRef(fetch);
    useEffect(() => {
      fetchRef.current = fetch;
    }, [fetch]);

    useEffect(() => {
      const controller = new AbortController();
      const signal = controller.signal;

      setLoading(true);
      setSvg(null); // optional: clear previous SVG for clean shimmer

      async function loadSvgSafe() {
        try {
          if (!src) return;

          /* ---------------- Cache ---------------- */
          if (typeof window !== "undefined" && "caches" in window) {
            const cache = await caches.open(SVG_CACHE);
            const cached = await cache.match(src);
            if (cached && !signal.aborted) {
              const text = await cached.text();
              setSvg(sanitizeSvg(text));
              setLoading(false);
              return;
            }
          }

          /* ---------------- Fetch ---------------- */
          const response = fetchRef.current
            ? await fetchRef.current(src)
            : await window.fetch(src, { headers: apiConfig?.headers, signal });

          if (signal.aborted) return;

          if (!response.ok) throw new Error("SVG fetch failed");

          const clone = response.clone();
          const text = await response.text();

          if (!signal.aborted) setSvg(sanitizeSvg(text));

          if (typeof window !== "undefined" && "caches" in window) {
            const cache = await caches.open(SVG_CACHE);
            await cache.put(src, clone);
          }
        } catch (err) {
          if (!signal.aborted) console.error(err);
        } finally {
          if (!signal.aborted) setLoading(false);
        }
      }

      loadSvgSafe();

      return () => {
        controller.abort();
      };
    }, [src]);

    /* ---------------- UI ---------------- */
    const iconStyle = "opacity-90 rounded-full w-[20px] h-[18px]";
    if (loading || !svg) {
      return (
        <Shimmer
          className={cn(
            "bg-primary/10",
            iconStyle,
            classNames?.shimmerClassName,
          )}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn("max-h-fit", iconStyle, className)}
        dangerouslySetInnerHTML={{ __html: svg }}
        {...rest}
      />
    );
  },
);

CachedSvg.displayName = "CachedSvg";

export { CachedSvg, type CachedSvgProps };
