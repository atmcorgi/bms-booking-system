import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import "../styles/booking-result.css";
import Confetti from "../components/Confetti";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingIds, setBookingIds] = useState<string | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const txnRef = searchParams.get("txnRef");

  useEffect(() => {
    // BookingIds are passed directly from BookingFlow after successful payment
    const bookingIdsParam = searchParams.get("bookingIds");
    
    if (txnRef && bookingIdsParam) {
      setBookingIds(bookingIdsParam);
      setLoading(false);
      setShowConfetti(true);
    } else if (txnRef) {
      // If we have txnRef but no bookingIds, show success but without ticket link
      setLoading(false);
      setShowConfetti(true);
    } else {
      setError("Không tìm thấy thông tin giao dịch");
      setLoading(false);
    }
  }, [txnRef, searchParams]);

  if (loading) {
    return (
      <div className="booking-result-page">
        <div className="booking-result-card">
          <div className="result-icon loading">
            <i className="fas fa-spinner"></i>
          </div>
          <h2 className="booking-result-title">Đang xử lý...</h2>
          <p className="booking-result-message">Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-result-page">
        <div className="booking-result-card">
          <div className="result-icon error">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 className="booking-result-title">Lỗi giao dịch</h2>
          <p className="booking-result-message">{error}</p>
          <div className="result-actions">
            <Link to="/" className="result-btn secondary">
              <i className="fas fa-home"></i> Về trang chủ
            </Link>
            <Link to="/booking" className="result-btn primary">
              <i className="fas fa-redo"></i> Thử lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-result-page">
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} duration={4000} />
      <div className="booking-result-card">
        <div className="result-icon success">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2 className="booking-result-title">Đặt vé thành công!</h2>
        <p className="booking-result-message">
          Cảm ơn bạn đã tin tưởng dịch vụ của chúng tôi.<br/>
          Vé đã được gửi đến email của bạn.
        </p>

        {txnRef && (
          <div className="transaction-box">
            <div className="transaction-row">
              <span className="t-label">Mã giao dịch:</span>
              <span className="t-value">{txnRef}</span>
            </div>
            {/* Có thể thêm thời gian hoặc số tiền nếu có */}
          </div>
        )}

        <div className="result-actions">
          {bookingIds && (
            <Link
              to="/profile?tab=bookings"
              className="result-btn primary"
            >
              <i className="fas fa-ticket-alt"></i> Xem vé của tôi
            </Link>
          )}
          <Link to="/" className="result-btn secondary">
            <i className="fas fa-home"></i> Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
