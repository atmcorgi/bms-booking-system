import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";

export default function BookingSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingIds, setBookingIds] = useState<string | null>(null);

  const txnRef = searchParams.get("txnRef");
  const amount = searchParams.get("amount");

  useEffect(() => {
    const processPayment = async () => {
      try {
        setLoading(true);

        // Mock payment success để test UI
        if (txnRef && amount) {
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Mock successful response
          const mockBookingIds = "1,2,3"; // Mock booking IDs
          setBookingIds(mockBookingIds);

          // Redirect to tickets page
          navigate(`/booking/tickets?bookingIds=${mockBookingIds}`);
        } else {
          setError("Không tìm thấy thông tin giao dịch");
        }
      } catch (err) {
        console.error("Payment processing error:", err);
        setError("Có lỗi xảy ra khi xử lý thanh toán");
      } finally {
        setLoading(false);
      }
    };

    if (txnRef) {
      processPayment();
    } else {
      setError("Không tìm thấy thông tin giao dịch");
      setLoading(false);
    }
  }, [txnRef, amount]);

  if (loading) {
    return (
      <div className="main-content-container">
        <div className="booking-result">
          <div className="loading-icon">
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <h2>Đang xử lý thanh toán...</h2>
          <p>Vui lòng chờ trong giây lát.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="main-content-container">
        <div className="booking-result">
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2>Lỗi xử lý thanh toán</h2>
          <p>{error}</p>
          <div className="result-actions">
            <Link to="/" className="fd-btn">
              Về trang chủ
            </Link>
            <Link to="/booking" className="btn-secondary">
              Thử lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-container">
      <div className="booking-result">
        <div className="success-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>Đặt vé thành công!</h2>
        <p>Cảm ơn bạn đã sử dụng dịch vụ đặt vé của chúng tôi.</p>

        {txnRef && (
          <div className="transaction-info">
            <p>
              <strong>Mã giao dịch:</strong> {txnRef}
            </p>
          </div>
        )}

        <div className="result-actions">
          {bookingIds && (
            <Link
              to={`/booking/tickets?bookingIds=${bookingIds}`}
              className="fd-btn"
            >
              Xem vé
            </Link>
          )}
          <Link to="/" className="btn-secondary">
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
