# BUSINESS REQUIREMENTS DOCUMENT

## Booking Management System (BMS)

**Version:** 1.0  
**Date:** 2025-12-14  
**Project:** My Cinema - Hệ thống quản lý đặt vé rạp chiếu phim

---

## 1. TỔNG QUAN HỆ THỐNG

### 1.1. Mục đích

Hệ thống quản lý đặt vé rạp chiếu phim với 3 vai trò chính:

- **ADMIN**: Quản trị viên hệ thống
- **STAFF**: Nhân viên quản lý rạp
- **CUSTOMER**: Khách hàng đặt vé

### 1.2. Kiến trúc

- **Backend**: Spring Boot (Java 17)
- **Frontend**: React + TypeScript
- **Database**: MySQL 8.0
- **Payment**: SePay (VietQR) Integration
- **Authentication**: JWT Token

---

## 2. ROLE: ADMIN (Quản trị viên hệ thống)

### 2.1. Quyền truy cập

- **Authority**: `ADMIN`
- **API Base**: `/api/admin/**`
- **Frontend Route**: `/admin/**`
- **Phạm vi**: Toàn bộ hệ thống

### 2.2. Chức năng quản lý

#### 2.2.1. Quản lý Phim (`/admin/movies`)

**API Endpoints:**

- `GET /api/admin/movies` - Danh sách phim (có search, pagination)
- `GET /api/admin/movies/{id}` - Chi tiết phim
- `POST /api/admin/movies` - Tạo phim mới
- `PUT /api/admin/movies/{id}` - Cập nhật phim
- `DELETE /api/admin/movies/{id}` - Xóa phim
- `POST /api/admin/movies/import/preview` - Preview import CSV
- `POST /api/admin/movies/import/confirm` - Xác nhận import CSV

**Business Rules:**

- Admin có thể tạo, sửa, xóa bất kỳ phim nào
- Import phim từ CSV với validation
- Upload poster và trailer lên Cloudinary
- Quản lý thông tin: title, code, duration, releaseDate, description, director, actors, ageRating, formats, languages, genres

**Dữ liệu quản lý:**

- Mã phim (code) - unique
- Tiêu đề (title)
- Mô tả (description)
- Poster URL
- Trailer URL
- Thời lượng (duration) - phút
- Đạo diễn (director)
- Diễn viên (actors)
- Ngày phát hành (releaseDate)
- Độ tuổi (ageRating)
- Định dạng (formats) - 2D, 3D, IMAX
- Ngôn ngữ (languages) - VI, EN
- Thể loại (genres) - nhiều thể loại

#### 2.2.2. Quản lý Thể loại (`/admin/genres`)

**API Endpoints:**

- `GET /api/admin/genres` - Danh sách thể loại
- `GET /api/admin/genres/{id}` - Chi tiết thể loại
- `POST /api/admin/genres` - Tạo thể loại mới
- `PUT /api/admin/genres/{id}` - Cập nhật thể loại
- `DELETE /api/admin/genres/{id}` - Xóa thể loại

**Business Rules:**

- Admin có thể quản lý toàn bộ thể loại phim
- Thể loại được gán cho phim (many-to-many)

#### 2.2.3. Quản lý Rạp (`/admin/theaters`)

**API Endpoints:**

- `GET /api/admin/theaters/v2` - Danh sách rạp (có search, pagination, sort)
- `GET /api/admin/theaters/v2/{id}` - Chi tiết rạp
- `POST /api/admin/theaters/v2` - Tạo rạp mới
- `PUT /api/admin/theaters/v2/{id}` - Cập nhật rạp
- `DELETE /api/admin/theaters/v2/{id}` - Xóa rạp
- `GET /api/admin/theaters/v2/provinces` - Danh sách tỉnh/thành
- `GET /api/admin/theaters/v2/districts?provinceId=X` - Danh sách quận/huyện

**Business Rules:**

- Admin có thể quản lý toàn bộ rạp trong hệ thống
- Mỗi rạp thuộc về một quận/huyện và tỉnh/thành phố
- Admin có thể xem, tạo, sửa, xóa rạp

