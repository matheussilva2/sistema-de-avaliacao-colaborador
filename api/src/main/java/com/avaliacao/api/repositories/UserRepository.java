package com.avaliacao.api.repositories;

import com.avaliacao.api.models.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<UserModel, UUID> {
    Optional<UserModel> findByEmail(String email);
    List<UserModel> findByManager_Id(UUID managerId);
    List<UserModel> findByManager_IdAndUserRole(UUID managerId, com.avaliacao.api.enums.UserRole userRole);
    List<UserModel> findByManager_IdAndUserRoleAndActiveTrue(UUID managerId, com.avaliacao.api.enums.UserRole userRole);
}
