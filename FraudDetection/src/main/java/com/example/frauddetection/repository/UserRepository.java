package com.example.frauddetection.repository;

import com.example.frauddetection.entity.user.Role;
import com.example.frauddetection.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByEmail(String email);
    // secure register (check duplicate email)
    boolean existsByEmail(String email);

    // role-based queries (admin dashboard / analytics)
    List<User> findByRole(Role role);

    long countByRole(Role role);

    // optional: useful for fraud system / monitoring
    List<User> findByEmailContainingIgnoreCase(String keyword);
}
