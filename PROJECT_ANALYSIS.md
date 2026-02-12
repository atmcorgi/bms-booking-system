# 📊 Phân tích Project - Booking Management System (BMS)

## 🎯 Tổng quan Project

Đây là một **hệ thống đặt vé phim** hoàn chỉnh với kiến trúc **microservices-style**, sử dụng:
- **Backend**: Spring Boot 3.5.5 (Java 21) - REST API
- **Frontend**: React 19 (TypeScript) - Single Page Application
- **Database**: MySQL 8.0
- **Containerization**: Docker + Docker Compose
- **Payment**: VNPAY integration

---

## 🏗️ Kiến trúc và Luồng Hoạt động

### **1. Kiến trúc Tổng thể**

```
┌─────────────────┐
│   Frontend      │  React SPA (Port 5173)
│   (Nginx)       │  └─> TanStack React Query
└────────┬────────┘  └─> React Router v7
         │
         │ HTTP/REST API
         │
┌────────▼────────┐
│   Backend       │  Spring Boot (Port 8080)
│   (Java 21)     │  └─> Spring Security + JWT
└────────┬────────┘  └─> Spring Data JPA
         │
         │ JDBC
         │
┌────────▼────────┐
│   MySQL 8.0     │  Database (Port 3306)
│   (Docker)      │
└─────────────────┘
```

### **2. Docker Architecture**

Docker đóng vai trò **quan trọng** trong project này:

#### **A. Containerization**
- **Backend Container**: Build từ Maven, chạy JAR file
- **Frontend Container**: Build từ Vite, serve bằng Nginx
- **Database Container**: MySQL 8.0 với persistent volume

#### **B. Docker Compose Services**

```yaml
services:
  db:          # MySQL database
  backend:     # Spring Boot API
  frontend:    # React SPA (Nginx)
```

#### **C. Vai trò của Docker:**

1. **Development Environment**
   - Đồng nhất môi trường cho tất cả developers
   - Không cần cài đặt Java, Node.js, MySQL trên máy local
   - Dễ dàng setup và chạy project

2. **Dependency Management**
   - MySQL tự động khởi động và cấu hình
   - Backend và Frontend tự động kết nối với database
   - Network isolation giữa các services

3. **Build & Deployment**
   - Multi-stage builds tối ưu image size
   - Caching layers để tăng tốc build
   - Sẵn sàng cho production deployment

4. **Environment Configuration**
   - Quản lý biến môi trường qua `.env` file
   - Tách biệt config giữa dev/prod
   - Bảo mật secrets

---

## 🔄 Luồng Hoạt động Chi tiết

### **1. Luồng Đặt Vé (Booking Flow)**

```
User → Frontend → Backend → Database
         ↓
    BookingFlow Component
         ↓
    Step 1: Chọn Tỉnh/Thành phố
    Step 2: Chọn Quận/Huyện
    Step 3: Chọn Rạp chiếu
    Step 4: Chọn Ngày chiếu
    Step 5: Chọn Suất chiếu
    Step 6: Chọn Ghế (có thể chọn nhiều)
    Step 7: Nhập thông tin khách hàng
    Step 8: Thanh toán VNPAY
```

#### **A. Frontend Flow (BookingFlow.tsx)**

1. **Location Selection**
   - API: `/booking/api/locations` → Lấy danh sách tỉnh/thành
   - API: `/booking/api/districts?provinceId=X` → Lấy quận/huyện
   - API: `/booking/api/theaters?provinceId=X&districtId=Y` → Lấy rạp

2. **Showtime Selection**
   - API: `/booking/api/showdates?theaterId=X` → Lấy ngày chiếu
   - API: `/booking/api/showtimes?theaterId=X&showDate=Y` → Lấy suất chiếu
   - Group theo time buckets: Sáng, Chiều, Tối, Đêm

