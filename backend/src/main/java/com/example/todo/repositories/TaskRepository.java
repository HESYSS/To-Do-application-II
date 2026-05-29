package com.example.todo.repositories;

import com.example.todo.entities.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    Optional<Task> findByIdAndUserEmail(Long id, String email);
    List<Task> findByCategoryIdAndUserEmail(Long categoryId, String email);
}
