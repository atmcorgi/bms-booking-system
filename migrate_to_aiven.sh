#!/bin/bash

# 1. Credentials Local DB (Docker)
LOCAL_DB_USER="root"
LOCAL_DB_PASS="root123"
LOCAL_DB_NAME="bms_db"

# 2. AIVEN Credentials
REMOTE_HOST="mysql-f450479-bookingmoviesystem911.a.aivencloud.com"
REMOTE_PORT="10781"
REMOTE_USER="avnadmin"
REMOTE_PASS="********"
REMOTE_DB="defaultdb"

echo "⏳ Dang tao backup tu Local Docker..."

# Chạy mysqldump lấy dữ liệu từ DB Local
docker-compose exec db mysqldump -u $LOCAL_DB_USER -p$LOCAL_DB_PASS --add-drop-table --single-transaction --no-tablespaces $LOCAL_DB_NAME > backup.sql

if [ $? -eq 0 ]; then
  echo "✅ Backup thanh cong: backup.sql"
  
  echo "⏳ Dang import len Aiven Cloud..."
  
  # Tạo file bọc tắt kiểm tra khóa ngoại để tránh lỗi khi Drop/Create tables
  echo "SET FOREIGN_KEY_CHECKS=0;" > wrapper_import.sql
  cat backup.sql >> wrapper_import.sql
  echo "SET FOREIGN_KEY_CHECKS=1;" >> wrapper_import.sql

  # Dùng mysql client đẩy thẳng lên Aiven (Bắt buộc thêm --ssl-mode=REQUIRED)
  docker-compose exec -T db mysql -h $REMOTE_HOST -P $REMOTE_PORT -u $REMOTE_USER -p$REMOTE_PASS --ssl-mode=REQUIRED $REMOTE_DB < wrapper_import.sql
  
  if [ $? -eq 0 ]; then
    echo "🎉 MIGRATION THANH CONG! Database Local da duoc be len Aiven an toan."
    rm backup.sql wrapper_import.sql
  else
    echo "❌ Loi khi import len Aiven."
  fi
else
  echo "❌ Loi khi backup Local DB. (Hay kiem tra xem container db da bat chua bằng 'docker-compose up -d')"
fi
