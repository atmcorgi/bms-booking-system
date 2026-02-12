import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faFilm, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import "../styles/quick-booking.css";

export default function QuickBooking() {
  return (
    <section className="quick-booking-section">
      <div className="quick-booking-container">
        <div className="quick-booking-header">
          <h2 className="quick-booking-title">ĐẶT VÉ NHANH</h2>
          <p className="quick-booking-subtitle">
            Trải nghiệm điện ảnh đỉnh cao chỉ với vài thao tác
          </p>
        </div>
        
        <div className="quick-booking-grid">
          <Link to="/booking" className="quick-booking-card">
            <div className="card-icon-wrapper">
              <FontAwesomeIcon icon={faBuilding} />
            </div>
            <h3 className="card-title">Chọn Rạp</h3>
            <p className="card-description">
              Tìm kiếm rạp chiếu phim gần nhất và xem các suất chiếu khả dụng
            </p>
            <div className="card-action-btn">
              Bắt đầu ngay <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.8rem' }} />
            </div>
          </Link>

          <Link to="/#now-showing" className="quick-booking-card">
            <div className="card-icon-wrapper">
              <FontAwesomeIcon icon={faFilm} />
            </div>
            <h3 className="card-title">Chọn Phim</h3>
            <p className="card-description">
              Khám phá những siêu phẩm mới nhất và đặt chỗ cho bộ phim yêu thích
            </p>
            <div className="card-action-btn">
              Khám phá phim <FontAwesomeIcon icon={faChevronRight} style={{ fontSize: '0.8rem' }} />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
