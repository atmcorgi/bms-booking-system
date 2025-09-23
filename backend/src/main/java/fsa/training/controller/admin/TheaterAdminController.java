package fsa.training.controller.admin;

import fsa.training.entity.Theater;
import fsa.training.entity.Province;
import fsa.training.entity.District;
import fsa.training.service.theater.TheaterService;
import fsa.training.repository.theater.ProvinceRepository;
import fsa.training.repository.theater.DistrictRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.List;
import java.util.Arrays;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

/**
 * Admin Controller để quản lý Theater sử dụng Abstract Factory + Factory Method
 */
@Controller
@RequestMapping("/admin/theater")
@PreAuthorize("hasAuthority('ADMIN')")
public class TheaterAdminController {
    
    @Autowired
    private TheaterService theaterService;
    
    @Autowired
    private ProvinceRepository provinceRepository;
    
    @Autowired
    private DistrictRepository districtRepository;
    
    @GetMapping
    public String showTheaterManagement(Model model, Authentication authentication) {
        // Lấy danh sách brands được hỗ trợ
        String[] supportedBrands = theaterService.getSupportedBrands();
        model.addAttribute("supportedBrands", supportedBrands);
        
        // Lấy features của từng brand
        for (String brand : supportedBrands) {
            String[] features = theaterService.getBrandFeatures(brand);
            String pricingStrategy = theaterService.getBrandPricingStrategy(brand);
            
            model.addAttribute(brand.toLowerCase() + "Features", features);
            model.addAttribute(brand.toLowerCase() + "Pricing", pricingStrategy);
        }
        
        // Lấy danh sách provinces và districts
        List<Province> provinces = provinceRepository.findAll();
        model.addAttribute("provinces", provinces);
        
        // Lấy theaters theo quyền của user
        List<Theater> theaters = theaterService.getTheatersForUser(authentication.getName());
        model.addAttribute("theaters", theaters);
        
        return "admin/theater-management";
    }
    
    @GetMapping("/districts")
    @ResponseBody
    public List<Map<String, Object>> getDistrictsByProvince(@RequestParam Long provinceId) {
        return districtRepository.findByProvinceId(provinceId)
                .stream()
                .map(d -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", d.getId());
                    m.put("name", d.getName());
                    return m;
                })
                .collect(Collectors.toList());
    }
    
    @PostMapping("/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public String createTheater(@RequestParam String brand,
                               @RequestParam String theaterName,
                               @RequestParam String theaterCode,
                               @RequestParam String address,
                               @RequestParam String phone,
                               @RequestParam String description,
                               @RequestParam Long provinceId,
                               @RequestParam Long districtId,
                               @RequestParam String roomNames,
                               @RequestParam int seatsPerRoom,
                               RedirectAttributes ra) {
        
        try {
            // Validate brand
            if (!theaterService.isBrandSupported(brand)) {
                ra.addFlashAttribute("error", "Brand không được hỗ trợ: " + brand);
                return "redirect:/admin/theater";
            }
            
            // Lấy Province và District
            Province province = provinceRepository.findById(provinceId)
                .orElseThrow(() -> new IllegalArgumentException("Province không tồn tại"));
            
            District district = districtRepository.findById(districtId)
                .orElseThrow(() -> new IllegalArgumentException("District không tồn tại"));
            
            // Parse room names
            List<String> roomNameList = Arrays.asList(roomNames.split(","));
            
            // ✅ Sử dụng Abstract Factory để tạo theater system
            Theater theater = theaterService.createTheaterWithBrand(
                brand, theaterName, theaterCode, address, phone, description,
                province, district, roomNameList, seatsPerRoom
            );
            
            int roomsCreated = roomNameList.size();
            int seatsCreated = roomsCreated * seatsPerRoom;
            ra.addFlashAttribute("success", 
                "Tạo thành công theater " + brand + ": " + theater.getName() +
                ". Đã tạo " + roomsCreated + " phòng, " + seatsCreated + " ghế.");
            
        } catch (Exception e) {
            ra.addFlashAttribute("error", "Lỗi tạo theater: " + e.getMessage());
        }
        
        return "redirect:/admin/theater";
    }
    
    @GetMapping("/brand-info/{brand}")
    @ResponseBody
    @PreAuthorize("hasAuthority('ADMIN')")
    public String getBrandInfo(@PathVariable String brand) {
        try {
            String[] features = theaterService.getBrandFeatures(brand);
            String pricingStrategy = theaterService.getBrandPricingStrategy(brand);
            
            StringBuilder info = new StringBuilder();
            info.append("Brand: ").append(brand).append("\n");
            info.append("Features:\n");
            for (String feature : features) {
                info.append("- ").append(feature).append("\n");
            }
            info.append("Pricing: ").append(pricingStrategy);
            
            return info.toString();
            
        } catch (Exception e) {
            return "Lỗi lấy thông tin brand: " + e.getMessage();
        }
    }
}
