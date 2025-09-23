import { Route, Routes, useParams, useSearchParams } from "react-router-dom";
import "./styles/optimization.css";
import { useState } from "react";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import api from "./services/apiClient";
import MovieTabs from "./components/MovieTabs";
import { type MovieItem } from "./types/movie";
import Header from "./components/Header";
import Footer from "./components/Footer";
import QuickBooking from "./components/QuickBooking";
import MovieBanner from "./components/MovieBanner";
import SearchBar from "./components/SearchBar";
import MovieDetail from "./pages/MovieDetail";
import LoginPage from "./pages/Login";
import BookingFlow from "./components/BookingFlow";
import BookingSuccess from "./pages/BookingSuccess";
import BookingFailed from "./pages/BookingFailed";
import Tickets from "./pages/Tickets";
import ProtectedRoute from "./components/ProtectedRoute";
import GenreList from "./pages/admin/GenreList";
import GenreForm from "./pages/admin/GenreForm";
import AdminLayout from "./layouts/AdminLayout";
import TheaterList from "./pages/admin/TheaterList";
import TheaterForm from "./pages/admin/TheaterForm";
import TheaterDetail from "./pages/admin/TheaterDetail";
import RoomForm from "./pages/admin/RoomForm";
import MovieIntakeList from "./pages/admin/MovieIntakeList";
import Dashboard from "./pages/admin/Dashboard";
import StaffScheduling from "./pages/staff/Scheduling";
import StaffLayout from "./layouts/StaffLayout";
import StaffDashboard from "./pages/staff/Dashboard";
import StaffMovieManagement from "./pages/staff/MovieManagement";
import MovieIntakeForm from "./pages/admin/MovieIntakeForm";
import NearbyTheaters from "./pages/NearbyTheaters";
import CloudinaryTest from "./components/CloudinaryTest";

type PagedMovies = {
  movies: MovieItem[];
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
};

function Home() {
  const [searchFilters, setSearchFilters] = useState<{
    searchTerm: string;
    genre: string;
    year: string;
  }>({ searchTerm: "", genre: "", year: "" });

  const {
    data: nowShowingData,
    isLoading: loadingNow,
    isError: errorNow,
    fetchNextPage: fetchNextNowShowing,
    hasNextPage: hasNextNowShowing,
    isFetchingNextPage: loadingMoreNowShowing,
  } = useInfiniteQuery<PagedMovies>({
    queryKey: ["/api/movies/now-showing"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get("/api/movies/now-showing", {
        params: { page: pageParam },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
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
  } = useInfiniteQuery<PagedMovies>({
    queryKey: ["/api/movies/coming-soon"],
    queryFn: async ({ pageParam = 0 }) => {
      const res = await api.get("/api/movies/coming-soon", {
        params: { page: pageParam },
      });
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.currentPage + 1 : undefined;
    },
    initialPageParam: 0,
  });

  // Search results
  const {
    data: searchResults,
    isLoading: loadingSearch,
    isError: errorSearch,
  } = useQuery<PagedMovies>({
    queryKey: ["/api/movies/search", searchFilters],
    queryFn: async () => {
      const res = await api.get("/api/movies/search", {
        params: {
          q: searchFilters.searchTerm || undefined,
          genre: searchFilters.genre || undefined,
          year: searchFilters.year || undefined,
          page: 0,
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
    nowShowingData?.pages.flatMap((page) => page.movies) || [];
  const comingSoonMovies =
    comingSoonData?.pages.flatMap((page) => page.movies) || [];

  // Load more handlers
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
  const displayMovies = hasActiveSearch ? searchResults?.movies || [] : [];

  return (
    <>
      <Header />
      <main>
        <MovieBanner />
        <SearchBar onSearch={handleSearch} />

        <div className="container">
          {hasActiveSearch ? (
            <div>
              {/* Results Summary - Giống Thymeleaf */}
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
                        TÌM THẤY {displayMovies.length} / {displayMovies.length}{" "}
                        PHIM CHO "{searchFilters.searchTerm || ""}"
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
              {!loadingSearch && !errorSearch && displayMovies.length > 0 && (
                <MovieTabs
                  nowShowing={displayMovies}
                  comingSoon={[]}
                  nowShowingHasMore={false}
                  comingSoonHasMore={false}
                  onLoadMoreNowShowing={() => {}}
                  onLoadMoreComingSoon={() => {}}
                />
              )}

              {/* No Results */}
              {!loadingSearch && !errorSearch && displayMovies.length === 0 && (
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
      </main>
      <Footer />
    </>
  );
}

function BookingPage() {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const theaterId = searchParams.get("theaterId");

  return (
    <>
      <Header />
      <main>
        <BookingFlow movieId={movieId} theaterId={theaterId} />
      </main>
      <Footer />
    </>
  );
}

function NearbyTheatersPage() {
  return (
    <>
      <Header />
      <main>
        <NearbyTheaters />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/movies/:id" element={<MovieDetail />} />
      <Route path="/booking" element={<BookingPage />} />
      <Route path="/booking/:movieId" element={<BookingPage />} />
      <Route path="/booking/success" element={<BookingSuccess />} />
      <Route path="/booking/failed" element={<BookingFailed />} />
      <Route path="/booking/tickets" element={<Tickets />} />
      <Route path="/theaters/nearby" element={<NearbyTheatersPage />} />
      <Route path="/test-cloudinary" element={<CloudinaryTest />} />
      <Route path="/login" element={<LoginPage />} />
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
        <Route index element={<Dashboard />} />
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
      </Route>
      {/* Examples for protected routes (uncomment when pages exist) */}
      {/* <Route path="/admin/*" element={<ProtectedRoute roles={["ADMIN"]}><AdminApp/></ProtectedRoute>} /> */}
    </Routes>
  );
}
