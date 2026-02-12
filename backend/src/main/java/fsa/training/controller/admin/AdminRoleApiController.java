package fsa.training.controller.admin;

import fsa.training.entity.Role;
import fsa.training.repository.auth.RoleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/roles")
public class AdminRoleApiController {
    private final RoleRepository roleRepository;

    public AdminRoleApiController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> listAll() {
        List<Map<String, Object>> roles = roleRepository.findAll().stream()
                .map(this::toRoleDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        return roleRepository.findById(id)
                .map(role -> ResponseEntity.ok(toRoleDto(role)))
                .orElse(ResponseEntity.notFound().build());
    }

    private Map<String, Object> toRoleDto(Role role) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", role.getId());
        dto.put("roleName", role.getRoleName());
        return dto;
    }
}

