import { Link } from "react-router-dom";

export default function BookingFailed() {
  return (
    <div className="main-content-container">
      <div className="booking-result">
        <div className="error-icon">
          <i className="fas fa-times-circle"></i>
        </div>
        <h2>Thanh toán thất bại</h2>
        <p>
          Rất tiếc, quá trình thanh toán không thành công. Vui lòng thử lại.
        </p>

        <div className="result-actions">
          <Link to="/" className="fd-btn">
            Về trang chủ
          </Link>
          <Link to="/movies" className="btn-secondary">
            Thử lại
          </Link>
        </div>
      </div>
    </div>
  );
}