**Dữ liệu quản lý:**

- Mã rạp (code) - unique
- Tên rạp (name)
- Địa chỉ (address)
- Số điện thoại (phone)
- Tỉnh/thành phố (province)
- Quận/huyện (district)
- Giờ mở cửa (openTime)
- Giờ đóng cửa (closeTime)

#### 2.2.4. Quản lý Phòng chiếu (`/admin/theaters/{theaterId}/rooms`)

**API Endpoints:**

- `GET /api/admin/rooms/v2?theaterId=X` - Danh sách phòng của rạp
- `GET /api/admin/rooms/v2/{roomId}` - Chi tiết phòng
- `POST /api/admin/rooms/v2?theaterId=X` - Tạo phòng mới
- `PUT /api/admin/rooms/v2/{roomId}` - Cập nhật phòng
- `DELETE /api/admin/rooms/v2/{roomId}` - Xóa phòng
- `GET /api/admin/rooms/v2/{roomId}/seats` - Danh sách ghế trong phòng

**Business Rules:**

- Mỗi phòng thuộc về một rạp
- Admin có thể tạo, sửa, xóa phòng
- Mỗi phòng có danh sách ghế (seats)

**Dữ liệu quản lý:**

- Tên phòng (name)
- Định dạng hỗ trợ (supportedFormats) - 2D, 3D, IMAX

#### 2.2.5. Quản lý Ghế (`/admin/theaters/{theaterId}/rooms/{roomId}/seats`)

**API Endpoints:**

- `GET /api/admin/theaters/{theaterId}/rooms/{roomId}/seats` - Danh sách ghế
- `POST /api/admin/theaters/{theaterId}/rooms/{roomId}/seats` - Tạo ghế (batch)
- `PUT /api/admin/theaters/{theaterId}/rooms/{roomId}/seats/{seatId}` - Cập nhật ghế
- `DELETE /api/admin/theaters/{theaterId}/rooms/{roomId}/seats/{seatId}` - Xóa ghế

**Business Rules:**

- Mỗi ghế thuộc về một phòng và một rạp
- Ghế có loại: STANDARD hoặc VIP
- Admin có thể tạo hàng loạt ghế cho phòng

**Dữ liệu quản lý:**

- Số ghế (seatNumber) - ví dụ: A1, A2, B1
- Loại ghế (seatType) - STANDARD hoặc VIP

#### 2.2.6. Phân công Phim cho Rạp (`/api/admin/theaters/{theaterId}/movies`)

**API Endpoints:**

- `GET /api/admin/theaters/{theaterId}/movies` - Danh sách phim đã phân công
- `POST /api/admin/theaters/{theaterId}/movies/assign` - Phân công phim mới
- `DELETE /api/admin/theaters/{theaterId}/movies/{movieCode}` - Hủy phân công

**Business Rules:**

- Admin phân công phim cho rạp với:
  - Ngày bắt đầu (activeFrom)
  - Ngày kết thúc (activeTo)
  - Định dạng (formats) - 2D, 3D, IMAX
  - Ngôn ngữ (languages) - VI, EN
- Khi phân công phim, hệ thống tự động tạo notification cho tất cả Staff của rạp đó
- Staff sẽ nhận thông báo trong Dashboard

**Dữ liệu phân công:**

- Mã phim (movieCode)
- Ngày bắt đầu (activeFrom)
- Ngày kết thúc (activeTo)
- Định dạng (formats)
- Ngôn ngữ (languages)

#### 2.2.7. Quản lý Nhân viên (`/api/admin/staff`)

**API Endpoints:**

- `GET /api/admin/staff` - Danh sách tất cả staff (có filter)
- `GET /api/admin/staff/theater/{theaterId}` - Danh sách staff của rạp
- `POST /api/admin/staff/assign` - Phân công staff vào rạp
- `POST /api/admin/staff/unassign` - Hủy phân công staff

**Business Rules:**

- Admin có thể xem tất cả staff trong hệ thống
- Admin phân công staff vào rạp cụ thể
- Mỗi staff chỉ được phân công vào một rạp
- Admin có thể filter staff theo role, tìm staff chưa được phân công

