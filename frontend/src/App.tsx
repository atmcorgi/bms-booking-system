import { Toaster } from "react-hot-toast";
import { Route, Routes, useParams, useSearchParams } from "react-router-dom";
import "./styles/optimization.css";
import { useState, lazy, Suspense } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import MainLayout from "./layouts/MainLayout";
import api from "./services/apiClient";
import MovieTabs from "./components/MovieTabs";
import { type MovieItem } from "./types/movie";
import QuickBooking from "./components/QuickBooking";
import MovieBanner from "./components/MovieBanner";
import SearchBar from "./components/SearchBar";
import BookingFlow from "./components/BookingFlow";
import Error403 from "./pages/Error403";
import ProtectedRoute from "./components/ProtectedRoute";
import ScrollToHash from "./components/ScrollToHash";
import { BackgroundProvider } from "./contexts/BackgroundContext";

// Lazy load pages for better performance
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const LoginPage = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const RegisterPage = lazy(() => import("./pages/Register"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess"));
const BookingFailed = lazy(() => import("./pages/BookingFailed"));
const Tickets = lazy(() => import("./pages/Tickets"));
const NearbyTheaters = lazy(() => import("./pages/NearbyTheaters"));
const Profile = lazy(() => import("./pages/Profile"));

// Admin pages lazy load
const GenreList = lazy(() => import("./pages/admin/GenreList"));
const GenreForm = lazy(() => import("./pages/admin/GenreForm"));
const TheaterList = lazy(() => import("./pages/admin/TheaterList"));
const TheaterForm = lazy(() => import("./pages/admin/TheaterForm"));
const TheaterDetail = lazy(() => import("./pages/admin/TheaterDetail"));
const RoomForm = lazy(() => import("./pages/admin/RoomForm"));
const MovieIntakeList = lazy(() => import("./pages/admin/MovieIntakeList"));
const MovieIntakeForm = lazy(() => import("./pages/admin/MovieIntakeForm"));
const BannerList = lazy(() => import("./pages/admin/BannerList"));
const BannerForm = lazy(() => import("./pages/admin/BannerForm"));
const AccountManagement = lazy(() => import("./pages/admin/AccountManagement"));
const MovieAssignmentList = lazy(() => import("./pages/admin/MovieAssignmentList"));
const MovieRequestList = lazy(() => import("./pages/admin/MovieRequestList"));
const AdminProfile = lazy(() => import("./pages/admin/AdminProfile"));
const Statistics = lazy(() => import("./pages/admin/Statistics"));
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));

// Staff pages lazy load
const StaffLayout = lazy(() => import("./layouts/StaffLayout"));
const StaffDashboard = lazy(() => import("./pages/staff/Dashboard"));
const StaffScheduling = lazy(() => import("./pages/staff/Scheduling"));
const StaffMovieManagement = lazy(() => import("./pages/staff/MovieManagement"));
const ShowtimeManagement = lazy(() => import("./pages/staff/ShowtimeManagement"));
const BookingManagement = lazy(() => import("./pages/staff/BookingManagement"));
const StaffProfile = lazy(() => import("./pages/staff/StaffProfile"));

