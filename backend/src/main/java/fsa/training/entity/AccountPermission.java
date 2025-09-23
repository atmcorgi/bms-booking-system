package fsa.training.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "account_permission")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AccountPermission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private Account account;

    @ManyToOne
    @JoinColumn(name = "role_id")
    private Role role;

    @Column(name = "assigned_theater_id")
    private Long assignedTheaterId;
}