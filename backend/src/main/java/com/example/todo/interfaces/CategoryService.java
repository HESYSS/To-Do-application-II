package com.example.todo.interfaces;

import com.example.todo.dto.CategoryDto;

import java.util.List;

public interface CategoryService {
    List<CategoryDto> findAll(String email);
    CategoryDto create(String email, CategoryDto request);
    CategoryDto update(String email, Long id, CategoryDto request);
    void delete(String email, Long id);
}
