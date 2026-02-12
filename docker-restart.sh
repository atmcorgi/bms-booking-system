#!/usr/bin/env bash
set -e

# Script: docker-restart.sh
# Mục đích: Build lại image backend + frontend và khởi động chạy nền (detached)

# Di chuyển tới thư mục project (sửa lại nếu path khác)
cd /Users/maccutui/Downloads/MyDocuments/booking-system/bms_springboot-react

echo "🚀 Building backend & frontend..."
docker-compose build backend frontend

echo "🔁 Starting backend & frontend (detached)..."
docker-compose up -d backend frontend

echo "✅ Done."


