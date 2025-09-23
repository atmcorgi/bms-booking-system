package fsa.training.repository.theater;

import fsa.training.entity.Province;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProvinceRepository extends JpaRepository<Province, Long> {
    
    // Province có district/theater có suất chiếu từ ngày startDate
    @Query("SELECT p FROM Province p WHERE EXISTS (" +
           " SELECT 1 FROM District d JOIN d.theaters t JOIN t.showtimes s " +
           " WHERE d.province = p AND s.showDate >= :startDate)" )
    List<Province> findProvincesWithShowtimesFromDate(@Param("startDate") java.time.LocalDate startDate);

    // Province có district/theater có suất chiếu movie từ ngày startDate
    @Query("SELECT p FROM Province p WHERE EXISTS (" +
           " SELECT 1 FROM District d JOIN d.theaters t JOIN t.showtimes s " +
           " WHERE d.province = p AND s.movie.id = :movieId AND s.showDate >= :startDate)" )
    List<Province> findProvincesWithShowtimesForMovieFromDate(@Param("movieId") Long movieId,
                                                              @Param("startDate") java.time.LocalDate startDate);
} 