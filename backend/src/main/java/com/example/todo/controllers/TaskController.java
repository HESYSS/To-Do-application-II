package com.example.todo.controllers;

import com.example.todo.dto.TaskDto;
import com.example.todo.dto.TaskRequest;
import com.example.todo.interfaces.TaskService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {
    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public Page<TaskDto> findAll(Authentication authentication,
                                 @RequestParam(required = false) String search,
                                 @RequestParam(required = false) Long categoryId,
                                 @RequestParam(required = false) Boolean completed,
                                 @PageableDefault(size = 8, sort = "createdAt") Pageable pageable) {
        return taskService.findAll(authentication.getName(), search, categoryId, completed, pageable);
    }

    @GetMapping("/{id}")
    public TaskDto findById(Authentication authentication, @PathVariable Long id) {
        return taskService.findById(authentication.getName(), id);
    }

    @PostMapping
    public TaskDto create(Authentication authentication, @RequestBody TaskRequest request) {
        return taskService.create(authentication.getName(), request);
    }

    @PutMapping("/{id}")
    public TaskDto update(Authentication authentication, @PathVariable Long id, @RequestBody TaskRequest request) {
        return taskService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(Authentication authentication, @PathVariable Long id) {
        taskService.delete(authentication.getName(), id);
    }
}