**Dữ liệu phân công:**

- Account ID (accountId)
- Theater ID (theaterId)
- Role (mặc định: STAFF)

#### 2.2.8. Thống kê (`/api/admin/stats`)

**API Endpoints:**

- `GET /api/admin/stats` - Thống kê tổng quan

**Business Rules:**

- Hiển thị tổng số:
  - Phim (movies)
  - Thể loại (genres)
  - Rạp (theaters)
  - Phòng (rooms)

#### 2.2.9. Upload Hình ảnh

**API Endpoints:**

- `POST /api/images/upload-poster` - Upload poster (ADMIN hoặc STAFF)
- `POST /api/images/upload-trailer` - Upload trailer (ADMIN hoặc STAFF)
- `GET /api/images/**` - Quản lý hình ảnh (chỉ ADMIN)

**Business Rules:**

- Admin và Staff có thể upload poster/trailer
- Chỉ Admin có thể quản lý hình ảnh (xem, xóa)
- Hình ảnh được lưu trên Cloudinary

---

## 3. ROLE: STAFF (Nhân viên rạp)

### 3.1. Quyền truy cập

- **Authority**: `STAFF`
- **API Base**: `/api/staff/**`
- **Frontend Route**: `/staff/**`
- **Phạm vi**: Chỉ rạp được phân công (theater-scoped)

### 3.2. Chức năng quản lý

#### 3.2.1. Dashboard (`/staff` - `/api/staff/dashboard`)

**API Endpoints:**

- `GET /api/staff/dashboard` - Thông tin dashboard

**Business Rules:**

- Staff chỉ xem được thông tin của rạp được phân công
- Nếu staff chưa được phân công rạp → 403 Forbidden

**Dữ liệu hiển thị:**

- Thông tin rạp (theater): id, name, code, address
- Danh sách phim đã được phân công (assignments):
  - Mã phim (code)
  - Tiêu đề (title)
  - Ngày bắt đầu (activeFrom)
  - Ngày kết thúc (activeTo)
- Lịch chiếu hôm nay (todayShowtimes):
  - Thời gian (time)
  - Phòng (room)
  - Phim (movie)
- Lịch chiếu 7 ngày tới (weekShowtimes):
  - Ngày (date)
  - Thời gian (time)
  - Phòng (room)
  - Phim (movie)
- Thông báo phim mới (recent assignments):
  - Phim được phân công trong 7 ngày qua
- Phim sắp hết hạn (expiring soon):
  - Phim có activeTo trong 7 ngày tới

#### 3.2.2. Auto Scheduling (`/staff/scheduling` - `/api/staff/scheduling`)

**API Endpoints:**

- `POST /api/staff/scheduling/preview` - Preview lịch chiếu tự động
- `POST /api/staff/scheduling/commit` - Xác nhận và lưu lịch chiếu
- `GET /api/staff/scheduling/progress` - Theo dõi tiến trình tối ưu hóa

**Business Rules:**

- Staff chỉ có thể tạo lịch chiếu cho rạp được phân công
- Sử dụng OptaPlanner để tối ưu hóa lịch chiếu tự động
- Preview trước khi commit để kiểm tra conflicts

**Input:**

- Ngày bắt đầu (startDate)
- Ngày kết thúc (endDate)
- Danh sách mã phim (codes) - optional, nếu không có thì dùng tất cả phim đã được phân công

**Output Preview:**

- Danh sách showtime được đề xuất:
  - Tên rạp (theaterName)
  - Tên phòng (roomName)
  - Mã phim (movieCode)
  - Ngày chiếu (showDate)
  - Giờ chiếu (showTime)
  - Giá vé tiêu chuẩn (priceStandard)
  - Thời lượng (duration)
  - Lỗi validation (errors) - nếu có
- Thống kê (stats):
  - Tổng số showtime
  - Số lỗi
  - Số phim được lên lịch

**Commit:**

- Xác nhận và lưu các showtime đã preview
- Tạo Showtime records trong database
- Validate conflicts (phòng đã có showtime khác, thời gian chồng chéo)
- Trả về kết quả: số showtime đã tạo, số lỗi

