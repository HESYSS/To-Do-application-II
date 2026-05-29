package com.example.todo.interfaces;

import com.example.todo.dto.TaskDto;
import com.example.todo.dto.TaskRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TaskService {
    Page<TaskDto> findAll(String email, String search, Long categoryId, Boolean completed, Pageable pageable);
    TaskDto findById(String email, Long id);
    TaskDto create(String email, TaskRequest request);
    TaskDto update(String email, Long id, TaskRequest request);
    void delete(String email, Long id);
}