3. **Seat Selection**
   - API: `/booking/api/seats?showtimeId=X` → Lấy danh sách ghế
   - **Seat Hold System**: 
     - `POST /api/booking/shows/{showtimeId}/holds?seatId=X` → Giữ ghế (TTL 2 phút)
     - `DELETE /api/booking/shows/{showtimeId}/holds?seatId=X` → Release ghế
   - Cho phép chọn **nhiều ghế** cùng lúc

4. **Payment Initiation**
   - API: `POST /booking/api/booking` → Tạo booking và payment URL
   - Backend tạo VNPAY payment URL
   - Redirect user đến VNPAY payment page

#### **B. Backend Flow**

**⚠️ LƯU Ý QUAN TRỌNG**: Endpoint `/booking/api/booking` **CHƯA ĐƯỢC IMPLEMENT** trong code hiện tại!

Hiện tại chỉ có:
- `BookingController.java` - Chỉ có seat hold/release endpoints
- Chưa có controller xử lý tạo booking và VNPAY payment

**Cần implement:**
```java
@PostMapping("/booking/api/booking")
public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
    // 1. Validate seat holds
    // 2. Create booking records (pending status)
    // 3. Generate VNPAY payment URL
    // 4. Store booking info in session
    // 5. Return payment URL
}
```

### **2. Luồng Thanh toán VNPAY**

```
User → VNPAY Payment Page
         ↓
    Thanh toán thành công
         ↓
    VNPAY redirect về: /booking/success?txnRef=...
         ↓
    BookingSuccess.tsx
         ↓
    Process payment callback
         ↓
    Update booking status
         ↓
    Redirect to /booking/tickets
```

**Hiện tại**: `BookingSuccess.tsx` đang dùng **mock data**, chưa có API thực tế để xử lý payment callback.

**Cần implement:**
- Endpoint xử lý VNPAY callback
- Update booking status từ "pending" → "confirmed"
- Xử lý trường hợp payment failed

### **3. Luồng Xem Vé (Tickets)**

- Page: `/booking/tickets`
- Component: `Tickets.tsx`
- API: `/booking/api/bookings?ids=1,2,3` → Lấy thông tin vé

---

## ✅ Các Chức năng Đã Hoàn thành

### **👤 User Features**

1. **Xem danh sách phim**
   - ✅ API: `/api/movies/now-showing` - Phim đang chiếu
   - ✅ API: `/api/movies/coming-soon` - Phim sắp chiếu
   - ✅ Infinite scroll với pagination
   - ✅ Movie cards với poster, title, rating

2. **Tìm kiếm và lọc phim**
   - ✅ API: `/api/movies/search?q=...&genre=...&year=...`
   - ✅ Search bar với filters
   - ✅ Genre và year filters

3. **Chi tiết phim**
   - ✅ Page: `/movies/:id`
   - ✅ Component: `MovieDetail.tsx`
   - ✅ Hiển thị: poster, trailer, description, cast, genres

4. **Đặt vé (Partial)**
   - ✅ Booking flow UI hoàn chỉnh
   - ✅ Seat selection với hold system
   - ✅ Multi-seat selection
   - ⚠️ **Thiếu**: API tạo booking và VNPAY payment

5. **Xem vé đã đặt**
   - ✅ Page: `/booking/tickets`
   - ⚠️ **Thiếu**: API lấy danh sách vé của user

### **🎭 Admin Features**

1. **Quản lý Genre**
   - ✅ CRUD operations
   - ✅ API: `/api/admin/genres`
   - ✅ Pages: GenreList, GenreForm

2. **Quản lý Theater**
   - ✅ CRUD operations
   - ✅ API: `/api/admin/theaters`
   - ✅ Pages: TheaterList, TheaterForm, TheaterDetail
   - ✅ Quản lý Rooms trong theater

3. **Quản lý Movie**
   - ✅ Movie Intake system
   - ✅ API: `/api/admin/movies`
   - ✅ Upload poster/trailer (Cloudinary)
   - ✅ Pages: MovieIntakeList, MovieIntakeForm

