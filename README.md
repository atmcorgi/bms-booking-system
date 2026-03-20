# 🎬 Booking Management System (BMS)

Hệ thống đặt vé phim hoàn chỉnh với Spring Boot backend và React frontend, triển khai CI/CD với Docker và GitHub Actions.

## 🏗️ Kiến trúc

```
bms_springboot-react/
├── backend/          # Spring Boot API (Java 21)
├── frontend/         # React SPA (TypeScript)
├── docker-compose.yml # Development environment
├── docker-compose.prod.yml # Production environment
└── .github/workflows/ # CI/CD pipeline
```

## 🚀 Quick Start

### 🖥️ Chạy Local (Không Docker) — Khuyên dùng khi phát triển

Cách này không cần Docker, nhẹ máy, backend kết nối vào DB Aiven (giống môi trường production).

**Yêu cầu:** Java 21, Maven, Node.js >= 18

**Bước 1:** Cấp quyền chạy script (chỉ làm 1 lần):
```bash
chmod +x start-backend-local.sh start-frontend-local.sh
```

**Bước 2:** Mở Terminal 1 — Chạy backend:
```bash
./start-backend-local.sh
# Đợi log "Started ... (xxx seconds)" là OK
```

**Bước 3:** Mở Terminal 2 — Chạy frontend:
```bash
./start-frontend-local.sh
```

**Truy cập:** http://localhost:5173

> ⚠️ **Lưu ý:** Vì dùng chung DB với production, hạn chế XÓA dữ liệu thật khi test local.

---

### 🐳 Chạy bằng Docker (Production-like)
```bash
# Clone repository
git clone <your-repo-url>
cd bms_springboot-react

# Start development environment
docker-compose up -d
```

### Truy cập ứng dụng (Docker)
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.5.5
- **Language**: Java 21
- **Database**: MySQL 8.0
- **Security**: Spring Security + JWT
- **Payment**: SePay (VietQR) integration
- **File Upload**: Cloudinary
- **Optimization**: OptaPlanner

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: TanStack React Query
- **Routing**: React Router v7

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Registry**: GitHub Container Registry
- **Monitoring**: Spring Boot Actuator

## 📋 Tính năng

### 👤 User Features
- ✅ Xem danh sách phim
- ✅ Tìm kiếm và lọc phim
- ✅ Chi tiết phim
- ✅ Đặt vé online
- ✅ Thanh toán SePay (VietQR)
- ✅ Xem vé đã đặt

### 🎭 Admin Features
- ✅ Quản lý phim
- ✅ Quản lý rạp chiếu
- ✅ Quản lý phòng chiếu
- ✅ Quản lý lịch chiếu
- ✅ Quản lý nhân viên
- ✅ Thống kê doanh thu

### 👨‍💼 Staff Features
- ✅ Dashboard nhân viên
- ✅ Quản lý lịch làm việc
- ✅ Xử lý đơn đặt vé
- ✅ Thông báo hệ thống

## 🐳 Docker Commands

```bash
# Development
make dev          # Start development environment
make build        # Build Docker images
make logs         # View all logs
make down         # Stop containers
make clean        # Clean up Docker resources

# Production
make prod         # Deploy to production
make prod-down    # Stop production

# Utilities
make health       # Check service health
make test         # Run tests
make install      # Install dependencies
```

## 🔧 Configuration

### Environment Variables
```bash
# Copy template
cp env.example .env

# Edit configuration
nano .env
```

### Required Environment Variables
- `MYSQL_ROOT_PASSWORD`: Database root password
- `MYSQL_DATABASE`: Database name
- `JWT_SECRET`: JWT secret key
- `SEPAY_BANK_ACC`: Bank account number
- `SEPAY_API_KEY`: SePay API Key
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name

## 🔄 CI/CD Pipeline

### Workflow Stages
1. **Test Backend**: Unit tests với MySQL
2. **Test Frontend**: Linting và build tests
3. **Build Images**: Docker images cho backend/frontend
4. **Push Registry**: Push lên GitHub Container Registry
5. **Deploy**: Deploy lên production server
6. **Security Scan**: Vulnerability scanning

### Trigger Conditions
- **Push to main**: Full CI/CD pipeline
- **Push to develop**: Test và build only
- **Pull Request**: Test và build only

## 📊 Database Schema

### Core Entities
- **Movie**: Thông tin phim
- **Theater**: Rạp chiếu
- **Room**: Phòng chiếu
- **Showtime**: Lịch chiếu
- **Booking**: Đơn đặt vé
- **User**: Người dùng

### Relationships
- Theater → Room (1:N)
- Room → Showtime (1:N)
- Showtime → Booking (1:N)
- Movie → Showtime (1:N)

## 🚀 Deployment

### Development
```bash
# Local development
make dev
```

### Production
```bash
# Deploy với CI/CD
git push origin main

# Manual deploy
make prod
```

## 📚 Documentation

- [Deployment Guide](DEPLOYMENT.md)
- [API Documentation](backend/README.md)
- [Frontend Guide](frontend/README.md)
- [Docker Setup](docker-compose.yml)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test locally: `make test`
5. Push và tạo Pull Request
6. CI/CD pipeline sẽ tự động chạy

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra logs: `make logs`
2. Xem health status: `make health`
3. Tạo issue trên GitHub
4. Liên hệ team development

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

**Made with ❤️ by Development Team**
