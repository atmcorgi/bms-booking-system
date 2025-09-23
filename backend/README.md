# Booking Management System

## 🎬 Overview

A comprehensive movie theater booking management system built with Spring Boot, featuring advanced design patterns, concurrency, and real-time notifications.

## 🏗️ Architecture & Design Patterns

### 1. Design Patterns

- **Creation:**
  - Factory Method/Abstract Factory
  - Singleton
  - Builder
- **Structure:**
  - Adapter
  - Decorator
  - Proxy
- **Behavior:**
  - Observer

### 2. Functional Programming

- Stream API, Optional API, Time API

### 3. IO/NIO

### 4. Concurrency

- Executor Service
- Completable Future
- Thread Pool Management

### 5. Unit Testing

- JUnit 5
- Mockito
- Test Coverage

## 🚀 Key Features

### 📊 Movie Workflow Management

- **Admin Workflow:** Import movies, assign to theaters, monitor status
- **Staff Workflow:** Schedule movies, publish showtimes, manage assigned movies
- **Status Tracking:** DRAFT → SCHEDULED → PUBLISHED → ARCHIVED

### 🔔 Real-time Notification System

- **Concurrent Notifications:** High-performance async notification delivery
- **Observer Pattern:** Automatic notifications when movies are assigned
- **Performance Optimization:** 3-4x faster than sequential processing
- **Thread Pool:** 10-thread executor for concurrent operations

### 🎭 Theater Management

- **Multi-brand Support:** CGV, BHD, Galaxy Cinema
- **Dynamic Pricing:** Prime time and demand-based pricing
- **Room & Seat Management:** Automated seat layout generation
- **Location-based:** Province/District organization

### 📈 Auto-scheduling System

- **Smart Scheduling:** Conflict detection and resolution
- **Demand Analysis:** Historical data-driven scheduling
- **Price Optimization:** Dynamic pricing based on demand
- **Batch Processing:** Efficient bulk operations

## 🛠️ Technical Implementation

---

\*\* Factory Method/Abstract Factory:

- Abstract Factory: TheaterSystemFactory tạo ra nhóm hệ thống rạp chiếu phim: rạp, phòng, ghế
- Factory Method: createTheater(), createRoom(), createSeat() - method tạo instance cho rạp, phòng, ghế

- TheaterFactoryCreator: Factory dựa vào brand để trả về Factory phù hợp (BHDTheaterFactory/CGVTheaterFactory)

\*\* Singleton

- SeatTypeRulesRegistry: --> RegistrySeatRulesAdapter getInstance()

\*\* Builder

- SeatLayoutBuilder: TheaterService --> createSeatsForRoom() --> build

\*\* Adapter:

- CGVTheaterFactory, BHDTheaterFactory cần dùng SeatRules
- SeatTypeRulesRegistry --> RegistrySeatRulesAdapter --> SeatRules

CGVTheaterFactory/BHDTheaterFactory: Factory(client) bị phụ thuộc vào SeatTypeRulesRegistry (SeatTypeRulesRegistry là singleton --> Factory phải biết SeatTypeRulesRegistry là Singleton, phải biết cách gọi getInstance()) --> dùng adapter xử lí

\*\* Decorator (updated):

- FactoryLoggingDecorator: bọc TheaterSystemFactory tại TheaterFactoryCreator để log thời gian create\*/decideSeatType.

\*\* Proxy (updated):

- SeatRulesCachingProxy: bọc RegistrySeatRulesAdapter để cache truy vấn rule (getDouble/getInt/getBoolean) khi build seat layout.

\*\* Observer

- **Movie Assignment Observer:** StaffNotificationObserver
- **Observer Pattern:** Publisher interface, Subscriber interface, MovieAssignmentSubject
- **Notification System:** Database notifications với real-time badge updates
- **Concurrency:** ExecutorService + CompletableFuture trong NotificationService
- **Performance:** Concurrent notification delivery với thread pool
- **Auto-trigger:** Automatic notifications khi admin assign movie cho theater

\*\* Functional Programming

- Stream API:
  - MovieService: stream().filter().map().collect() cho data transformation
  - AutoSchedulingService: stream().flatMap() cho complex data processing
  - TheaterService: stream().anyMatch() cho permission checking
- Optional API:
  - MovieRepository: Optional<Movie> findByCode() thay vì null checks
  - MovieService: Optional.orElse() cho default values
  - GenreService
  - Movie Controller:
- Time API:
  - LocalDate, LocalTime, LocalDateTime cho scheduling
  - Duration, Period cho time calculations

\*\* IO/NIO

- File Upload: MultipartFile handling cho CSV import
  - MovieIntakeService

\*\* Concurrency

- **ExecutorService:** Thread pool cho parallel movie processing
- **CompletableFuture:** Async task execution và chaining
- **AtomicInteger:** Thread-safe counters cho progress tracking
- **Concurrent Collections:** Thread-safe data structures
- **Synchronized Methods:** Thread-safe singleton patterns
- **Notification Concurrency:** 10-thread pool cho concurrent notification delivery
- **Performance Testing:** Delay simulation (1-3s) để test hiệu năng
- **Real-time Logging:** Performance metrics và timing logs

\*\* Time API

- **LocalDate/LocalTime:** Business logic và date calculations
- **Instant:** UTC storage trong database (Booking entity)
- **ZonedDateTime:** Timezone conversion cho VNPay API
- **Duration:** Movie duration calculations và scheduling
- **TemporalAdjusters:** Complex date manipulation (tuần này/tuần sau)
- **ZoneId:** VN timezone (Asia/Ho_Chi_Minh) cho business logic
- **@PrePersist/@PreUpdate:** Automatic timestamp cho entities
- **DateTimeFormatter:** API integration formatting

\*\* Unit Test

- **JUnit 5:** @Test, @BeforeEach, @AfterEach
- **Mockito:** @Mock, @InjectMocks, when().thenReturn()
- **Test Coverage:** Service layer với high coverage
- **Test Categories:** Unit tests, Integration tests
- **Assertions:** AssertJ cho fluent assertions
- **Test Data:** @TestPropertySource cho test configuration
