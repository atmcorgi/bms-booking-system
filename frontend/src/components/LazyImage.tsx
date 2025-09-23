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
      <div style={{ position: "relative", ...style }}>
        <img
          src={placeholder || generateImagePlaceholder(width, height)}
          alt={alt}
          className={className}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            zIndex: 2,
          }}
        >
          No Image
        </div>
      </div>
    );
  }

  const { imageSrc, isLoaded, isLoading, hasError, imgRef, retry } =
    useLazyImage({
      src,
      placeholder,
      width,
      height,
      quality,
      onLoad,
      onError,
    });

  return (
    <div style={{ position: "relative", ...style }}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className || ""} ${isLoading ? "lazy-image loading" : ""} ${hasError ? "lazy-image error" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.3s ease-in-out",
          opacity: isLoaded ? 1 : isLoading ? 0.7 : 0.5,
        }}
        loading="lazy"
        onClick={hasError ? retry : undefined}
        title={hasError ? "Click to retry loading" : undefined}
        referrerPolicy={
          src && (src.includes("amazon") || src.includes("media-amazon"))
            ? "no-referrer"
            : "strict-origin-when-cross-origin"
        }
      />
      {isLoading && (
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
          }}
        />
      )}
      {hasError && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "8px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            cursor: "pointer",
            zIndex: 2,
          }}
          onClick={retry}
        >
          Retry
        </div>
      )}
    </div>
  );
}
