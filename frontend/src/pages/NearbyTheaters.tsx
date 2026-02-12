import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/apiClient";
import "./NearbyTheaters.css";
import CustomSelect, { type SelectOption } from "../components/shared/CustomSelect";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faLocationCrosshairs, 
  faSync, 
  faMapMarkerAlt, 
  faPhone, 
  faInfoCircle, 
  faTicketAlt, 
  faDirections,
  faTheaterMasks,
  faSearchPlus
} from "@fortawesome/free-solid-svg-icons";

export default function NearbyTheaters() {
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [radius, setRadius] = useState(10);

  const radiusOptions: SelectOption[] = [
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
    { value: 15, label: "15 km" },
    { value: 20, label: "20 km" },
    { value: 50, label: "50 km" },
  ];

  const selectedRadius = radiusOptions.find(opt => opt.value === radius);

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
          setUserLocation({
            latitude: 10.8231,
            longitude: 106.6297,
          });
          setIsDetectingLocation(false);
        }
      );
    } else {
      setUserLocation({
        latitude: 10.8231,
        longitude: 106.6297,
      });
      setIsDetectingLocation(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

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
    const R = 6371;
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
    <div className="nearby-theaters-page">
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h2 className="page-header-title">Rạp Gần Bạn</h2>
          <p className="page-header-subtitle">Khám phá không gian điện ảnh gần nhất với vị trí của bạn</p>
        </div>

        {/* Dashboard Controls */}
        <div className="controls-dashboard">
          <div className="location-panel">
            <span className="panel-label">Vị trí hiện tại</span>
            <div className="location-status-display">
              <div className={`status-dot ${isDetectingLocation ? 'loading' : ''}`}></div>
              {isDetectingLocation ? (
                <span>Đang định vị...</span>
              ) : userLocation ? (
                <span>{userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}</span>
              ) : (
                <span>Chưa xác định</span>
              )}
            </div>
            <div className="location-actions">
              <button
                className="btn-nt btn-nt-primary"
                onClick={detectLocation}
                disabled={isDetectingLocation}
              >
                <FontAwesomeIcon icon={faLocationCrosshairs} /> Xác định lại
              </button>
              {userLocation && (
                <button className="btn-nt btn-nt-secondary" onClick={detectLocation}>
                  <FontAwesomeIcon icon={faSync} /> Làm mới
                </button>
              )}
            </div>
          </div>

          <div className="radius-panel">
            <span className="panel-label">Bán kính tìm kiếm</span>
            <CustomSelect
              instanceId="radius-select"
              options={radiusOptions}
              value={selectedRadius}
              onChange={(option) => setRadius(option?.value as number)}
              menuPortalTarget={document.body}
              styles={{
                control: (base: any, state: any) => ({
                  ...base,
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: state.isFocused ? '1px solid #8b7355' : '1px solid rgba(217, 210, 183, 0.2)',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  '&:hover': {
                    border: '1px solid rgba(217, 210, 183, 0.4)',
                  },
                }),
                singleValue: (base: any) => ({
                  ...base,
                  color: '#d9d2b7',
                  fontWeight: '600',
                }),
                placeholder: (base: any) => ({
                  ...base,
                  color: 'rgba(217, 210, 183, 0.5)',
                }),
                menu: (base: any) => ({
                  ...base,
                  background: '#2c241e',
                  border: '1px solid rgba(217, 210, 183, 0.1)',
                  borderRadius: '12px',
                  marginTop: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                }),
                menuPortal: (base: any) => ({
                  ...base,
                  zIndex: 9999,
                }),
                option: (base: any, state: any) => ({
                  ...base,
                  background: state.isSelected ? '#8b7355' : state.isFocused ? 'rgba(139, 115, 85, 0.2)' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  '&:active': {
                    background: '#8b7355',
                  },
                }),
              }}
            />
          </div>
        </div>

        {/* Theaters Grid */}
        <div className="theaters-container">
          {isLoading ? (
            <div className="nt-loading-overlay">
              <div className="nt-spinner"></div>
              <span>Đang tìm kiếm các rạp trong khu vực...</span>
            </div>
          ) : isError ? (
            <div className="nt-empty-state">
              <div className="nt-empty-icon"><FontAwesomeIcon icon={faInfoCircle} /></div>
              <h3>Có lỗi xảy ra</h3>
              <p>Không thể kết nối đến máy chủ. Vui lòng thử lại sau.</p>
            </div>
          ) : theaters && theaters.length > 0 ? (
            <div className="theaters-grid">
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
                  <div key={theater.id} className="nt-theater-card">
                    <div className="nt-theater-info">
                      <h3 className="nt-theater-name">{theater.name}</h3>
                      <div className="nt-theater-meta">
                        <div className="meta-item">
                          <FontAwesomeIcon icon={faMapMarkerAlt} />
                          <span>{theater.address}</span>
                        </div>
                        {theater.phone && (
                          <div className="meta-item">
                            <FontAwesomeIcon icon={faPhone} />
                            <span>{theater.phone}</span>
                          </div>
                        )}
                        {theater.description && (
                          <div className="meta-item">
                            <FontAwesomeIcon icon={faInfoCircle} />
                            <span>{theater.description}</span>
                          </div>
                        )}
                      </div>
                      <div className="nt-theater-badges">
                        <span className="nt-badge nt-badge-code">
                          #{theater.code}
                        </span>
                        <span className="nt-badge nt-badge-distance">
                          {distance.toFixed(1)} km
                        </span>
                      </div>
                    </div>
                    
                    <div className="nt-theater-actions">
                      <button
                        className="btn-booking"
                        onClick={() => {
                          window.location.href = `/booking?theaterId=${theater.id}`;
                        }}
                      >
                        <FontAwesomeIcon icon={faTicketAlt} /> Đặt vé ngay
                      </button>
                      <button
                        className="btn-map"
                        onClick={() =>
                          window.open(
                            `https://maps.google.com/?q=${theater.latitude},${theater.longitude}`,
                            "_blank"
                          )
                        }
                      >
                        <FontAwesomeIcon icon={faDirections} /> Xem bản đồ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="nt-empty-state">
              <div className="nt-empty-icon"><FontAwesomeIcon icon={faTheaterMasks} /></div>
              <h3>Không tìm thấy rạp</h3>
              <p>Hiện tại không có rạp chiếu phim nào trong bán kính {radius}km xung quanh bạn.</p>
              <button
                className="btn-nt btn-nt-primary"
                style={{ margin: '0 auto' }}
                onClick={() => setRadius(radius + 10)}
              >
                <FontAwesomeIcon icon={faSearchPlus} /> Mở rộng tìm kiếm (+10km)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}