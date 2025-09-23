package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.List;

@Entity
@Table(name = "district")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class District {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "code")
    private String code; // Mã quận/huyện

    @Column(name = "latitude")
    private Double latitude; // Vĩ độ

    @Column(name = "longitude")
    private Double longitude; // Kinh độ

    // Relationship với Province
    @ManyToOne
    @JoinColumn(name = "province_id", nullable = false)
    private Province province;

    // Relationship với Theater
    @OneToMany(mappedBy = "district", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Theater> theaters;
} 