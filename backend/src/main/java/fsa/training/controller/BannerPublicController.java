package fsa.training.controller;

import fsa.training.entity.Banner;
import fsa.training.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/banners")
public class BannerPublicController {
    
    @Autowired
    private BannerRepository bannerRepository;
    
    @GetMapping
    public ResponseEntity<List<Banner>> getActiveBanners() {
        List<Banner> banners = bannerRepository.findActiveBannersForDisplay(LocalDateTime.now());
        return ResponseEntity.ok(banners);
    }
}

