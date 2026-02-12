package fsa.training.service;

import fsa.training.dto.admin.BannerDto;
import fsa.training.entity.Banner;
import fsa.training.repository.BannerRepository;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
public class AdminBannerService {

    private final BannerRepository bannerRepository;

    public AdminBannerService(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @Transactional
    public Banner createBanner(BannerDto bannerDto) {
        Banner banner = convertToEntity(bannerDto);
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(Long id, BannerDto bannerDto) {
        return bannerRepository.findById(id)
                .map(existing -> {
                    updateEntityFromDto(existing, bannerDto);
                    return bannerRepository.save(existing);
                })
                .orElseThrow(() -> new RuntimeException("Banner not found with id: " + id));
    }

    private Banner convertToEntity(BannerDto dto) {
        Banner banner = new Banner();
        updateEntityFromDto(banner, dto);
        return banner;
    }

    private void updateEntityFromDto(Banner banner, BannerDto dto) {
        banner.setTitle(dto.getTitle());
        banner.setMediaType(dto.getMediaType());
        banner.setMediaUrl(dto.getMediaUrl());
        banner.setImageUrl(dto.getMediaUrl());
        banner.setThumbnailUrl(dto.getThumbnailUrl());
        banner.setLinkUrl(dto.getLinkUrl());
        banner.setDisplayOrder(dto.getDisplayOrder());
        banner.setIsActive(dto.getIsActive());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
        if (StringUtils.hasText(dto.getStartDate())) {
            banner.setStartDate(LocalDateTime.parse(dto.getStartDate(), formatter));
        } else {
            banner.setStartDate(null);
        }
        if (StringUtils.hasText(dto.getEndDate())) {
            banner.setEndDate(LocalDateTime.parse(dto.getEndDate(), formatter));
        } else {
            banner.setEndDate(null);
        }
    }
}
