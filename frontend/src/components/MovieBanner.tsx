import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { bannerApi, type Banner } from "../services/bannerApi";
import LazyImage from "./LazyImage";
import { getOptimizedImageUrl } from "../utils/imageOptimization";

export default function MovieBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await bannerApi.getActiveBanners();
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Preload first banner image for LCP optimization
  useEffect(() => {
    if (banners && banners.length > 0 && banners[0].mediaType !== "VIDEO") {
      const firstBanner = banners[0];
      // High res for premium cinematic hero
      const optimizedUrl = getOptimizedImageUrl(firstBanner.mediaUrl, {
        width: 1920,
        height: 600,
        quality: 90,
      });
      const img = new Image();
      img.src = optimizedUrl;
    }
  }, [banners]);

  // Auto-slide logic
  useEffect(() => {
    if (!banners || banners.length <= 1) return;

    const currentBanner = banners[currentIndex];
    const isVideo = currentBanner?.mediaType === "VIDEO";
    const delay = isVideo ? 20000 : 5000;

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex, banners]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleBannerClick = (banner: Banner) => {
    if (banner.linkUrl) {
      window.location.href = banner.linkUrl;
    }
  };

  if (isLoading) {
    return (
      <section className="movie-banner cinematic-banner loading-banner">
        <style>{`
          .cinematic-banner {
            position: relative;
            width: 100%;
            height: clamp(400px, 60vh, 600px);
            background: #000;
            overflow: hidden;
            border-bottom: 2px solid #8b7355;
          }
          .loading-banner {
            background: linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%);
            background-size: 200% 100%;
            animation: loadingPulse 2s infinite;
          }
          @keyframes loadingPulse {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return null; // Don't show anything if no banners exist, looks cleaner than a "No Banner" image.
  }

  return (
    <section className="movie-banner cinematic-banner">
      <style>{`
        .cinematic-banner {
          position: relative;
          width: 100%;
          height: clamp(400px, 60vh, 600px);
          background: #000;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .banner-carousel {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        .banner-slide {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          transition: opacity 1s ease-in-out, transform 1s ease-in-out;
        }
        .banner-image-wrapper {
          position: absolute;
          width: 100%; height: 100%;
        }
        /* Make sure inside LazyImage scales cover */
        .banner-image-wrapper img {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          object-position: center 20% !important;
        }
        .banner-overlay {
          position: absolute;
          bottom: 0; left: 0; width: 100%; height: 50%;
          background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0) 100%);
          pointer-events: none;
          z-index: 5;
        }
        .banner-nav {
          position: absolute;
          top: 0;
          height: 100%;
          width: 10%;
          min-width: 60px;
          border: none;
          cursor: pointer;
          z-index: 10;
          color: rgba(255,255,255,0.3);
          font-size: 40px;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          background: transparent;
        }
        .banner-nav-prev {
          left: 0;
          justify-content: flex-start;
          padding-left: 2%;
        }
        .banner-nav-next {
          right: 0;
          justify-content: flex-end;
          padding-right: 2%;
        }
        .banner-nav:hover {
          color: rgba(255,255,255,1);
        }
        .banner-nav-prev:hover {
          background: linear-gradient(to right, rgba(0,0,0,0.5) 0%, transparent 100%);
        }
        .banner-nav-next:hover {
          background: linear-gradient(to left, rgba(0,0,0,0.5) 0%, transparent 100%);
        }
        .banner-dots {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 12px;
          z-index: 15;
        }
        .dot {
          width: 10px; height: 10px;
          border-radius: 5px;
          background: rgba(255,255,255,0.4);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          border: none;
          padding: 0;
        }
        .dot.active {
          width: 30px;
          background: #e74c3c;
          box-shadow: 0 0 10px rgba(231,76,60,0.6);
        }
      `}</style>

      <div className="banner-carousel">
        {banners.map((banner, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={banner.id}
              className="banner-slide"
              style={{
                opacity: isActive ? 1 : 0,
                visibility: isActive ? "visible" : "hidden",
                zIndex: isActive ? 2 : 1,
                transform: isActive ? "scale(1)" : "scale(1.05)",
                cursor: banner.linkUrl ? "pointer" : "default",
              }}
              onClick={() => handleBannerClick(banner)}
            >
              <div className="banner-image-wrapper">
                {banner.mediaType === "VIDEO" ? (
                  <video
                    src={banner.mediaUrl}
                    poster={banner.thumbnailUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center 20%",
                    }}
                  />
                ) : (
                  <LazyImage
                    src={banner.mediaUrl}
                    alt={banner.title}
                    width={1920}
                    height={600}
                    quality={90}
                    priority={index === 0}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="banner-overlay" />

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            className="banner-nav banner-nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevious();
            }}
            aria-label="Previous slide"
          >
            &#10094;
          </button>
          <button
            className="banner-nav banner-nav-next"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="Next slide"
          >
            &#10095;
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {banners.length > 1 && (
        <div className="banner-dots">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? "active" : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                goToSlide(index);
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
