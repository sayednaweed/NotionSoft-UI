import Shimmer from "@/components/notion-ui/shimmer";
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

export type ImageProps = FetchImageProps | ApiConfigImageProps;

/* ---------------------------------- */
/* Cache helpers */
/* ---------------------------------- */

const IMAGE_CACHE = "image-cache-v1";

async function getCachedImage(url: string): Promise<string | null> {
  const cache = await caches.open(IMAGE_CACHE);
  const cached = await cache.match(url);

  if (!cached) return null;

  const blob = await cached.blob();
  return URL.createObjectURL(blob);
}

async function cacheImage(url: string, response: Response) {
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

  const { shimmerClassName, shimmerIconClassName } = classNames || {};

  const fetchRef = useRef(fetch);
  useEffect(() => {
    fetchRef.current = fetch;
  }, [fetch]);

  async function loadImage() {
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
        setImageUrl(cached);
        setLoading(false);
        return;
      }

      /* ---------------------------------- */
      /* Fetch */
      /* ---------------------------------- */
      const response = fetchRef.current
        ? await fetchRef.current(resolvedSrc)
        : await window.fetch(resolvedSrc, {
            headers: apiConfig?.headers,
          });

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
      setLoading(false);
    }
  }

  useEffect(() => {
    loadImage();
  }, [src, apiConfig?.src]);

  /* ---------------------------------- */
  /* Cleanup */
  /* ---------------------------------- */

  useEffect(() => {
    return () => {
      if (imageUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  /* ---------------------------------- */
  /* UI */
  /* ---------------------------------- */

  if (loading || !imageUrl) {
    const stop = loading ? false : !imageUrl && true;

    return (
      <Shimmer
        className={cn(
          "bg-primary/10 mx-auto flex p-2 items-center size-8 rounded border border-tertiary/10",
          shimmerClassName
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
            shimmerIconClassName
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
      // src={imageUrl}
      style={{ backgroundImage: `url(${imageUrl})` }}
      // alt={alt}
      className={cn(
        "cursor-pointer shadow-lg bg-cover bg-center mx-auto",
        className
      )}
      {...imgProps}
    />
  );
});

CachedImage.displayName = "CachedImage";

export default CachedImage;
