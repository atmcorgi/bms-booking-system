import { useSearchParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { bookingApi } from "../services/bookingApi";

interface BookingDetail {
  id: number;
  customerName: string;
  customerPhone: string;
  bookingTime: string;
  status: string;
  paymentCode: string;
  showtime: {
    id: number;
    showDate: string;
    showTime: string;
    movie: {
      id: number;
      title: string;
      duration: number;
    };
    room: {
      id: number;
      name: string;
      theater: {
        id: number;
        name: string;
        address: string;
      };
    };
  };
  seat: {
    id: number;
    seatNumber: string;
    seatType: string;
  };
}

export default function Tickets() {
  const [searchParams] = useSearchParams();
  const bookingIds = searchParams.get("bookingIds");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["bookings", bookingIds],
    queryFn: async () => {
      if (!bookingIds) return [];

      const result = await bookingApi.getBookingsByIds(bookingIds);
      return result.data.data;
    },
    enabled: !!bookingIds,
  });

  if (isLoading) {
    return (
      <main className="tickets-container" style={{ padding: "20px 0" }}>
        <section className="section-box">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>⏱</div>
            <h2>Đang tải vé...</h2>
          </div>
        </section>
      </main>
    );
  }

  if (error || !bookings || bookings.length === 0) {
    return (
      <main className="tickets-container" style={{ padding: "20px 0" }}>
        <section className="section-box">
          <div style={{ textAlign: "center", padding: "40px" }}>
            <div style={{ fontSize: "60px", marginBottom: "20px" }}>✕</div>
            <h2>Không tìm thấy vé</h2>
            <p>Có lỗi xảy ra khi tải thông tin vé.</p>
            <div className="booking-actions" style={{ marginTop: "20px" }}>
              <Link to="/" className="fd-btn">
                Về trang chủ
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const handleResendEmail = async (paymentCode: string) => {
    try {
      setIsSending(true);
      setMessage(null);
      await bookingApi.resendTicketEmail(paymentCode);
      setMessage({ type: 'success', text: 'Đã gửi lại email vé thành công!' });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi gửi email' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="tickets-container" style={{ padding: "20px 0" }}>
      <section className="section-box">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div>
            <h2 style={{ marginBottom: "4px" }}>✓ Đặt vé thành công!</h2>
            <p className="text-muted-sm">
              Cảm ơn bạn đã sử dụng My Cinema. Dưới đây là vé của bạn.
            </p>
            {message && (
              <div style={{ marginTop: "10px", padding: "10px", borderRadius: "4px", backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da', color: message.type === 'success' ? '#155724' : '#721c24' }}>
                {message.text}
              </div>
            )}
          </div>
          <div>
            {bookings[0]?.paymentCode && (
              <button 
                className="fd-btn" 
                onClick={() => handleResendEmail(bookings[0].paymentCode as string)}
                disabled={isSending}
                style={{ opacity: isSending ? 0.7 : 1 }}
              >
                {isSending ? 'Đang gửi...' : 'Gửi lại vé qua Email'}
              </button>
            )}
          </div>
        </div>

        <div style={{ marginTop: "16px" }}>
          <div className="tickets-grid">
            {bookings.map((booking: BookingDetail) => (
              <div key={booking.id} className="ticket-card">
                <div className="ticket-actions">
                  <button
                    className="fd-btn"
                    data-id={booking.id}
                    onClick={() => {
                      // Simple download as text for now
                      const ticketText = `
MY CINEMA
${booking.showtime.movie.title}
Suất: ${booking.showtime.showTime}
Ngày: ${new Date(booking.showtime.showDate).toLocaleDateString("vi-VN")}
Screen ${booking.showtime.room.name}
Seat ${booking.seat.seatNumber}
Rạp: ${booking.showtime.room.theater.name}
Địa chỉ: ${booking.showtime.room.theater.address}
Loại ghế: ${booking.seat.seatType}
Khách hàng: ${booking.customerName}
Điện thoại: ${booking.customerPhone}
Thời gian đặt: ${new Date(booking.bookingTime).toLocaleString("vi-VN")}
Mã vé: ${booking.id}
Giá vé: ${Math.round((booking.seat.seatType === "VIP" ? 75000 : 65000) * (new Date(booking.showtime.showDate).getDay() === 6 || new Date(booking.showtime.showDate).getDay() === 0 ? 1.15 : 1.0))} VND (VAT Included)
KHÔNG HOÀN TIỀN / Not Refund
                      `;
                      const blob = new Blob([ticketText], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `ticket-${booking.id}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                  >
                    Tải TXT
                  </button>
                </div>
                <div className="ticket-left">
                  <div className="ticket-logo">MY CINEMA</div>
                  <div className="ticket-movie">
                    {booking.showtime.movie.title}
                  </div>
                  <div className="ticket-meta">
                    <div>
                      Suất:
                      <strong>
                        {new Date(
                          `2000-01-01T${booking.showtime.showTime}`
                        ).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </div>
                    <div>
                      Ngày:
                      <strong>
                        {new Date(booking.showtime.showDate).toLocaleDateString(
                          "vi-VN"
                        )}
                      </strong>
                    </div>
                  </div>
                  <div className="ticket-big">
                    <div className="screen">
                      Screen
                      <span>
                        {booking.showtime.room.name ||
                          `#${booking.showtime.id}`}
                      </span>
                    </div>
                    <div className="seat">
                      Seat <span>{booking.seat.seatNumber}</span>
                    </div>
                  </div>
                  <div className="ticket-row">
                    <span>Rạp</span>
                    <strong>{booking.showtime.room.theater.name}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Địa chỉ</span>
                    <strong>{booking.showtime.room.theater.address}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Loại ghế</span>
                    <strong>{booking.seat.seatType}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Khách hàng</span>
                    <strong>{booking.customerName}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Điện thoại</span>
                    <strong>{booking.customerPhone}</strong>
                  </div>
                  <div className="ticket-row">
                    <span>Thời gian đặt</span>
                    <strong>
                      {new Date(booking.bookingTime).toLocaleString("vi-VN")}
                    </strong>
                  </div>
                  <div className="ticket-price">
                    Giá vé:
                    <strong>
                      {Math.round(
                        (booking.seat.seatType === "VIP" ? 75000 : 65000) *
                          (new Date(booking.showtime.showDate).getDay() === 6 ||
                          new Date(booking.showtime.showDate).getDay() === 0
                            ? 1.15
                            : 1.0)
                      ).toLocaleString("vi-VN")}{" "}
                      VND
                    </strong>
                    (VAT Included)
                  </div>
                </div>
                <div className="ticket-perforation"></div>
                <div className="ticket-right">
                  <div className="ticket-code">
                    Mã vé: <span>{booking.id}</span>
                  </div>
                  <div className="ticket-barcode"></div>
                  <div className="ticket-qr"></div>
                  <div className="ticket-print-note">
                    KHÔNG HOÀN TIỀN / Not Refund
                  </div>
                </div>
                <div className="ticket-stamp">KHÔNG HOÀN TIỀN</div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="booking-actions"
          style={{ marginTop: "16px", display: "flex", gap: "10px" }}
        >
          <Link to="/" className="fd-btn">
            Về trang chủ
          </Link>
          <Link to="/" className="fd-btn">
            Xem phim khác
          </Link>
        </div>
      </section>
    </main>
  );
}
