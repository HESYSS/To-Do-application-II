package com.example.todo.services;

import com.example.todo.dto.CategoryDto;
import com.example.todo.entities.Category;
import com.example.todo.entities.Task;
import com.example.todo.entities.User;
import com.example.todo.interfaces.CategoryService;
import com.example.todo.repositories.CategoryRepository;
import com.example.todo.repositories.TaskRepository;
import com.example.todo.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository,
                               UserRepository userRepository,
                               TaskRepository taskRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.taskRepository = taskRepository;
    }

    public List<CategoryDto> findAll(String email) {
        return categoryRepository.findByUserEmailOrderByNameAsc(email)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CategoryDto create(String email, CategoryDto request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Category category = new Category();
        category.setName(request.getName());
        category.setColor(request.getColor() == null ? "#2563eb" : request.getColor());
        category.setUser(user);
        return toDto(categoryRepository.save(category));
    }

    public CategoryDto update(String email, Long id, CategoryDto request) {
        Category category = categoryRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        category.setName(request.getName());
        category.setColor(request.getColor());
        return toDto(categoryRepository.save(category));
    }

    public void delete(String email, Long id) {
        Category category = categoryRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Category not found"));
        for (Task task : taskRepository.findByCategoryIdAndUserEmail(id, email)) {
            task.setCategory(null);
            taskRepository.save(task);
        }
        categoryRepository.delete(category);
    }

    private CategoryDto toDto(Category category) {
        CategoryDto dto = new CategoryDto();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setColor(category.getColor());
        return dto;
    }
}
