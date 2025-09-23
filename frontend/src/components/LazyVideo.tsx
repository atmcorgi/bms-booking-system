import { useState, useRef, useEffect } from "react";

interface LazyVideoProps {
  src?: string;
  poster?: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  onLoad?: () => void;
  onError?: () => void;
  autoplay?: boolean;
  muted?: boolean;
  loop?: boolean;
  controls?: boolean;
}

export default function LazyVideo({
  src,
  poster,
  className,
  style,
  onLoad,
  onError,
  autoplay = false,
  muted = true,
  loop = false,
  controls = true,
}: LazyVideoProps) {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "50px",
      }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src && videoRef.current) {
      const video = videoRef.current;

      const handleLoadedData = () => {
        setIsLoaded(true);
        onLoad?.();
      };

      const handleError = () => {
        setHasError(true);
        onError?.();
      };

      video.addEventListener("loadeddata", handleLoadedData);
      video.addEventListener("error", handleError);

      // Load the video source
      video.src = src;
      video.load();

      return () => {
        video.removeEventListener("loadeddata", handleLoadedData);
        video.removeEventListener("error", handleError);
      };
    }
  }, [isInView, src, onLoad, onError]);

  return (
    <div style={{ position: "relative", ...style }}>
      <video
        ref={videoRef}
        poster={poster}
        className={`${className || ""} ${!isLoaded ? "lazy-video loading" : ""} ${hasError ? "lazy-video error" : ""}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 0.3s ease-in-out",
          opacity: isLoaded ? 1 : 0.7,
        }}
        autoPlay={autoplay}
        muted={muted}
        loop={loop}
        controls={controls}
        playsInline
      />
      {!isLoaded && !hasError && (
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
            zIndex: 2,
          }}
        >
          Video unavailable
        </div>
      )}
    </div>
  );
}