**Progress Tracking:**

- Theo dõi tiến trình tối ưu hóa của OptaPlanner
- Status: idle, running, completed
- Percentage: 0-100%

#### 3.2.3. Quản lý Phim (`/staff/movies` - `/api/staff/movies/*`)

**API Endpoints:**

- `GET /api/staff/movies/assigned` - Danh sách phim đã được phân công
- `POST /api/staff/movies/publish` - Publish phim để bán vé
- `GET /api/staff/movie-requests` - Danh sách yêu cầu chiếu phim
- `POST /api/staff/movies/requests` - Tạo yêu cầu chiếu phim mới
- `PATCH /api/staff/movies/requests/{id}` - Cập nhật yêu cầu
- `DELETE /api/staff/movies/requests/{id}` - Xóa yêu cầu

**Business Rules:**

- Staff chỉ xem được phim đã được Admin phân công cho rạp của mình
- Staff có thể publish phim để bán vé (chuyển status từ SCHEDULED → APPROVED)
- Staff có thể gửi yêu cầu chiếu phim mới (MovieRequest)
- Staff có thể quản lý yêu cầu của mình (xem, sửa, xóa)

**Publish Phim:**

- Chọn một hoặc nhiều phim đã được phân công
- Publish để kích hoạt bán vé
- Phim phải có status = "SCHEDULED"

**Yêu cầu chiếu phim (MovieRequest):**

- Staff gửi yêu cầu chiếu phim mới cho rạp
- Dữ liệu yêu cầu:
  - Movie ID (movieId)
  - Độ ưu tiên (priority) - số nguyên
  - Điểm nhu cầu (demandScore) - 0.0 - 1.0
- Status workflow:
  - PENDING → SCHEDULED → APPROVED/REJECTED
- Staff có thể filter yêu cầu theo status

#### 3.2.4. Notifications (`/api/staff/notifications`)

**API Endpoints:**

- `GET /api/staff/notifications` - Danh sách thông báo chưa đọc
- `POST /api/staff/notifications/mark-read` - Đánh dấu đã đọc
- `POST /api/staff/notifications/mark-all-read` - Đánh dấu tất cả đã đọc

**Business Rules:**

- Staff tự động nhận notification khi Admin phân công phim mới cho rạp
- Notification hiển thị trong Dashboard và sidebar
- Staff có thể đánh dấu đã đọc từng notification hoặc tất cả

**Dữ liệu notification:**

- Tiêu đề (title)
- Nội dung (message)
- Loại (type) - MOVIE_ASSIGNED
- Đã đọc (isRead) - boolean
- Thời gian tạo (createdAt)
- ID phim liên quan (relatedMovieId)
- ID rạp liên quan (relatedTheaterId)

#### 3.2.5. Upload Hình ảnh

**API Endpoints:**

- `POST /api/images/upload-poster` - Upload poster
- `POST /api/images/upload-trailer` - Upload trailer

**Business Rules:**

- Staff có thể upload poster và trailer cho phim
- Hình ảnh được lưu trên Cloudinary

---

## 4. ROLE: CUSTOMER (Khách hàng)

### 4.1. Quyền truy cập

- **Authority**: Không yêu cầu (public endpoints)
- **API Base**: `/api/movies/**`, `/api/booking/**`, `/booking/api/**`
- **Frontend Route**: `/`, `/movies/**`, `/booking/**`
- **Phạm vi**: Xem và đặt vé

### 4.2. Chức năng

#### 4.2.1. Xem danh sách Phim (`/`)

**API Endpoints:**

- `GET /api/movies/now-showing` - Phim đang chiếu (pagination)
- `GET /api/movies/coming-soon` - Phim sắp chiếu (pagination)
- `GET /api/movies/search` - Tìm kiếm phim

**Business Rules:**

- Khách hàng có thể xem danh sách phim không cần đăng nhập
- Infinite scroll với pagination
- Tìm kiếm theo: tiêu đề, mã phim
- Filter theo: thể loại, năm phát hành

**Dữ liệu hiển thị:**

