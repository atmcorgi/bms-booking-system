package fsa.training.entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "theater")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Theater {
    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false)
    private String name;
    
    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code; // Mã rạp (ví dụ CGVHN)
    
    @Column(name = "address", nullable = false)
    private String address; // Địa chỉ chi tiết (số nhà, đường, phường/xã)
    
    @Column(name = "latitude")
    private Double latitude; // Vĩ độ của rạp
    
    @Column(name = "longitude")
    private Double longitude; // Kinh độ của rạp
    
    @Column(name = "phone")
    private String phone; // Số điện thoại rạp
    
    @Column(name = "description")
    private String description; // Mô tả rạp
    
    @Column(name = "open_time")
    private LocalTime openTime; // Giờ mở cửa (HH:mm)

    @Column(name = "close_time")
    private LocalTime closeTime; // Giờ đóng cửa (HH:mm)

    // Relationship với Province
    @ManyToOne
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;
    
    // Relationship với District
    @ManyToOne
    @JoinColumn(name = "district_id", nullable = false)
    private District district;
    
    // Relationship với Showtime
    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Showtime> showtimes;
    
    // Relationship với Seat
    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Seat> seats;
} 