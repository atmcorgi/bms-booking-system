#!/bin/bash

# 1. Credentials
LOCAL_DB_USER="root"
LOCAL_DB_PASS="root123"
LOCAL_DB_NAME="bms_db"

# Railway Credentials (from your configuration)
REMOTE_HOST="shuttle.proxy.rlwy.net"
REMOTE_PORT="37036"
REMOTE_USER="root"
REMOTE_PASS="vciDdrEaQWPIUBRRGnBWtRCBIbwDChSO"
REMOTE_DB="railway"

echo "⏳ Dang tao backup tu Local Docker..."

# Use --add-drop-table to ensure tables are dropped before creation
# Using --single-transaction for consistency
docker-compose exec db mysqldump -u $LOCAL_DB_USER -p$LOCAL_DB_PASS --add-drop-table --single-transaction --no-tablespaces $LOCAL_DB_NAME > backup.sql

if [ $? -eq 0 ]; then
  echo "✅ Backup thanh cong: backup.sql"
  
  echo "⏳ Dang import len Railway..."
  
  # Create a wrapper SQL file that disables FK checks temporarily
  # This prevents errors when dropping tables in the wrong order
  echo "SET FOREIGN_KEY_CHECKS=0;" > wrapper_import.sql
  cat backup.sql >> wrapper_import.sql
  echo "SET FOREIGN_KEY_CHECKS=1;" >> wrapper_import.sql

  # Use docker container to run mysql client so we don't need mysql installed on host
  docker-compose exec -T db mysql -h $REMOTE_HOST -P $REMOTE_PORT -u $REMOTE_USER -p$REMOTE_PASS $REMOTE_DB < wrapper_import.sql
  
  if [ $? -eq 0 ]; then
    echo "🎉 MIGRATION THANH CONG! Check Railway DB ngay."
    rm backup.sql wrapper_import.sql
  else
    echo "❌ Loi khi import len Railway."
  fi
else
  echo "❌ Loi khi backup Local DB."
fi
