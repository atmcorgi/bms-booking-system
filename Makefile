# Makefile cho Booking Management System

.PHONY: help build up down logs clean test dev prod

# Default target
help: ## Hiển thị danh sách các lệnh có sẵn
	@echo "Booking Management System - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
dev: ## Chạy ứng dụng trong môi trường development
	docker-compose up -d
	@echo "🚀 Development environment started!"
	@echo "Frontend: http://localhost"
	@echo "Backend API: http://localhost:8080"

build: ## Build Docker images
	docker-compose build

up: ## Start containers
	docker-compose up -d

down: ## Stop containers
	docker-compose down

logs: ## Xem logs của tất cả containers
	docker-compose logs -f

logs-backend: ## Xem logs của backend
	docker-compose logs -f backend

logs-frontend: ## Xem logs của frontend
	docker-compose logs -f frontend

logs-mysql: ## Xem logs của MySQL
	docker-compose logs -f mysql

# Testing Commands
test: ## Chạy tests cho cả backend và frontend
	@echo "🧪 Running backend tests..."
	cd backend && mvn test
	@echo "🧪 Running frontend tests..."
	cd frontend && npm test

test-backend: ## Chạy tests cho backend
	cd backend && mvn test

test-frontend: ## Chạy tests cho frontend
	cd frontend && npm test

# Production Commands
prod: ## Deploy lên production (cần cấu hình .env)
	docker-compose -f docker-compose.prod.yml up -d
	@echo "🚀 Production environment started!"

prod-down: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

# Utility Commands
clean: ## Xóa tất cả containers, images và volumes
	docker-compose down -v
	docker system prune -f
	docker volume prune -f
	@echo "🧹 Cleaned up Docker resources"

clean-images: ## Xóa tất cả Docker images
	docker rmi $(docker images -q) -f

restart: ## Restart tất cả services
	docker-compose restart

restart-backend: ## Restart backend service
	docker-compose restart backend

restart-frontend: ## Restart frontend service
	docker-compose restart frontend

# Database Commands
db-shell: ## Kết nối vào MySQL shell
	docker-compose exec mysql mysql -u bms_user -p bms_db

db-backup: ## Backup database
	docker-compose exec mysql mysqldump -u bms_user -p bms_db > backup_$(shell date +%Y%m%d_%H%M%S).sql

# Health Check
health: ## Kiểm tra health của các services
	@echo "🔍 Checking service health..."
	@echo "Frontend:"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "❌ Frontend not responding"
	@echo ""
	@echo "Backend:"
	@curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/actuator/health || echo "❌ Backend not responding"
	@echo ""
	@echo "MySQL:"
	@docker-compose exec mysql mysqladmin ping -h localhost || echo "❌ MySQL not responding"

# Development Tools
install: ## Cài đặt dependencies cho development
	@echo "📦 Installing backend dependencies..."
	cd backend && mvn clean install -DskipTests
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install

# Git Commands
git-push: ## Push code và trigger CI/CD
	git add .
	git commit -m "Update: $(shell date +%Y-%m-%d\ %H:%M:%S)"
	git push origin main

# Monitoring
monitor: ## Mở dashboard monitoring (nếu có)
	@echo "📊 Opening monitoring dashboard..."
	@echo "Docker stats:"
	docker stats --no-stream
