# Hướng dẫn Tích hợp & Kiểm thử Thanh toán SePay (VietQR)

Hiện tại hệ thống đang được cấu hình với thông tin thanh toán trong file `.env`. Dưới đây là hướng dẫn chi tiết để bạn kiểm thử tính năng QR Code và hoàn thiện quy trình thanh toán.

## 1. Hiện trạng (Cấu hình)
Trong file `.env` (tại thư mục gốc), các biến sau đang được cấu hình:
```properties
SEPAY_BANK_ACC=888809012003     # Số tài khoản ngân hàng
SEPAY_BANK_NAME=MBBank          # Tên ngân hàng
SEPAY_API_KEY=spsk_test_...     # API Key từ SePay
NGROK_AUTHTOKEN=...             # Token ngrok để test webhook
```

## 2. Cách kiểm thử QR Code (Test hiển thị)
Để hiển thị mã QR Code thật (có thể quét được bằng App ngân hàng):
1. Mở file `.env`.
2. Đổi `SEPAY_BANK_ACC` thành số tài khoản thật của bạn (VD: `1903...`).
3. Đổi `SEPAY_BANK_NAME` thành tên ngân hàng của bạn (VD: `MBBank`, `VCB`, `ACB`, `TPBank`...).
4. Lưu file và khởi động lại Backend:
   ```bash
   docker-compose restart backend
   ```
5. Vào web đặt vé -> Đi đến bước thanh toán -> **Mã QR sẽ hiển thị thông tin thật của bạn.**

## 3. Cách cấu hình IPN (Webhook) để nhận thông báo thanh toán

### Bước 1: Lấy URL Public từ Ngrok
Mình đã tích hợp sẵn Ngrok vào Docker. Làm theo các bước sau:

1. Đăng ký tài khoản tại [ngrok.com](https://dashboard.ngrok.com/signup).
2. Lấy **Authtoken** tại dashboard.
3. Dán vào file `.env`: `NGROK_AUTHTOKEN=<token_của_bạn>`.
4. Chạy lệnh kích hoạt:
   ```bash
   docker-compose up -d ngrok
   ```
5. Truy cập: [http://localhost:4040](http://localhost:4040) -> Bạn sẽ thấy đường dẫn `https://....ngrok-free.app` hiển thị ở đó.

### Bước 2: Cấu hình IPN URL trong SePay Dashboard

> [!IMPORTANT]
> **Đây là bước quan trọng nhất!** Phải cấu hình đúng URL webhook.

1. Đăng nhập vào [SePay Dashboard](https://my.sepay.vn)
2. Vào **Settings** → **IPN Configuration**
3. Nhập **ĐƯỜNG DẪN ĐẦY ĐỦ** (không chỉ domain):
   ```
   https://xxxx-xxxx.ngrok-free.app/api/booking/sepay-webhook
   ```
   
   ⚠️ **Lưu ý:** Phải có `/api/booking/sepay-webhook` ở cuối!
   
4. Lưu cấu hình

### Bước 3: Test Webhook
Sau khi cấu hình xong, test bằng cách:

```bash
# Thay YOUR_NGROK_URL bằng URL thực tế từ bước 1
curl -X POST https://YOUR_NGROK_URL.ngrok-free.app/api/booking/sepay-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Transfer BMS1234567890",
    "amount": 150000
  }'
```

Nếu thành công, bạn sẽ thấy response: `OK`

## 4. Sau khi cấu hình xong
Bây giờ khi bạn chuyển khoản thật (hoặc giả lập), SePay sẽ gọi vào đường dẫn webhook -> Backend sẽ tự động cập nhật đơn hàng thành công!

## 5. Tính năng mới
- ⏱️ **Timeout tự động**: Đơn hàng sẽ tự động hủy sau 15 phút nếu chưa thanh toán
- 📋 **Copy mã thanh toán**: Nhấn nút "Sao chép" để copy mã giao dịch
- 💰 **Hiển thị số tiền**: Số tiền thanh toán được hiển thị rõ ràng
- ⏰ **Đồng hồ đếm ngược**: Theo dõi thời gian còn lại để thanh toán

## Troubleshooting

### Webhook không nhận được
- Kiểm tra IPN URL có đúng format: `https://xxx.ngrok-free.app/api/booking/sepay-webhook`
- Xem logs backend: `docker-compose logs -f backend`
- Kiểm tra ngrok dashboard: [http://localhost:4040](http://localhost:4040)

### QR Code không hiển thị
- Kiểm tra `SEPAY_BANK_ACC` và `SEPAY_BANK_NAME` trong `.env`
- Restart backend: `docker-compose restart backend`
