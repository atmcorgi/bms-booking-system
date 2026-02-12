package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
// Default table name "Role" to match FK constraint case sensitivity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_name")
    private String roleName;

    @OneToMany(mappedBy = "role")
    private Set<AccountPermission> accountPermissions;
}