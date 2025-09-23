# Cấu trúc Monorepo cho Booking Management System

```
bms_springboot-react/
├── .github/
│   └── workflows/
│       ├── ci-cd.yml              # Main CI/CD pipeline
│       ├── backend-test.yml       # Backend specific tests
│       └── frontend-test.yml      # Frontend specific tests
├── backend/                       # Spring Boot API
│   ├── src/
│   ├── Dockerfile
│   ├── pom.xml
│   └── README.md
├── frontend/                      # React Application
│   ├── src/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── docker-compose.yml             # Development environment
├── docker-compose.prod.yml        # Production environment
├── .env.example                   # Environment variables template
├── Makefile                       # Development commands
├── DEPLOYMENT.md                  # Deployment guide
├── README.md                      # Main project documentation
└── .gitignore                     # Git ignore rules
```

## Lợi ích của cấu trúc này:

### 🔄 CI/CD Pipeline

- **Single workflow**: 1 file config cho toàn bộ pipeline
- **Parallel jobs**: Test backend và frontend cùng lúc
- **Atomic deployment**: Deploy cả 2 services cùng lúc
- **Version sync**: Đảm bảo compatibility

### 🐳 Docker Management

- **Single compose**: Quản lý tất cả services
- **Shared network**: Services communicate dễ dàng
- **Volume management**: Centralized data persistence
- **Environment consistency**: Dev = Prod

### 📚 Documentation

- **Single source**: Tất cả docs ở 1 nơi
- **Cross-references**: Link giữa backend/frontend docs
- **Deployment guide**: Hướng dẫn deploy toàn bộ hệ thống

### 👥 Team Collaboration

- **Shared issues**: Track bugs across services
- **Unified releases**: Version numbering đồng bộ
- **Code reviews**: Review related changes together
- **Knowledge sharing**: Team hiểu toàn bộ system

## Workflow với Monorepo:

### 1. Development

```bash
# Clone repository
git clone <repo-url>
cd bms_springboot-react

# Start development environment
make dev

# Work on backend
cd backend
# Make changes...

# Work on frontend
cd frontend
# Make changes...

# Commit related changes together
git add backend/ frontend/
git commit -m "Add new booking feature"
```

### 2. CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: Full Stack CI/CD
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Backend
        run: |
          cd backend
          mvn test

  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Test Frontend
        run: |
          cd frontend
          npm test

  build-and-deploy:
    needs: [test-backend, test-frontend]
    runs-on: ubuntu-latest
    steps:
      - name: Build Backend Image
        run: docker build -t backend:latest ./backend
      - name: Build Frontend Image
        run: docker build -t frontend:latest ./frontend
      - name: Deploy All Services
        run: docker-compose -f docker-compose.prod.yml up -d
```

### 3. Version Management

```bash
# Tag releases
git tag v1.0.0
git push origin v1.0.0

# Create releases
gh release create v1.0.0 --title "Version 1.0.0" --notes "Initial release"
```

## Migration từ Multi-repo sang Monorepo:

### Nếu bạn đã có 2 repos riêng:

1. **Create new monorepo**
2. **Move backend code**: `git subtree pull --prefix=backend <backend-repo> main`
3. **Move frontend code**: `git subtree pull --prefix=frontend <frontend-repo> main`
4. **Update CI/CD**: Merge 2 workflows thành 1
5. **Update documentation**: Consolidate docs

### Nếu bắt đầu mới:

1. **Create repository**: `git init bms_springboot-react`
2. **Add backend**: Copy code vào `backend/`
3. **Add frontend**: Copy code vào `frontend/`
4. **Setup CI/CD**: Tạo workflow file
5. **Documentation**: Viết README và deployment guide
