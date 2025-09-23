package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "province")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Province {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "code", unique = true)
    private String code; // Mã tỉnh/thành phố

    @Column(name = "latitude")
    private Double latitude; // Vĩ độ

    @Column(name = "longitude")
    private Double longitude; // Kinh độ

    // Relationship với District
    @OneToMany(mappedBy = "province", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<District> districts;
} 