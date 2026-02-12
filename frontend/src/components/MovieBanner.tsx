import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { bannerApi, type Banner } from "../services/bannerApi";
import LazyImage from "./LazyImage";

export default function MovieBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const response = await bannerApi.getActiveBanners();
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
      <>
        <div className="section-title-above-banner">
          <h2>PHIM HOT TẠI RẠP</h2>
        </div>
        <section className="movie-banner">
          <div
            className="banner-image"
            style={{
              background:
                "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
              backgroundSize: "200% 100%",
              animation: "loading 1.5s infinite",
            }}
          />
        </section>
      </>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <>
        <div className="section-title-above-banner">
          <h2>PHIM HOT TẠI RẠP</h2>
        </div>
        <section className="movie-banner">
          <div className="banner-image">
            <img
              src="https://via.placeholder.com/1920x600.png?text=No+Banner"
              alt="Movie Banner"
            />
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="section-title-above-banner">
        <h2>PHIM HOT TẠI RẠP</h2>
      </div>
      <section
        className="movie-banner"
        style={{
          position: "relative",
          height: "450px",
          padding: "0 20px",
          backgroundColor: "black",
        }}
      >
        <div className="banner-carousel">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="banner-slide"
              style={{
                display: index === currentIndex ? "block" : "none",
                cursor: banner.linkUrl ? "pointer" : "default",
              }}
              onClick={() => handleBannerClick(banner)}
            >
              <div
                className="banner-image"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "450px",
                  aspectRatio: "16 / 5",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                {banner.mediaType === "VIDEO" ? (
                  <video
                    src={banner.mediaUrl}
                    poster={banner.thumbnailUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <LazyImage
                    src={banner.mediaUrl}
                    alt={banner.title}
                    width={1920}
                    height={600}
                    quality={90}
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              className="banner-nav banner-nav-prev"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontSize: "15px",
                zIndex: 10,
                transition: "background 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.5)")
              }
            >
              ‹
            </button>
            <button
              className="banner-nav banner-nav-next"
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              style={{
                position: "absolute",
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0,0,0,0.5)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                cursor: "pointer",
                fontSize: "15px",
                zIndex: 10,
                transition: "background 0.3s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.8)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(0,0,0,0.5)")
              }
            >
              ›
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div
            className="banner-dots"
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: "10px",
              zIndex: 10,
            }}
          >
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  goToSlide(index);
                }}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  border: "2px solid white",
                  background:
                    index === currentIndex ? "white" : "rgba(255,255,255,0.3)",
                  cursor: "pointer",
                  padding: 0,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