- Poster
- Tiêu đề
- Thời lượng
- Độ tuổi
- Ngày phát hành
- Đạo diễn
- Thể loại

#### 4.2.2. Chi tiết Phim (`/movies/:id`)

**API Endpoints:**

- `GET /api/movies/{id}` - Chi tiết phim

**Business Rules:**

- Khách hàng xem thông tin chi tiết phim
- Có thể xem trailer
- Có nút "Đặt vé" để chuyển sang booking flow

**Dữ liệu hiển thị:**

- Poster (full size)
- Trailer (video)
- Mô tả đầy đủ
- Đạo diễn
- Diễn viên
- Thể loại
- Ngày phát hành
- Độ tuổi
- Thời lượng

#### 4.2.3. Đặt vé (`/booking`)

**Luồng đặt vé:**

1. Chọn tỉnh/thành phố
2. Chọn quận/huyện
3. Chọn rạp
4. Chọn ngày chiếu
5. Chọn suất chiếu
6. Chọn ghế
7. Nhập thông tin khách hàng
8. Thanh toán VNPAY
9. Xem vé

**API Endpoints:**

**Bước 1-2: Chọn địa điểm**

- `GET /booking/api/locations` - Danh sách tỉnh/thành có lịch chiếu
  - Query params: `movieId` (optional), `showDate` (optional)
- `GET /booking/api/districts` - Danh sách quận/huyện
  - Query params: `provinceId` (required), `movieId` (optional), `showDate` (optional)

**Bước 3: Chọn rạp**

- `GET /booking/api/theaters` - Danh sách rạp
  - Query params: `provinceId` (required), `districtId` (required), `movieId` (optional), `showDate` (optional)

**Bước 4: Chọn ngày chiếu**

- `GET /booking/api/showdates` - Danh sách ngày chiếu
  - Query params: `theaterId` (required), `movieId` (optional)

**Bước 5: Chọn suất chiếu**

- `GET /booking/api/showtimes` - Danh sách suất chiếu
  - Query params: `theaterId` (required), `movieId` (optional), `showDate` (optional)

**Bước 6: Chọn ghế**

- `GET /booking/api/seats` - Danh sách ghế
  - Query params: `theaterId` (required), `showtimeId` (optional)
- `POST /api/booking/shows/{showtimeId}/holds?seatId=X` - Giữ ghế tạm thời
- `DELETE /api/booking/shows/{showtimeId}/holds?seatId=X` - Release ghế

**Business Rules:**

- Khách hàng có thể chọn nhiều ghế cùng lúc
- Seat Hold System: ghế được giữ tạm thời trong 2 phút (TTL-based)
- Nếu hết thời gian giữ, ghế tự động được release
- Chỉ hiển thị ghế chưa được đặt (booked = false)
- Ghế có 2 loại: STANDARD và VIP

**Bước 7-8: Nhập thông tin và thanh toán**

- `POST /api/booking/booking` - Tạo booking và thanh toán
  - Body: `showtimeId`, `seatIds[]`, `customerName`, `customerPhone`
  - Response: VNPAY payment URL
  - Redirect đến VNPAY để thanh toán

**Business Rules:**

- Khách hàng nhập: tên, số điện thoại
- Hệ thống tạo booking với status = "PENDING"
- Tạo VNPAY payment URL
- Redirect đến VNPAY
- Sau khi thanh toán thành công, VNPAY redirect về `/booking/payment-result`
- Hệ thống xử lý callback và update booking status = "CONFIRMED"

**Bước 9: Xem vé**

- `GET /api/booking/bookings?ids=1,2,3` - Lấy thông tin vé
- `GET /api/booking/booking/{id}` - Chi tiết một vé

**Business Rules:**

- Khách hàng xem vé đã đặt thành công
- Hiển thị thông tin: phim, rạp, phòng, ngày giờ, ghế, giá

#### 4.2.4. Tìm rạp gần bạn (`/theaters/nearby`)

**API Endpoints:**

- `GET /api/theaters/nearby` - Tìm rạp gần bạn
  - Query params: `latitude`, `longitude`, `radiusKm`

**Business Rules:**

