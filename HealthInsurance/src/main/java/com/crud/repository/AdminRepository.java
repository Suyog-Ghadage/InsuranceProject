
package com.crud.repository;

import com.crud.entity.Admin;
import com.crud.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    List<Admin> findByRole(Role role);
    boolean existsByEmail(String email);
    Optional<Admin> findByEmail(String email);
}