// Loading component
function PageLoader() {
  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "50vh",
      padding: "40px"
    }}>
      <div style={{ 
        width: "40px", 
        height: "40px", 
        border: "3px solid #f3f3f3", 
        borderTop: "3px solid #E50914", 
        borderRadius: "50%", 
        animation: "spin 1s linear infinite" 
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
// import CloudinaryTest from "./components/CloudinaryTest";

// App.tsx

// ... (imports remain the same) ...

// Define more accurate types for paged content from Spring Boot
interface PagedContent<T> {
  content: T[];
  hasMore: boolean;
  totalPages: number;
  totalItems: number;
  page: number;
  size: number;
}

// Define the type for the categorized search result
interface MovieSearchResult {
  nowShowing: PagedContent<MovieItem>;
  comingSoon: PagedContent<MovieItem>;
}

function Home() {
  const [searchFilters, setSearchFilters] = useState<{
    searchTerm: string;
    genre: string;
    year: string;
  }>({ searchTerm: "", genre: "", year: "" });

  // ... (useInfiniteQuery for nowShowingData and comingSoonData remains the same) ...
  const {
    data: nowShowingData,
    isLoading: loadingNow,
    isError: errorNow,
    fetchNextPage: fetchNextNowShowing,
    hasNextPage: hasNextNowShowing,
    isFetchingNextPage: loadingMoreNowShowing,
  } = useInfiniteQuery<PagedContent<MovieItem>>({
    queryKey: ["/api/movies/now-showing"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get("/api/movies/now-showing", {
        params: { page: pageParam },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
  });

  const {
    data: comingSoonData,
    isLoading: loadingSoon,
    isError: errorSoon,
    fetchNextPage: fetchNextComingSoon,
    hasNextPage: hasNextComingSoon,
    isFetchingNextPage: loadingMoreComingSoon,
  } = useInfiniteQuery<PagedContent<MovieItem>>({
    queryKey: ["/api/movies/coming-soon"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get("/api/movies/coming-soon", {
        params: { page: pageParam },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 0,
  });


  // Updated Search results query
  const {
    data: searchResults,
    isLoading: loadingSearch,
    isError: errorSearch,
  } = useQuery<MovieSearchResult>({
    queryKey: ["/api/movies/search", searchFilters],
    queryFn: async () => {
      const res = await api.get("/api/movies/search", {
        params: {
          q: searchFilters.searchTerm || undefined,
          genre: searchFilters.genre || undefined,
          year: searchFilters.year || undefined,
          page: 0, // Pagination for search results can be added later if needed
        },
      });
      return res.data;
    },
    enabled:
      searchFilters.searchTerm !== "" ||
      searchFilters.genre !== "" ||
      searchFilters.year !== "",
  });

  const handleSearch = (
    searchTerm: string,
    filters: { genre: string; year: string }
  ) => {
    setSearchFilters({ searchTerm, genre: filters.genre, year: filters.year });
  };

  // Flatten infinite query data
  const nowShowingMovies =
    nowShowingData?.pages.flatMap((page) => page.content) || [];
  const comingSoonMovies =
    comingSoonData?.pages.flatMap((page) => page.content) || [];

  // ... (load more handlers remain the same) ...
  const handleLoadMoreNowShowing = () => {
    if (hasNextNowShowing && !loadingMoreNowShowing) {
      fetchNextNowShowing();
    }
  };

  const handleLoadMoreComingSoon = () => {
    if (hasNextComingSoon && !loadingMoreComingSoon) {
      fetchNextComingSoon();
    }
  };


  if (loadingNow || loadingSoon)
    return <div style={{ padding: 24 }}>Đang tải...</div>;
  if (errorNow || errorSoon)
    return <div style={{ padding: 24 }}>Có lỗi khi tải dữ liệu.</div>;

  const hasActiveSearch =
    searchFilters.searchTerm !== "" ||
    searchFilters.genre !== "" ||
    searchFilters.year !== "";
    
  const totalFound = (searchResults?.nowShowing.totalItems || 0) + (searchResults?.comingSoon.totalItems || 0);

  return (
    <MainLayout>
        <MovieBanner />
        <SearchBar onSearch={handleSearch} />

        <div className="container">
          {hasActiveSearch ? (
            <div>
              {/* Results Summary */}
              <div
                style={{
                  marginBottom: 20,
                  padding: "15px 0",
                  borderBottom: "1px solid #d9d2b7",
                  background: "#faf9f6",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#8b7355",
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {loadingSearch ? (
                      "Đang tìm kiếm..."
                    ) : errorSearch ? (
                      "Có lỗi khi tìm kiếm."
                    ) : (
                      <>
                        TÌM THẤY {totalFound} PHIM CHO "{searchFilters.searchTerm || ""}"
                        {searchFilters.genre &&
                          ` • THỂ LOẠI: "${searchFilters.genre}"`}
                        {searchFilters.year && ` • NĂM: ${searchFilters.year}`}
                      </>
                    )}
                  </div>
                  {(searchFilters.genre ||
                    searchFilters.year ||
                    searchFilters.searchTerm) && (
                    <button
                      onClick={() =>
                        handleSearch("", {
                          genre: "",
                          year: "",
                        })
                      }
                      style={{
                        background: "#8b7355",
                        color: "#ffffff",
                        border: "1px solid #8b7355",
                        padding: "6px 12px",
                        borderRadius: 4,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        transition: "all 0.3s ease",
                      }}
                    >
                      XÓA BỘ LỌC
                    </button>
                  )}
                </div>
              </div>

              {/* Search Results */}
              {!loadingSearch && !errorSearch && totalFound > 0 && (
                <MovieTabs
                  nowShowing={searchResults?.nowShowing.content || []}
                  comingSoon={searchResults?.comingSoon.content || []}
                  nowShowingHasMore={searchResults?.nowShowing.hasMore || false}
                  comingSoonHasMore={searchResults?.comingSoon.hasMore || false}
                  onLoadMoreNowShowing={() => {}} // TODO: Implement pagination for search if needed
                  onLoadMoreComingSoon={() => {}} // TODO: Implement pagination for search if needed
                />
              )}

              {/* No Results */}
              {!loadingSearch && !errorSearch && totalFound === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "#faf9f6",
                    border: "1px solid #d9d2b7",
                    borderRadius: 8,
                    margin: "20px 0",
                  }}
                >
                  <h2
                    style={{
                      marginBottom: 16,
                      color: "#8b7355",
                      fontSize: 18,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Không tìm thấy kết quả
                  </h2>
                  <p
                    style={{
                      marginBottom: 16,
                      color: "#8b7355",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    Thử tìm kiếm với từ khóa khác hoặc quay lại{" "}
                    <a
                      href="/"
                      style={{
                        color: "#8b7355",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                    >
                      trang chủ
                    </a>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <MovieTabs
              nowShowing={nowShowingMovies}
              comingSoon={comingSoonMovies}
              nowShowingHasMore={hasNextNowShowing}
              comingSoonHasMore={hasNextComingSoon}
              onLoadMoreNowShowing={handleLoadMoreNowShowing}
              onLoadMoreComingSoon={handleLoadMoreComingSoon}
              loadingMoreNowShowing={loadingMoreNowShowing}
              loadingMoreComingSoon={loadingMoreComingSoon}
            />
          )}
        </div>

        <QuickBooking />
    </MainLayout>
  );
}

// ... (rest of App.tsx remains the same) ...


function BookingPage() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const theaterId = searchParams.get("theaterId");

  return (
    <MainLayout>
      <BookingFlow movieId={movieId} theaterId={theaterId} />
    </MainLayout>
  );
}

function NearbyTheatersPage() {
  return (
    <MainLayout>
      <Suspense fallback={<PageLoader />}>
        <NearbyTheaters />
      </Suspense>
    </MainLayout>
  );
}

export default function App() {
  return (
    <BackgroundProvider>
      <Toaster position="top-right" />
      <ScrollToHash />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies/:id" element={<MainLayout><MovieDetail /></MainLayout>} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/:movieId" element={<BookingPage />} />
          <Route path="/booking/success" element={<MainLayout><BookingSuccess /></MainLayout>} />
          <Route path="/booking/failed" element={<MainLayout><BookingFailed /></MainLayout>} />
          <Route path="/booking/tickets" element={<Tickets />} />
          <Route path="/theaters/nearby" element={<NearbyTheatersPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/403" element={<Error403 />} />
          {/* Customer Profile */}
          <Route path="/profile" element={<ProtectedRoute><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
          {/* Staff layout with nested routes */}
          <Route
            path="/staff"
            element={
              <ProtectedRoute roles={["STAFF"]}>
                <StaffLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<StaffDashboard />} />
            <Route path="scheduling" element={<StaffScheduling />} />
            <Route path="movies" element={<StaffMovieManagement />} />
            <Route path="showtimes" element={<ShowtimeManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="profile" element={<StaffProfile />} />
            <Route path="statistics" element={<Statistics />} />
          </Route>
          {/* Admin layout with nested routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Statistics />} />
            <Route path="genres" element={<GenreList />} />
            <Route path="genres/create" element={<GenreForm />} />
            <Route path="genres/:id/edit" element={<GenreForm />} />
            <Route path="theaters" element={<TheaterList />} />
            <Route path="theaters/create" element={<TheaterForm />} />
            <Route path="theaters/:id/detail" element={<TheaterDetail />} />
            <Route path="theaters/:id/edit" element={<TheaterForm />} />
            <Route path="theaters/:id/view" element={<TheaterForm />} />
            <Route path="theaters/:theaterId/rooms/create" element={<RoomForm />} />
            <Route
              path="theaters/:theaterId/rooms/:roomId/edit"
              element={<RoomForm />}
            />
            <Route path="movies" element={<MovieIntakeList />} />
            <Route path="movies/create" element={<MovieIntakeForm />} />
            <Route path="movies/:id/edit" element={<MovieIntakeForm />} />
            <Route path="movies/:id/view" element={<MovieIntakeForm />} />
            <Route path="banners" element={<BannerList />} />
            <Route path="banners/new" element={<BannerForm />} />
            <Route path="banners/:id/edit" element={<BannerForm />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="movie-assignments" element={<MovieAssignmentList />} />
            <Route path="movie-requests" element={<MovieRequestList />} />
            <Route path="movie-requests" element={<MovieRequestList />} />
            <Route path="profile" element={<AdminProfile />} />
          <Route path="statistics" element={<Statistics />} />
        </Route>
        {/* Examples for protected routes (uncomment when pages exist) */}
        {/* <Route path="/admin/*" element={<ProtectedRoute roles={["ADMIN"]}><AdminApp/></ProtectedRoute>} /> */}
      </Routes>
      </Suspense>
    </BackgroundProvider>
  );
}