- Sử dụng geolocation để lấy vị trí khách hàng
- Tìm rạp trong bán kính (mặc định 10km)
- Hiển thị khoảng cách từ vị trí khách hàng đến rạp
- Nếu không cho phép geolocation, mặc định là TPHCM

---

## 5. PHÂN QUYỀN VÀ BẢO MẬT

### 5.1. Authentication

- **JWT Token**: Sử dụng JWT cho ADMIN và STAFF
- **Public Endpoints**: Customer không cần đăng nhập để xem phim và đặt vé
- **Session-based**: Seat holding sử dụng HTTP Session (không cần authentication)

### 5.2. Authorization Rules

| Endpoint                     | ADMIN | STAFF                   | CUSTOMER |
| ---------------------------- | ----- | ----------------------- | -------- |
| `/api/admin/**`              | ✅    | ❌                      | ❌       |
| `/api/staff/**`              | ❌    | ✅ (rạp được phân công) | ❌       |
| `/api/movies/**`             | ✅    | ✅                      | ✅       |
| `/api/booking/**`            | ✅    | ✅                      | ✅       |
| `/api/images/upload-poster`  | ✅    | ✅                      | ❌       |
| `/api/images/upload-trailer` | ✅    | ✅                      | ❌       |
| `/api/images/**`             | ✅    | ❌                      | ❌       |

### 5.3. Theater-scoped Access

- **STAFF** chỉ có thể truy cập dữ liệu của rạp được phân công
- **ADMIN** có thể truy cập tất cả rạp
- **CUSTOMER** có thể xem tất cả rạp và đặt vé

---

## 6. LUỒNG NGHIỆP VỤ CHÍNH

### 6.1. Luồng Admin → Staff → Customer

```
1. ADMIN tạo phim mới
   ↓
2. ADMIN phân công phim cho rạp
   ↓
3. Hệ thống tự động tạo Notification cho Staff của rạp
   ↓
4. STAFF nhận notification trong Dashboard
   ↓
5. STAFF có thể:
   - Publish phim để bán vé
   - Tạo lịch chiếu (scheduling)
   - Gửi yêu cầu chiếu phim mới
   ↓
6. STAFF tạo Showtime (lịch chiếu)
   ↓
7. CUSTOMER xem phim và lịch chiếu
   ↓
8. CUSTOMER đặt vé
   ↓
9. Thanh toán VNPAY
   ↓
10. Booking được tạo và xác nhận
```

### 6.2. Luồng Đặt vé của Customer

```
1. Customer chọn phim
   ↓
2. Chọn tỉnh/thành phố → quận/huyện → rạp
   ↓
3. Chọn ngày chiếu → suất chiếu
   ↓
4. Chọn ghế (có thể chọn nhiều ghế)
   - Seat Hold: giữ ghế trong 2 phút
   ↓
5. Nhập thông tin: tên, số điện thoại
   ↓
6. Tạo booking (status = PENDING)
   ↓
7. Redirect đến VNPAY thanh toán
   ↓
8. VNPAY callback → Update booking (status = CONFIRMED)
   ↓
9. Redirect về trang xem vé
```

### 6.3. Luồng Tạo lịch chiếu của Staff

```
1. STAFF vào trang Scheduling
   ↓
2. Nhập: startDate, endDate, movieCodes (optional)
   ↓
3. Preview scheduling
   - OptaPlanner tối ưu hóa lịch chiếu
   - Validate conflicts
   - Hiển thị preview với errors (nếu có)
   ↓
4. STAFF xem preview và sửa (nếu cần)
   ↓
5. Commit scheduling
   - Tạo Showtime records
   - Validate và xử lý errors
   ↓
6. Hoàn thành - Showtime đã được tạo
```

---

## 7. DỮ LIỆU VÀ ENTITIES

### 7.1. Core Entities

**Movie (Phim)**

- id, code, title, description
- posterUrl, trailerUrl
- duration, director, actors
- releaseDate, ageRating
- formats, languages
- genres (many-to-many)

**Theater (Rạp)**

- id, code, name, address, phone
- province, district
- openTime, closeTime

**Room (Phòng)**

