import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/apiClient";
import "./NearbyTheaters.css";

export default function NearbyTheaters() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [radius, setRadius] = useState(10);

  // Get user's current location
  const detectLocation = () => {
    setIsDetectingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setIsDetectingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default to Ho Chi Minh City if location access denied
          setUserLocation({
            latitude: 10.8231,
            longitude: 106.6297,
          });
          setIsDetectingLocation(false);
        }
      );
    } else {
      // Default to Ho Chi Minh City if geolocation not supported
      setUserLocation({
        latitude: 10.8231,
        longitude: 106.6297,
      });
      setIsDetectingLocation(false);
    }
  };

  // Auto-detect location on component mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch nearby theaters
  const {
    data: theaters,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["theaters/nearby", userLocation, radius],
    queryFn: async () => {
      if (!userLocation) return [];
      const response = await api.get("/api/theaters/nearby", {
        params: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          radiusKm: radius,
        },
      });
      return response.data;
    },
    enabled: !!userLocation,
  });

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div className="container">
      {/* Page Header */}
      <div className="page-header">
        <h2>Rạp Gần Bạn</h2>
        <p>Tìm rạp chiếu phim gần nhất để xem phim</p>
      </div>

      {/* Location Detection */}
      <div className="location-section">
        <div className="location-status">
          {isDetectingLocation ? (
            <div className="location-loading">
              <span className="loading-spinner"></span>
              <span>Đang xác định vị trí của bạn...</span>
            </div>
          ) : userLocation ? (
            <div style={{ color: "#8b7355", fontWeight: "500" }}>
              📍 Vị trí hiện tại: {userLocation.latitude.toFixed(4)},{" "}
              {userLocation.longitude.toFixed(4)}
            </div>
          ) : (
            <div style={{ color: "#8b7355", fontWeight: "500" }}>
              Chưa xác định được vị trí
            </div>
          )}
        </div>

        <div className="location-controls">
          <button
            id="detect-location"
            className="btn btn-primary"
            onClick={detectLocation}
            disabled={isDetectingLocation}
          >
            <span className="icon">📍</span>
            Xác định vị trí
          </button>
          {userLocation && (
            <button
              id="refresh-location"
              className="btn btn-secondary"
              onClick={detectLocation}
            >
              <span className="icon">🔄</span>
              Làm mới
            </button>
          )}
        </div>
      </div>

      {/* Radius Control */}
      <div className="radius-control">
        <label htmlFor="radius-select">Bán kính tìm kiếm:</label>
        <select
          id="radius-select"
          className="radius-select"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={15}>15 km</option>
          <option value={20}>20 km</option>
          <option value={50}>50 km</option>
        </select>
      </div>

      {/* Theaters List */}
      <div className="theaters-container">
        {isLoading ? (
          <div className="location-loading">
            <span className="loading-spinner"></span>
            <span>Đang tải danh sách rạp...</span>
          </div>
        ) : isError ? (
          <div className="no-theaters">
            <div className="no-theaters-content">
              <span className="icon">❌</span>
              <h3>Có lỗi khi tải dữ liệu</h3>
              <p>Vui lòng thử lại sau</p>
            </div>
          </div>
        ) : theaters && theaters.length > 0 ? (
          <div className="theaters-list">
            {theaters.map((theater: any) => {
              const distance = userLocation
                ? calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    theater.latitude,
                    theater.longitude
                  )
                : 0;

              return (
                <div key={theater.id} className="theater-card">
                  <div className="theater-info">
                    <h3 className="theater-name">{theater.name}</h3>
                    <p className="theater-address">📍 {theater.address}</p>
                    {theater.phone && (
                      <p className="theater-phone">📞 {theater.phone}</p>
                    )}
                    {theater.description && (
                      <p className="theater-description">
                        {theater.description}
                      </p>
                    )}
                    <div className="theater-badges">
                      <span className="badge badge-code">
                        🎬 {theater.code}
                      </span>
                      <span className="badge badge-distance">
                        📍 {distance.toFixed(1)} km
                      </span>
                    </div>
                  </div>
                  <div className="theater-actions">
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        // Navigate to booking page with theater pre-selected
                        // Use /booking?theaterId=123 to avoid conflict with /booking/:movieId route
                        window.location.href = `/booking?theaterId=${theater.id}`;
                      }}
                    >
                      🎫 Đặt vé
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() =>
                        window.open(
                          `https://maps.google.com/?q=${theater.latitude},${theater.longitude}`,
                          "_blank"
                        )
                      }
                    >
                      📍 Chỉ đường
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-theaters">
            <div className="no-theaters-content">
              <span className="icon">🎬</span>
              <h3>Không tìm thấy rạp nào</h3>
              <p>Không có rạp chiếu phim nào trong bán kính {radius}km</p>
              <button
                className="btn btn-primary"
                onClick={() => setRadius(radius + 10)}
              >
                Mở rộng tìm kiếm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
