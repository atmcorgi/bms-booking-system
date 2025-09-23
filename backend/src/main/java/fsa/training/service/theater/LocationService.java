package fsa.training.service.theater;

import fsa.training.entity.*;
import fsa.training.repository.theater.ProvinceRepository;
import fsa.training.repository.theater.DistrictRepository;
import fsa.training.repository.theater.TheaterRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class LocationService {
    private final ProvinceRepository provinceRepository;
    private final DistrictRepository districtRepository;
    private final TheaterRepository theaterRepository;

    public LocationService(ProvinceRepository provinceRepository, DistrictRepository districtRepository, 
                          TheaterRepository theaterRepository) {
        this.provinceRepository = provinceRepository;
        this.districtRepository = districtRepository;
        this.theaterRepository = theaterRepository;
    }
    
    // From-date filters for booking flows (>= start)
    public List<Province> getProvincesWithShowtimesFromDate(LocalDate start, Long movieId) {
        if (movieId != null) return provinceRepository.findProvincesWithShowtimesForMovieFromDate(movieId, start);
        return provinceRepository.findProvincesWithShowtimesFromDate(start);
    }

    public List<District> getDistrictsWithShowtimesFromDate(Long provinceId, LocalDate start, Long movieId) {
        if (movieId != null) return districtRepository.findDistrictsWithShowtimesForMovieFromDate(provinceId, movieId, start);
        return districtRepository.findDistrictsWithShowtimesFromDate(provinceId, start);
    }

    public List<Theater> getTheatersWithShowtimesFromDate(Long districtId, LocalDate start, Long movieId) {
        if (movieId != null) return theaterRepository.findTheatersWithShowtimesForMovieFromDate(districtId, movieId, start);
        return theaterRepository.findTheatersWithShowtimesFromDate(districtId, start);
    }
} 