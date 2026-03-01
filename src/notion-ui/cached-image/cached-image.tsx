import { Shimmer } from "@/components/notion-ui/shimmer";
import { cn } from "@/utils/cn";
import React, { useEffect, useState, forwardRef, useRef } from "react";

/* ---------------------------------- */
/* Types */
/* ---------------------------------- */

interface FetchConfig {
  src: string;
  headers?: Record<string, string>;
  params?: string;
}

interface BaseImageProps extends React.HTMLAttributes<HTMLDivElement> {
  classNames?: {
    shimmerClassName?: string;
    shimmerIconClassName?: string;
  };
}

interface FetchImageProps extends BaseImageProps {
  src: string;
  fetch: (src: string) => Promise<Response>;
  apiConfig?: never;
}

interface ApiConfigImageProps extends BaseImageProps {
  apiConfig: FetchConfig;
  src?: never;
  fetch?: never;
}

type ImageProps = FetchImageProps | ApiConfigImageProps;

/* ---------------------------------- */
/* Cache helpers */
/* ---------------------------------- */

const IMAGE_CACHE = "image-cache-v1";

async function getCachedImage(url: string): Promise<string | null> {
  if (typeof window === "undefined" || typeof caches === "undefined") {
    return null;
  }

  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(url);

  if (!cached) return null;

  const blob = await cached.blob();
  return URL.createObjectURL(blob);
}

async function cacheImage(url: string, response: Response) {
  if (typeof window === "undefined" || typeof caches === "undefined") {
    return;
  }
  const cache = await caches.open(IMAGE_CACHE);
  await cache.put(url, response.clone());
}

/* ---------------------------------- */
/* Utils */
/* ---------------------------------- */

function isCrossOrigin(url: string): boolean {
  try {
    return new URL(url, window.location.href).origin !== window.location.origin;
  } catch {
    return false;
  }
}

/* ---------------------------------- */
/* Component */
/* ---------------------------------- */

const CachedImage = forwardRef<HTMLDivElement, ImageProps>((props, ref) => {
  const { className, classNames, fetch, apiConfig, src, ...imgProps } = props;

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const previousUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (previousUrlRef.current?.startsWith("blob:")) {
      URL.revokeObjectURL(previousUrlRef.current);
    }

    previousUrlRef.current = imageUrl;

    return () => {
      if (previousUrlRef.current?.startsWith("blob:")) {
        URL.revokeObjectURL(previousUrlRef.current);
      }
    };
  }, [imageUrl]);

  const { shimmerClassName, shimmerIconClassName } = classNames || {};

  const fetchRef = useRef(fetch);
  useEffect(() => {
    fetchRef.current = fetch;
  }, [fetch]);

  async function loadImage(signal: AbortSignal) {
    try {
      const resolvedSrc = apiConfig?.src ?? src;

      if (!resolvedSrc) {
        setImageUrl(null);
        return;
      }

      /* ---------------------------------- */
      /* Cross-origin → use <img src> */
      /* ---------------------------------- */
      if (isCrossOrigin(resolvedSrc)) {
        setImageUrl(resolvedSrc);
        setLoading(false);
        return;
      }

      /* ---------------------------------- */
      /* Cache Storage */
      /* ---------------------------------- */
      const cached = await getCachedImage(resolvedSrc);
      if (cached) {
        if (!signal.aborted) {
          setImageUrl(cached);
          setLoading(false);
        }
        return;
      }

      /* ---------------------------------- */
      /* Fetch */
      /* ---------------------------------- */
      const response = fetchRef.current
        ? await fetchRef.current(resolvedSrc)
        : await window.fetch(resolvedSrc, {
            headers: apiConfig?.headers,
            signal,
          });
      if (signal.aborted) return;

      const contentType = response.headers.get("content-type") ?? "";

      if (
        !response.ok ||
        (!contentType.startsWith("image/") &&
          contentType !== "application/octet-stream")
      ) {
        throw new Error(`Invalid image response: ${contentType}`);
      }

      await cacheImage(resolvedSrc, response.clone());

      const blob = await response.blob();
      setImageUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    loadImage(controller.signal);

    return () => {
      controller.abort();
    };
  }, [src, apiConfig?.src]);

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */

  if (loading || !imageUrl) {
    const stop = !loading && !imageUrl;

    return (
      <Shimmer
        className={cn(
          "bg-primary/10 mx-auto flex p-2 items-center size-8 rounded border border-tertiary/10",
          shimmerClassName,
        )}
        stop={stop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            "stroke-primary/40 mx-auto stroke-2",
            shimmerIconClassName,
          )}
        >
          <rect x="1" y="1" width="22" height="22" rx="2" ry="2" />
          <polyline points="3,20 8,13 13,17 17,12 21,16" />
          <circle cx="16" cy="6" r="2" />
        </svg>
      </Shimmer>
    );
  }

  return (
    <div
      ref={ref}
      style={{ backgroundImage: `url(${imageUrl})` }}
      className={cn(
        "cursor-pointer shadow-lg bg-cover bg-center mx-auto",
        className,
      )}
      {...imgProps}
    />
  );
});

CachedImage.displayName = "CachedImage";

export { CachedImage, type ImageProps };
