#!/bin/bash

echo "=== LOCAL DB (docker) ==="
docker-compose exec -T db mysql -u root -proot123 bms_db -e "SELECT 'Theaters:', COUNT(*) FROM theater; SELECT 'Movies:', COUNT(*) FROM movie; SELECT 'Accounts:', COUNT(*) FROM account; SELECT 'Bookings:', COUNT(*) FROM booking;"

echo -e "\n=== REMOTE DB (Railway) ==="
docker-compose exec -T db mysql -h shuttle.proxy.rlwy.net -P 37036 -u root -pvciDdrEaQWPIUBRRGnBWtRCBIbwDChSO railway -e "SELECT 'Theaters:', COUNT(*) FROM theater; SELECT 'Movies:', COUNT(*) FROM movie; SELECT 'Accounts:', COUNT(*) FROM account; SELECT 'Bookings:', COUNT(*) FROM booking;"

echo -e "\n=== SAMPLE THEATERS (Remote) ==="
docker-compose exec -T db mysql -h shuttle.proxy.rlwy.net -P 37036 -u root -pvciDdrEaQWPIUBRRGnBWtRCBIbwDChSO railway -e "SELECT id, name FROM theater LIMIT 5;"

echo -e "\n=== SAMPLE MOVIES (Remote) ==="
docker-compose exec -T db mysql -h shuttle.proxy.rlwy.net -P 37036 -u root -pvciDdrEaQWPIUBRRGnBWtRCBIbwDChSO railway -e "SELECT id, title FROM movie LIMIT 5;"
