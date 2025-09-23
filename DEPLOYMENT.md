# Hướng dẫn Triển khai CI/CD cho Booking Management System

## 📋 Tổng quan

Dự án này sử dụng Docker và GitHub Actions để triển khai CI/CD pipeline cho hệ thống đặt vé phim với:

- **Backend**: Spring Boot 3.5.5 + Java 21 + MySQL
- **Frontend**: React 19 + TypeScript + Vite
- **Infrastructure**: Docker + Docker Compose + GitHub Actions

## 🚀 Quick Start

### 1. Development Environment

```bash
# Clone repository
git clone <your-repo-url>
cd bms_springboot-react

# Copy environment file
cp env.example .env

# Start development environment
make dev

# Hoặc sử dụng docker-compose trực tiếp
docker-compose up -d
```

### 2. Truy cập ứng dụng

- **Frontend**: http://localhost
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/actuator/health

## 🐳 Docker Commands

### Development

```bash
make dev          # Start development environment
make build        # Build Docker images
make logs         # View all logs
make logs-backend # View backend logs only
make down         # Stop containers
make clean        # Clean up all Docker resources
```

### Production

```bash
make prod         # Deploy to production
make prod-down    # Stop production
```

## 🔧 Configuration

### 1. Environment Variables

Tạo file `.env` từ `env.example`:

```bash
cp env.example .env
```

Cấu hình các biến môi trường:

```env
# Database
MYSQL_ROOT_PASSWORD=your_secure_password
MYSQL_DATABASE=bms_db
MYSQL_USER=bms_user
MYSQL_PASSWORD=your_secure_password

# Security
JWT_SECRET=your_very_long_jwt_secret

# VNPay (Production)
VNPAY_TMNCODE=your_tmncode
VNPAY_HASHSECRET=your_hash_secret
VNPAY_PAYURL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 2. GitHub Secrets

Cấu hình các secrets trong GitHub repository:

```
HOST=your_server_ip
USERNAME=your_ssh_username
SSH_KEY=your_ssh_private_key
MYSQL_ROOT_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret
VNPAY_TMNCODE=your_vnpay_tmncode
VNPAY_HASHSECRET=your_vnpay_hash_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

## 🔄 CI/CD Pipeline

### Workflow Stages

1. **Test Backend**: Chạy unit tests với MySQL test database
2. **Test Frontend**: Chạy linting và build tests
3. **Build Images**: Build Docker images cho backend và frontend
4. **Push to Registry**: Push images lên GitHub Container Registry
5. **Deploy**: Deploy lên production server
6. **Security Scan**: Quét bảo mật với Trivy

### Trigger Conditions

- **Push to main**: Full CI/CD pipeline
- **Push to develop**: Test và build only
- **Pull Request**: Test và build only

### Manual Deployment

```bash
# Push code để trigger deployment
git add .
git commit -m "Update: $(date)"
git push origin main

# Hoặc sử dụng Makefile
make git-push
```

## 🏗️ Architecture

### Docker Compose Structure

```
├── mysql          # Database
├── backend        # Spring Boot API
├── frontend       # React SPA
└── nginx          # Reverse proxy (production)
```

### Network Configuration

- **Development**: `bms_network` (bridge)
- **Production**: `bms_prod_network` (bridge)

### Volume Management

- `mysql_data`: Database persistence
- `backend_logs`: Application logs
- `mysql_prod_data`: Production database
- `backend_logs`: Production logs

## 🔒 Security Features

### 1. Docker Security

- Non-root user trong containers
- Multi-stage builds
- Health checks
- Resource limits

### 2. Application Security

- JWT authentication
- Environment variable injection
- Security headers trong Nginx
- SSL/TLS support

### 3. CI/CD Security

- GitHub Actions secrets
- Trivy vulnerability scanning
- SARIF security reports

## 📊 Monitoring & Logging

### Health Checks

```bash
make health  # Check all services
```

### Logs

```bash
make logs           # All services
make logs-backend   # Backend only
make logs-frontend  # Frontend only
make logs-mysql     # Database only
```

### Metrics

- Spring Boot Actuator: `/actuator/health`, `/actuator/metrics`
- Docker stats: `docker stats`

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**

   ```bash
   # Check port usage
   lsof -i :80
   lsof -i :8080
   lsof -i :3306
   ```

2. **Database connection issues**

   ```bash
   # Check MySQL logs
   make logs-mysql

   # Connect to database
   make db-shell
   ```

3. **Build failures**

   ```bash
   # Clean and rebuild
   make clean
   make build
   ```

4. **Permission issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

### Debug Commands

```bash
# Container shell access
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec mysql bash

# View container details
docker-compose ps
docker inspect <container_name>

# View network
docker network ls
docker network inspect bms_springboot-react_bms_network
```

## 📈 Performance Optimization

### 1. Docker Optimization

- Multi-stage builds
- Layer caching
- .dockerignore files
- Resource limits

### 2. Application Optimization

- Database connection pooling
- Redis caching (optional)
- CDN cho static assets
- Gzip compression

### 3. CI/CD Optimization

- Parallel jobs
- Cache dependencies
- Incremental builds
- Selective deployment

## 🔄 Backup & Recovery

### Database Backup

```bash
make db-backup
```

### Full System Backup

```bash
# Backup volumes
docker run --rm -v bms_springboot-react_mysql_data:/data -v $(pwd):/backup alpine tar czf /backup/mysql_backup.tar.gz /data

# Backup logs
docker run --rm -v bms_springboot-react_backend_logs:/data -v $(pwd):/backup alpine tar czf /backup/logs_backup.tar.gz /data
```

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [React Docker Guide](https://create-react-app.dev/docs/deployment/#docker)

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Make changes
4. Test locally với `make dev`
5. Push và tạo Pull Request
6. CI/CD pipeline sẽ tự động chạy tests

## 📞 Support

Nếu gặp vấn đề, hãy:

1. Kiểm tra logs: `make logs`
2. Xem health status: `make health`
3. Tạo issue trên GitHub repository
4. Liên hệ team development
