package fsa.training.repository.theater;

import fsa.training.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TheaterRepository extends JpaRepository<Theater, Long>, JpaSpecificationExecutor<Theater> {

    Theater findByName(String name);

    boolean existsByName(String name);

    // Trả về rạp có suất chiếu từ ngày startDate theo district
    @Query("SELECT t FROM Theater t WHERE t.district.id = :districtId AND EXISTS (" +
           " SELECT 1 FROM Showtime s WHERE s.theater = t AND s.showDate >= :startDate)" )
    List<Theater> findTheatersWithShowtimesFromDate(@Param("districtId") Long districtId,
                                                     @Param("startDate") java.time.LocalDate startDate);

    // Trả về rạp có suất chiếu của movie từ ngày startDate theo district
    @Query("SELECT t FROM Theater t WHERE t.district.id = :districtId AND EXISTS (" +
           " SELECT 1 FROM Showtime s WHERE s.theater = t AND s.movie.id = :movieId AND s.showDate >= :startDate)" )
    List<Theater> findTheatersWithShowtimesForMovieFromDate(@Param("districtId") Long districtId,
                                                             @Param("movieId") Long movieId,
                                                             @Param("startDate") java.time.LocalDate startDate);

    // Delete seats by theater id
    @Modifying
    @Query("DELETE FROM Seat s WHERE s.theater.id = :theaterId")
    void deleteSeatsByTheaterId(@Param("theaterId") Long theaterId);

    // Delete showtimes by theater id
    @Modifying
    @Query("DELETE FROM Showtime s WHERE s.theater.id = :theaterId")
    void deleteShowtimesByTheaterId(@Param("theaterId") Long theaterId);

    // Delete rooms by theater id
    @Modifying
    @Query("DELETE FROM Room r WHERE r.theater.id = :theaterId")
    void deleteRoomsByTheaterId(@Param("theaterId") Long theaterId);

    // Delete account permissions by theater id
    @Modifying
    @Query("DELETE FROM AccountPermission ap WHERE ap.assignedTheaterId = :theaterId")
    void deleteAccountPermissionsByTheaterId(@Param("theaterId") Long theaterId);
} 