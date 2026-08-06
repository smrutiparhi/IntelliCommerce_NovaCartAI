package com.novacart.auth.infrastructure;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.novacart.auth.domain.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
