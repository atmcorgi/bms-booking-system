import { useMemo } from "react";
import LazyImage from "./LazyImage";
import { preloadImages } from "../utils/imageOptimization";

interface ImageGalleryProps {
  images: Array<{
    id: string;
    src: string;
    alt: string;
    width?: number;
    height?: number;
  }>;
  columns?: number;
  gap?: number;
  preloadCount?: number;
}

export default function ImageGallery({
  images,
  columns = 3,
  gap = 16,
  preloadCount = 6,
}: ImageGalleryProps) {
  // Preload first few images for better UX
  useMemo(() => {
    const urlsToPreload = images.slice(0, preloadCount).map((img) => img.src);
    if (urlsToPreload.length > 0) {
      preloadImages(urlsToPreload, 3).catch(() => {
        // Ignore preload errors
      });
    }
  }, [images, preloadCount]);

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap}px`,
    padding: "20px 0",
  };

  return (
    <div style={gridStyle}>
      {images.map((image) => (
        <div
          key={image.id}
          style={{
            aspectRatio: "2/3",
            borderRadius: "8px",
            overflow: "hidden",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            transition: "transform 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <LazyImage
            src={image.src}
            alt={image.alt}
            width={image.width || 300}
            height={image.height || 450}
            quality={85}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      ))}
    </div>
  );
}