4. **Thống kê**
   - ✅ API: `/api/admin/stats`
   - ✅ Dashboard với charts

### **👨‍💼 Staff Features**

1. **Dashboard**
   - ✅ Page: `/staff`
   - ✅ Component: `StaffDashboard.tsx`
   - ✅ API: `/api/staff/dashboard`

2. **Quản lý lịch chiếu**
   - ✅ Page: `/staff/scheduling`
   - ✅ Component: `Scheduling.tsx`
   - ✅ Upload CSV scheduling
   - ✅ Validation và preview
   - ✅ Commit scheduling

3. **Quản lý phim**
   - ✅ Page: `/staff/movies`
   - ✅ Component: `MovieManagement.tsx`

---

## ⚠️ Các Chức năng Chưa Hoàn thành / Cần Fix

### **🔴 Critical Issues**

1. **Booking & Payment Flow**
   - ❌ **Thiếu**: Controller xử lý `POST /booking/api/booking`
   - ❌ **Thiếu**: Service tạo booking records
   - ❌ **Thiếu**: VNPAY payment URL generation
   - ❌ **Thiếu**: Payment callback handler
   - ❌ **Thiếu**: Booking status update sau payment

2. **Session Management**
   - ⚠️ Backend sử dụng HTTP Session cho seat holds
   - ⚠️ Cần Redis cho production (scalability)
   - ⚠️ Session timeout handling

3. **BookingSuccess Page**
   - ❌ Đang dùng mock data
   - ❌ Chưa có API xử lý payment callback

### **🟡 Medium Priority**

1. **User Authentication**
   - ✅ JWT authentication đã có
   - ⚠️ Chưa có user registration
   - ⚠️ Chưa có password reset
   - ⚠️ Chưa có user profile

2. **Booking History**
   - ❌ Chưa có API lấy booking history của user
   - ❌ Chưa có page hiển thị booking history

3. **Email Notifications**
   - ❌ Chưa có email confirmation
   - ❌ Chưa có email ticket

4. **Error Handling**
   - ⚠️ Cần improve error messages
   - ⚠️ Cần error logging

### **🟢 Nice to Have**

1. **Optimization**
   - ✅ OptaPlanner đã có trong dependencies
   - ❌ Chưa implement scheduling optimization

2. **Image Optimization**
   - ✅ LazyImage component đã có
   - ✅ Image optimization service đã có
   - ⚠️ Cần test và optimize

3. **Testing**
   - ❌ Chưa có unit tests
   - ❌ Chưa có integration tests
   - ❌ Chưa có E2E tests

---

## 🔧 Cấu trúc Code

### **Backend Structure**

```
backend/
├── controller/
│   ├── admin/          # Admin APIs
│   ├── auth/           # Authentication
│   ├── booking/        # Booking APIs (incomplete)
│   ├── home/           # Home/Movie listing
│   ├── movie/          # Movie APIs
│   ├── staff/          # Staff APIs
│   └── theater/        # Theater APIs
├── entity/             # JPA Entities
├── repository/         # JPA Repositories
├── service/            # Business Logic
│   ├── admin/
│   ├── booking/        # SeatHoldService
│   ├── movie/
│   ├── scheduling/
│   ├── staff/
│   └── theater/
├── config/             # Configuration
│   ├── SecurityConfig
│   ├── VnpayConfig
│   └── ...
└── util/               # Utilities
    └── VnpayUtil
```

### **Frontend Structure**

```
frontend/
├── components/         # Reusable components
│   ├── BookingFlow.tsx
│   ├── MovieCard.tsx
│   └── ...
├── pages/             # Page components
│   ├── admin/
│   ├── staff/
│   ├── MovieDetail.tsx
│   ├── BookingSuccess.tsx
│   └── ...
├── services/          # API services
│   ├── apiClient.ts
│   ├── bookingApi.ts
│   └── ...
├── layouts/           # Layout components
└── hooks/             # Custom hooks
```

