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
  const imgRef = useRef<HTMLImageElement>(null);

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
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Image load failed"));
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
    if (isInView && src && !isLoading && !hasError) {
      const optimizedSrc = getOptimizedImageUrl(src, {
        width,
        height,
        quality,
      });

      loadImage(optimizedSrc).catch(() => {
        // Try fallback to original URL if optimized fails
        if (optimizedSrc !== src) {
          loadImage(src).catch(() => {
            // Final fallback to placeholder
            setImageSrc(placeholder || generateImagePlaceholder(width, height));
            setHasError(true);
            onError?.();
          });
        } else {
          // Direct fallback to placeholder
          setImageSrc(placeholder || generateImagePlaceholder(width, height));
          setHasError(true);
          onError?.();
        }
      });
    }
  }, [
    isInView,
    src,
    placeholder,
    width,
    height,
    quality,
    isLoading,
    hasError,
    loadImage,
    onError,
  ]);

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
