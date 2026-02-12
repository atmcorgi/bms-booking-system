package fsa.training.controller.admin;

import fsa.training.dto.admin.BannerDto;
import fsa.training.entity.Banner;
import fsa.training.repository.BannerRepository;
import fsa.training.service.AdminBannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@PreAuthorize("hasAuthority('ADMIN')")
public class AdminBannerApiController {

    private final BannerRepository bannerRepository;
    private final AdminBannerService adminBannerService;

    @Autowired
    public AdminBannerApiController(BannerRepository bannerRepository, AdminBannerService adminBannerService) {
        this.bannerRepository = bannerRepository;
        this.adminBannerService = adminBannerService;
    }

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        List<Banner> banners = bannerRepository.findAll();
        return ResponseEntity.ok(banners);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return bannerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(@RequestBody BannerDto bannerDto) {
        Banner saved = adminBannerService.createBanner(bannerDto);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(@PathVariable Long id, @RequestBody BannerDto bannerDto) {
        Banner updated = adminBannerService.updateBanner(id, bannerDto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        if (bannerRepository.existsById(id)) {
            bannerRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}