---

## 🚀 Hướng Phát triển Tiếp theo

### **Phase 1: Hoàn thiện Booking Flow (Ưu tiên cao)**

1. **Implement Booking Controller**
   ```java
   @PostMapping("/booking/api/booking")
   public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
       // Validate seat holds
       // Create booking records (status: PENDING)
       // Generate VNPAY payment URL
       // Store in session
       // Return payment URL
   }
   ```

2. **Implement Payment Callback Handler**
   ```java
   @GetMapping("/booking/api/payment/callback")
   public ResponseEntity<?> handlePaymentCallback(@RequestParam Map<String, String> params) {
       // Verify VNPAY signature
       // Update booking status
       // Return success/failure
   }
   ```

3. **Implement Booking Service**
   - Create booking records
   - Update booking status
   - Handle payment confirmation

4. **Fix BookingSuccess Page**
   - Remove mock data
   - Call real API
   - Handle payment callback

### **Phase 2: User Management**

1. **User Registration**
   - Registration API
   - Email verification
   - User profile

2. **Booking History**
   - API: `/api/user/bookings`
   - Page: `/user/bookings`
   - Filter by status, date

3. **User Profile**
   - Edit profile
   - Change password
   - View booking history

### **Phase 3: Enhancements**

1. **Email Notifications**
   - Booking confirmation email
   - Payment receipt
   - Reminder emails

2. **SMS Notifications** (Optional)
   - Booking confirmation SMS
   - Payment reminder

3. **Push Notifications** (Optional)
   - Real-time seat availability
   - Special offers

### **Phase 4: Optimization**

1. **Caching**
   - Redis for session management
   - Cache movie listings
   - Cache theater/showtime data

2. **Performance**
   - Database indexing
   - Query optimization
   - Image CDN

3. **Monitoring**
   - Application monitoring (Prometheus)
   - Log aggregation (ELK)
   - Error tracking (Sentry)

### **Phase 5: Advanced Features**

1. **Loyalty Program**
   - Points system
   - Rewards
   - Discounts

2. **Recommendation System**
   - Movie recommendations
   - Personalized suggestions

3. **Social Features**
   - Share booking
   - Reviews and ratings
   - Social login

---

## 📝 Checklist để Project Hoàn chỉnh

### **Backend**
- [ ] Implement `POST /booking/api/booking`
- [ ] Implement `GET /booking/api/payment/callback`
- [ ] Implement Booking Service
- [ ] Add booking status management
- [ ] Add user registration API
- [ ] Add booking history API
- [ ] Add email service
- [ ] Add Redis for session management
- [ ] Add unit tests
- [ ] Add integration tests

### **Frontend**
- [ ] Fix BookingSuccess page (remove mock)
- [ ] Add user registration page
- [ ] Add booking history page
- [ ] Add user profile page
- [ ] Improve error handling
- [ ] Add loading states
- [ ] Add E2E tests

### **DevOps**
- [ ] Add Redis to docker-compose
- [ ] Add CI/CD pipeline
- [ ] Add monitoring
- [ ] Add logging
- [ ] Add health checks

---

## 🎯 Kết luận

Project này có **nền tảng tốt** với:
- ✅ Kiến trúc rõ ràng
- ✅ Tech stack hiện đại
- ✅ Docker setup hoàn chỉnh
- ✅ UI/UX đẹp
- ✅ Admin/Staff features đầy đủ

**Nhưng cần hoàn thiện:**
- 🔴 **Critical**: Booking & Payment flow
- 🟡 **Important**: User management
- 🟢 **Nice to have**: Advanced features

**Ưu tiên**: Hoàn thiện booking flow trước, sau đó mới phát triển các tính năng khác.

---

**Tài liệu này được tạo vào**: $(date)
**Phiên bản**: 1.0

