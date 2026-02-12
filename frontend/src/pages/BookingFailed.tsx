import { Link } from "react-router-dom";
import "../styles/booking-result.css";

export default function BookingFailed() {
  return (
    <div className="booking-result-page">
      <div className="booking-result-card">
        <div className="result-icon error">
          <i className="fas fa-times-circle"></i>
        </div>
        <h2 className="booking-result-title">Thanh toán thất bại</h2>
        <p className="booking-result-message">
          Rất tiếc, quá trình thanh toán không thành công.<br/>
          Vui lòng kiểm tra lại số dư hoặc thử phương thức khác.
        </p>

        <div className="result-actions">
          <Link to="/movies" className="result-btn primary">
            <i className="fas fa-redo"></i> Thử lại
          </Link>
          <Link to="/" className="result-btn secondary">
            <i className="fas fa-home"></i> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
