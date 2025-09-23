package fsa.training.repository.theater;

import fsa.training.entity.District;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DistrictRepository extends JpaRepository<District, Long> {
    List<District> findByProvinceId(Long provinceId);

    // District có rạp có suất chiếu từ ngày startDate trong province
    @Query("SELECT d FROM District d WHERE d.province.id = :provinceId AND EXISTS (" +
           " SELECT 1 FROM Theater t JOIN t.showtimes s WHERE t.district = d AND s.showDate >= :startDate)" )
    List<District> findDistrictsWithShowtimesFromDate(@Param("provinceId") Long provinceId,
                                                      @Param("startDate") java.time.LocalDate startDate);

    // District có rạp có suất chiếu movie từ ngày startDate trong province
    @Query("SELECT d FROM District d WHERE d.province.id = :provinceId AND EXISTS (" +
           " SELECT 1 FROM Theater t JOIN t.showtimes s WHERE t.district = d AND s.movie.id = :movieId AND s.showDate >= :startDate)" )
    List<District> findDistrictsWithShowtimesForMovieFromDate(@Param("provinceId") Long provinceId,
                                                              @Param("movieId") Long movieId,
                                                              @Param("startDate") java.time.LocalDate startDate);
} 