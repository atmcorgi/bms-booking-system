import { useLazyImage } from "../hooks/useLazyImage";
import { generateImagePlaceholder } from "../utils/imageOptimization";

interface LazyImageProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
  quality?: number;
}

export default function LazyImage({
  src,
  alt = "",
  className,
  style,
  placeholder,
  onLoad,
  onError,
  width = 300,
  height = 450,
  quality = 80,
}: LazyImageProps) {
  // If no src provided, show placeholder immediately
  if (!src) {
    return (
      <>
        <img
          src={placeholder || generateImagePlaceholder(width, height)}
          alt={alt}
          className={className}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
                        objectFit: "contain",
            opacity: 0.3,
            ...style,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
            borderRadius: "inherit",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      </>
    );
  }

  const { imageSrc, isLoaded, isLoading, hasError, imgRef } = useLazyImage({
    src,
    placeholder,
    width,
    height,
    quality,
    onLoad,
    onError,
  });

  return (
    <>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className || ""} ${isLoading ? "lazy-image loading" : ""} ${hasError ? "lazy-image error" : ""}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
                      objectFit: "contain",
          transition: "opacity 0.3s ease-in-out",
          opacity: isLoaded ? 1 : 0.3,
          ...style,
        }}
        loading="lazy"
        referrerPolicy={
          src && (src.includes("amazon") || src.includes("media-amazon"))
            ? "no-referrer"
            : "strict-origin-when-cross-origin"
        }
      />
      {(isLoading || hasError) && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
            backgroundSize: "200% 100%",
            animation: "loading 1.5s infinite",
            borderRadius: "inherit",
            zIndex: 1,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
}
