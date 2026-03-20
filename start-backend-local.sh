#!/usr/bin/env bash
set -e

echo "🚀 Khởi động Spring Boot Backend ở chế độ Local..."

# Tự động load biến môi trường từ file .env.render
# Dùng parse từng dòng để tránh lỗi khi giá trị có khoảng trắng (VD: Gmail App Password)
if [ -f .env.render ]; then
    while IFS='=' read -r key value; do
        # Bỏ qua dòng trống và dòng comment (#)
        [[ -z "$key" || "$key" == \#* ]] && continue
        # Bỏ kí tự xuống dòng cuối dòng
        value="${value%$'\r'}"
        export "$key=$value"
    done < .env.render
    echo "✅ Đã nạp thành công các biến môi trường từ .env.render"
else
    echo "⚠️ CẢNH BÁO: Không tìm thấy file .env.render. Backend có thể lỗi kết nối DB."
fi

echo "⏳ Đang chạy Spring Boot bằng Maven..."
cd backend
if [ -f "mvnw" ]; then
    ./mvnw spring-boot:run
else
    mvn spring-boot:run
fi
