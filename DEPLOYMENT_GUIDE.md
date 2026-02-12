# Hướng dẫn Deploy Production (Split Deployment)

Tài liệu này hướng dẫn deploy hệ thống BMS theo mô hình:
- **Backend & Database**: Deploy trên VPS/Server riêng (Docker Compose).
- **Frontend**: Deploy trên Vercel.

## Phần 1: Deploy Backend & Database (trên VPS)

### 1. Chuẩn bị VPS
- Cài đặt Docker & Docker Compose.
- Clone source code về VPS.

### 2. Cấu hình Backend
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Cập nhật trong file `.env`:
- `SPRING_DATASOURCE_URL`: Giữ nguyên nếu dùng container db.
- `FRONTEND_BASE_URL`: **QUAN TRỌNG**. Đặt là URL của Frontend trên Vercel (ví dụ: `https://my-bms-frontend.vercel.app`). API sẽ dùng giá trị này để cấu hình CORS, cho phép Frontend gọi vào.
- Các biến khác (SePay, Cloudinary, Mail...): Cấu hình như bình thường.

### 3. Chạy Backend
Sử dụng file `docker-compose.prod.yaml` (đã loại bỏ frontend):

```bash
docker-compose -f docker-compose.prod.yaml up -d --build
```
Backend sẽ chạy ở port `8080`. Đảm bảo Firewall của VPS cho phép truy cập port này.

## Phần 2: Deploy Frontend (trên Vercel)

### 1. Push code lên GitHub/GitLab
Đảm bảo code frontend đã nằm trong repository của bạn.

### 2. Tạo Project trên Vercel
- Truy cập [vercel.com](https://vercel.com) -> **Add New** -> **Project**.
- Import repository chứa code.
- Framework Preset: Chọn **Vite**.
- Root Directory: Chọn `frontend`. **Lưu ý quan trọng**: Vercel hỗ trợ Monorepo rất tốt, bạn KHÔNG CẦN tách repo riêng. Chỉ cần trỏ đúng thư mục `frontend` là được.

### 3. Cấu hình Environment Variables trên Vercel
Trong phần **Environment Variables**, thêm biến:
- `VITE_API_BASE_URL`: Địa chỉ IP hoặc Domain của Backend VPS.
  - Ví dụ: `http://1.2.3.4:8080` hoặc `https://api.yourdomain.com` (nếu có SSL).
  - **Lưu ý**: Nếu backend ko có SSL (http), trình duyệt có thể chặn mixed content nếu frontend chạy https. Tốt nhất Backend cũng nên có SSL (dùng Nginx/Cloudflare làm proxy).

### 4. Deploy
Nhấn **Deploy**. Vercel sẽ build và cung cấp URL (ví dụ: `https://bms-frontend.vercel.app`).

### 5. Quay lại cấu hình Backend
Lấy URL vừa có từ Vercel, cập nhật lại biến `FRONTEND_BASE_URL` trong file `.env` trên VPS và restart backend:
```bash
docker-compose -f docker-compose.prod.yaml restart backend
```

## Troubleshooting

### Lỗi CORS (Frontend không gọi được API)
- Kiểm tra Network Tab (F12) trên trình duyệt.
- Nếu thấy lỗi CORS:
  1. Kiểm tra biến `FRONTEND_BASE_URL` trong `.env` backend đã đúng URL Vercel chưa (không có dấu `/` ở cuối).
  2. Kiểm tra code Java `CorsConfiguration` xem đã allow origin từ biến môi trường chưa.

### Lỗi Mixed Content
- Frontend (Vercel) mặc định là HTTPS.
- Backend (VPS IP) mặc định là HTTP.
- Trình duyệt sẽ chặn request từ HTTPS -> HTTP.
- **Giải pháp**: Cấu hình SSL cho Backend (dùng Nginx với Certbot hoặc Cloudflare Tunnel) để Backend cũng có HTTPS.