- id, name, supportedFormats
- theater (many-to-one)

**Seat (Ghế)**

- id, seatNumber, seatType (STANDARD/VIP)
- theater (many-to-one)
- room (many-to-one)

**Showtime (Suất chiếu)**

- id, showDate, showTime
- movie (many-to-one)
- theater (many-to-one)
- room (many-to-one)
- priceStandard, priceVip

**Booking (Đặt vé)**

- id, showtime (many-to-one)
- seat (many-to-one)
- customerName, customerPhone
- bookingTime, status

**MovieAssignment (Phân công phim)**

- id, movie (many-to-one)
- theater (many-to-one)
- activeFrom, activeTo
- formats, languages

**MovieRequest (Yêu cầu chiếu phim)**

- id, movieCode, movie (many-to-one)
- theater (many-to-one)
- priority, demandScore
- status (PENDING/SCHEDULED/APPROVED/REJECTED)
- createdBy, createdAt, updatedAt

**Account (Tài khoản)**

- id, username, password (encrypted)
- enabled

**Role (Vai trò)**

- id, roleName (ADMIN, STAFF)

**AccountPermission (Phân quyền)**

- id, account (many-to-one)
- role (many-to-one)
- assignedTheaterId (nullable)

**Notification (Thông báo)**

- id, title, message, type
- recipientUsername
- isRead, createdAt
- relatedMovieId, relatedTheaterId

---

## 8. BUSINESS RULES QUAN TRỌNG

### 8.1. Seat Hold System

- Ghế được giữ tạm thời trong **2 phút** (TTL-based)
- Nếu hết thời gian, ghế tự động được release
- Một ghế chỉ có thể được giữ bởi một session tại một thời điểm
- Session-based: sử dụng `session.getId()` làm owner key

### 8.2. Movie Assignment

- Admin phân công phim cho rạp với thời gian active (activeFrom → activeTo)
- Khi phân công, tự động tạo notification cho tất cả Staff của rạp
- Staff chỉ thấy phim đã được phân công cho rạp của mình

### 8.3. Scheduling

- Staff chỉ có thể tạo lịch chiếu cho rạp được phân công
- Sử dụng OptaPlanner để tối ưu hóa lịch chiếu
- Validate conflicts: phòng không được có 2 showtime cùng thời gian
- Preview trước khi commit

### 8.4. Booking & Payment

- Booking được tạo với status = "PENDING" trước khi thanh toán
- Sau khi thanh toán thành công, status = "CONFIRMED"
- Hỗ trợ đặt nhiều ghế cùng lúc (multi-seat booking)
- VNPAY integration: sandbox mode

### 8.5. Theater-scoped Access

- Staff chỉ có thể truy cập dữ liệu của rạp được phân công
- Admin có thể truy cập tất cả rạp
- Permission được kiểm tra qua `TheaterPermissionEvaluator`

---

## 9. API ENDPOINTS TÓM TẮT

### 9.1. Admin APIs

```
GET    /api/admin/stats
GET    /api/admin/movies
POST   /api/admin/movies
PUT    /api/admin/movies/{id}
DELETE /api/admin/movies/{id}
POST   /api/admin/movies/import/preview
POST   /api/admin/movies/import/confirm
GET    /api/admin/theaters/v2
POST   /api/admin/theaters/v2
PUT    /api/admin/theaters/v2/{id}
DELETE /api/admin/theaters/v2/{id}
GET    /api/admin/theaters/{theaterId}/movies
POST   /api/admin/theaters/{theaterId}/movies/assign
DELETE /api/admin/theaters/{theaterId}/movies/{movieCode}
GET    /api/admin/staff
POST   /api/admin/staff/assign
POST   /api/admin/staff/unassign
GET    /api/admin/rooms/v2
POST   /api/admin/rooms/v2
PUT    /api/admin/rooms/v2/{roomId}
DELETE /api/admin/rooms/v2/{roomId}
```

### 9.2. Staff APIs

