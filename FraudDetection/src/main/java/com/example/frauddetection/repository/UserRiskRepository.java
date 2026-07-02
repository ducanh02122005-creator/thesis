package com.example.frauddetection.repository;

import com.example.frauddetection.entity.user.UserRiskProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRiskRepository extends JpaRepository<UserRiskProfile, Long> {

    Optional<UserRiskProfile> findByUserId(Long userId);
}