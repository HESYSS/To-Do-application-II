package com.example.todo.repositories;

import com.example.todo.entities.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserEmailOrderByNameAsc(String email);
    Optional<Category> findByIdAndUserEmail(Long id, String email);
}