```
GET    /api/staff/dashboard
POST   /api/staff/scheduling/preview
POST   /api/staff/scheduling/commit
GET    /api/staff/scheduling/progress
GET    /api/staff/movies/assigned
POST   /api/staff/movies/publish
GET    /api/staff/movie-requests
POST   /api/staff/movies/requests
PATCH  /api/staff/movies/requests/{id}
DELETE /api/staff/movies/requests/{id}
GET    /api/staff/notifications
POST   /api/staff/notifications/mark-read
POST   /api/staff/notifications/mark-all-read
```

### 9.3. Customer/Public APIs

```
GET    /api/movies/now-showing
GET    /api/movies/coming-soon
GET    /api/movies/search
GET    /api/movies/{id}
GET    /booking/api/locations
GET    /booking/api/districts
GET    /booking/api/theaters
GET    /booking/api/showdates
GET    /booking/api/showtimes
GET    /booking/api/seats
POST   /api/booking/shows/{showtimeId}/holds
DELETE /api/booking/shows/{showtimeId}/holds
POST   /api/booking/booking
GET    /api/booking/bookings
GET    /api/booking/booking/{id}
GET    /api/theaters/nearby
```

---

## 10. FRONTEND ROUTES

### 10.1. Public Routes

- `/` - Trang chủ (danh sách phim)
- `/movies/:id` - Chi tiết phim
- `/booking` - Đặt vé
- `/booking/:movieId` - Đặt vé với phim đã chọn
- `/booking/success` - Thanh toán thành công
- `/booking/failed` - Thanh toán thất bại
- `/booking/tickets` - Xem vé đã đặt
- `/theaters/nearby` - Tìm rạp gần bạn
- `/login` - Đăng nhập

### 10.2. Admin Routes (`/admin/**`)

- `/admin` - Dashboard
- `/admin/genres` - Quản lý thể loại
- `/admin/genres/create` - Tạo thể loại
- `/admin/genres/:id/edit` - Sửa thể loại
- `/admin/theaters` - Quản lý rạp
- `/admin/theaters/create` - Tạo rạp
- `/admin/theaters/:id/detail` - Chi tiết rạp
- `/admin/theaters/:id/edit` - Sửa rạp
- `/admin/theaters/:theaterId/rooms/create` - Tạo phòng
- `/admin/theaters/:theaterId/rooms/:roomId/edit` - Sửa phòng
- `/admin/movies` - Quản lý phim
- `/admin/movies/create` - Import phim CSV
- `/admin/movies/:id/edit` - Sửa phim
- `/admin/movies/:id/view` - Xem phim

### 10.3. Staff Routes (`/staff/**`)

- `/staff` - Dashboard
- `/staff/scheduling` - Tạo lịch chiếu
- `/staff/movies` - Quản lý phim

---

## 11. THÔNG TIN KỸ THUẬT

### 11.1. Technology Stack

- **Backend**: Spring Boot 3.x, Java 17
- **Frontend**: React 18, TypeScript, Vite
- **Database**: MySQL 8.0
- **Authentication**: JWT
- **Payment**: VNPAY Sandbox
- **Image Storage**: Cloudinary
- **Optimization**: OptaPlanner (scheduling)

### 11.2. Security

- JWT Token authentication
- BCrypt password encryption
- CORS configuration
- Role-based access control (RBAC)
- Theater-scoped access control

### 11.3. Deployment

- Docker & Docker Compose
- Backend: Port 8080
- Frontend: Port 5173 (dev) / 80 (production)
- Database: Port 3306

---

## 12. GHI CHÚ VÀ HẠN CHẾ

### 12.1. Chức năng chưa hoàn thiện

- ❌ User registration/authentication cho Customer
- ❌ Booking history cho Customer
- ❌ Email notifications
- ❌ SMS notifications
- ❌ Redis cho session management (hiện tại dùng HTTP Session)

### 12.2. Cần cải thiện

- ⚠️ Seat Hold System: nên dùng Redis cho production
- ⚠️ Booking & Payment flow: một số endpoint chưa được implement đầy đủ
- ⚠️ Error handling: cần improve error messages
- ⚠️ Testing: chưa có unit tests, integration tests

---

**Tài liệu này mô tả đầy đủ business requirements cho 3 role trong hệ thống Booking Management System.**
