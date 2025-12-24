import React, { forwardRef, useEffect, useRef, useState } from "react";
import Shimmer from "../shimmer";
import { cn } from "../../utils/cn";
import DOMPurify from "dompurify";

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

export type CachedSvgProps = FetchSvgProps | ApiConfigSvgProps;

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
  ({ className, classNames, fetch, apiConfig, ...rest }, ref) => {
    const [svg, setSvg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRef = useRef(fetch);
    useEffect(() => {
      fetchRef.current = fetch;
    }, [fetch]);

    async function loadSvg() {
      try {
        const src = apiConfig?.src ?? (rest as any).src;
        if (!src) return;

        /* ---------------- Cache ---------------- */

        if ("caches" in window) {
          const cache = await caches.open(SVG_CACHE);
          const cached = await cache.match(src);

          if (cached) {
            const text = await cached.text();
            setSvg(sanitizeSvg(text));
            setLoading(false);
            return;
          }
        }

        /* ---------------- Fetch ---------------- */

        const response = fetchRef.current
          ? await fetchRef.current(src)
          : await window.fetch(src, { headers: apiConfig?.headers });

        if (!response.ok) throw new Error("SVG fetch failed");

        const clone = response.clone();
        const text = await response.text();

        setSvg(sanitizeSvg(text));

        if ("caches" in window) {
          const cache = await caches.open(SVG_CACHE);
          await cache.put(src, clone);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    useEffect(() => {
      loadSvg();
    }, [apiConfig?.src, (rest as any).src]);

    /* ---------------- UI ---------------- */
    const iconStyle = "opacity-90 rounded-full w-[20px] h-[18px]";
    if (loading || !svg) {
      return (
        <Shimmer
          className={cn(
            "bg-primary/10",
            iconStyle,
            classNames?.shimmerClassName
          )}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "[&>svg>path]:fill-current [&>svg>g>*]:fill-current items-center justify-center flex",
          iconStyle,
          className
        )}
        dangerouslySetInnerHTML={{ __html: svg }}
        {...rest}
      />
    );
  }
);

CachedSvg.displayName = "CachedSvg";

export default CachedSvg;
