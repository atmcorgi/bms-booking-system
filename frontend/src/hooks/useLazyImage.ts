import { useState, useRef, useEffect, useCallback } from "react";
import {
  getOptimizedImageUrl,
  generateImagePlaceholder,
} from "../utils/imageOptimization";

interface UseLazyImageOptions {
  src?: string;
  placeholder?: string;
  width?: number;
  height?: number;
  quality?: number;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

interface UseLazyImageReturn {
  imageSrc: string;
  isLoaded: boolean;
  isLoading: boolean;
  hasError: boolean;
  isInView: boolean;
  imgRef: React.RefObject<HTMLImageElement | null>;
  retry: () => void;
}

export function useLazyImage({
  src,
  placeholder,
  width = 300,
  height = 450,
  quality = 80,
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = "50px",
}: UseLazyImageOptions): UseLazyImageReturn {
  const [imageSrc, setImageSrc] = useState(
    placeholder || generateImagePlaceholder(width, height)
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const loadImage = useCallback(
    async (imageUrl: string) => {
      setIsLoading(true);
      setHasError(false);

      try {
        const img = new Image();

        // For Amazon images, don't set crossOrigin as it may cause CORS issues
        // Amazon images work better without crossOrigin attribute
        if (
          imageUrl.startsWith("http") &&
          !imageUrl.includes(window.location.hostname) &&
          !imageUrl.includes("amazon") &&
          !imageUrl.includes("media-amazon")
        ) {
          img.crossOrigin = "anonymous";
        }

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Image load timeout"));
          }, 15000); // 15 second timeout

          img.onload = () => {
            clearTimeout(timeout);
            resolve();
          };
          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Image load failed"));
          };
          img.src = imageUrl;
        });

        setImageSrc(imageUrl);
        setIsLoaded(true);
        setIsLoading(false);
        onLoad?.();
      } catch (error) {
        setIsLoading(false);
        setHasError(true);
        onError?.();
        throw error;
      }
    },
    [onLoad, onError]
  );

  const retry = useCallback(() => {
    if (src && isInView) {
      setHasError(false);
      setIsLoaded(false);
      loadImage(src);
    }
  }, [src, isInView, loadImage]);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Load image when in view
  useEffect(() => {
    if (!isInView || !src || isLoading || hasError) {
      return;
    }

    let isMounted = true;
    const optimizedSrc = getOptimizedImageUrl(src, {
      width,
      height,
      quality,
    });

    const attemptLoad = async () => {
      try {
        await loadImage(optimizedSrc);
      } catch (error) {
        if (!isMounted) return;

        // Try fallback to original URL if optimized fails
        if (optimizedSrc !== src) {
          try {
            await loadImage(src);
          } catch (fallbackError) {
            if (!isMounted) return;
            // Final fallback to placeholder
            setImageSrc(placeholder || generateImagePlaceholder(width, height));
            setHasError(true);
            onError?.();
          }
        } else {
          // Direct fallback to placeholder
          setImageSrc(placeholder || generateImagePlaceholder(width, height));
          setHasError(true);
          onError?.();
        }
      }
    };

    attemptLoad();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInView, src, placeholder, width, height, quality]);

  return {
    imageSrc,
    isLoaded,
    isLoading,
    hasError,
    isInView,
    imgRef,
    retry,
  };
}
