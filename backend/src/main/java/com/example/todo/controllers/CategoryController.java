package com.example.todo.controllers;

import com.example.todo.dto.CategoryDto;
import com.example.todo.interfaces.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryDto> findAll(Authentication authentication) {
        return categoryService.findAll(authentication.getName());
    }

    @PostMapping
    public CategoryDto create(Authentication authentication, @RequestBody CategoryDto request) {
        return categoryService.create(authentication.getName(), request);
    }

    @PutMapping("/{id}")
    public CategoryDto update(Authentication authentication, @PathVariable Long id, @RequestBody CategoryDto request) {
        return categoryService.update(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        categoryService.delete(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
