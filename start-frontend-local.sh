#!/usr/bin/env bash
set -e

echo "🚀 Khởi động React/Vite Frontend ở chế độ Local..."
echo "✅ API sẽ được tự động gọi sang Backend ở http://localhost:8080 (theo cấu hình frontend/.env.local)"

cd frontend
echo "⏳ Đang chạy npm run dev..."
npm run dev
