# Hướng dẫn cấu hình Environment Variables

## Tổng quan

Dự án này sử dụng file `.env` ở root project để quản lý các thông tin cấu hình nhạy cảm, giúp bảo mật và dễ dàng quản lý môi trường khác nhau.

## Cấu trúc file

### Root .env

File `.env` ở root project (cùng cấp với `docker-compose.yaml`) chứa tất cả các biến môi trường:

```bash
# Database Configuration
SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/bms_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=root123

# VNPAY Configuration
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:8080/vnpay/return
VNPAY_IPN_URL=http://localhost:8080/vnpay/ipn

# Security
SECURITY_JWT_SECRET=change-me

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Frontend Configuration
VITE_API_BASE_URL=http://backend:8080
```

## Cách thiết lập

### 1. Sao chép file example

```bash
cp .env.example .env
```

### 2. Cập nhật các giá trị thực tế

Mở file `.env` và thay thế các giá trị placeholder bằng thông tin thực tế:

- **Database**: Cập nhật thông tin kết nối database
- **VNPAY**: Thêm mã TMN và hash secret từ VNPAY
- **JWT Secret**: Tạo một secret key mạnh cho JWT
- **Cloudinary**: Thêm thông tin API từ Cloudinary dashboard

### 3. Bảo mật

- **KHÔNG BAO GIỜ** commit file `.env` vào Git
- File `.env` đã được thêm vào `.gitignore`
- Chỉ commit file `.env.example` để làm template

## Sử dụng với Docker

Docker Compose sử dụng cú pháp `${VARIABLE_NAME}` để tham chiếu đến biến môi trường:

```yaml
backend:
  environment:
    SPRING_DATASOURCE_URL: ${SPRING_DATASOURCE_URL}
    SPRING_DATASOURCE_USERNAME: ${SPRING_DATASOURCE_USERNAME}
    SPRING_DATASOURCE_PASSWORD: ${SPRING_DATASOURCE_PASSWORD}
    VNPAY_TMN_CODE: ${VNPAY_TMN_CODE}
    # ... các biến khác
```

Docker Compose sẽ tự động load file `.env` ở cùng thư mục và thay thế các biến.

## Môi trường khác nhau

### Development

- Sử dụng file `.env` với cấu hình local
- Database: db:3306 (Docker network)
- API: backend:8080 (Docker network)

### Production

- Tạo file `.env.production` với cấu hình production
- Sử dụng biến môi trường của server thay vì file .env
- Đảm bảo tất cả secrets được mã hóa

## Lưu ý bảo mật

1. **Không chia sẻ file .env** qua email, chat, hoặc bất kỳ kênh nào
2. **Sử dụng secret management** trong production (AWS Secrets Manager, Azure Key Vault, etc.)
3. **Rotate secrets** định kỳ, đặc biệt là JWT secret
4. **Sử dụng HTTPS** trong production
5. **Validate input** từ environment variables

## Troubleshooting

### Lỗi "Environment variable not found"

- Kiểm tra tên biến có đúng không
- Đảm bảo file `.env` tồn tại ở root project
- Restart Docker containers sau khi thay đổi `.env`

### Lỗi kết nối database

- Kiểm tra `SPRING_DATASOURCE_URL` có đúng format không
- Đảm bảo database container đang chạy
- Kiểm tra username/password

### Lỗi VNPAY

- Kiểm tra `VNPAY_TMN_CODE` và `VNPAY_HASH_SECRET`
- Đảm bảo URL callback đúng
- Kiểm tra network connectivity

## Cách hoạt động

1. **Docker Compose** đọc file `.env` ở root project
2. **Thay thế biến** trong `docker-compose.yaml` với cú pháp `${VARIABLE_NAME}`
3. **Truyền biến** vào container thông qua `environment` section
4. **Spring Boot** đọc biến môi trường từ container
5. **React** nhận biến thông qua build args trong Dockerfile
