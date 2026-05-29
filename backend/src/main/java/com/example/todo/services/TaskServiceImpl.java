package com.example.todo.services;

import com.example.todo.dto.TaskDto;
import com.example.todo.dto.TaskRequest;
import com.example.todo.entities.Category;
import com.example.todo.entities.Task;
import com.example.todo.entities.User;
import com.example.todo.interfaces.TaskService;
import com.example.todo.repositories.CategoryRepository;
import com.example.todo.repositories.TaskRepository;
import com.example.todo.repositories.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
public class TaskServiceImpl implements TaskService {
    private final TaskRepository taskRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public TaskServiceImpl(TaskRepository taskRepository,
                           CategoryRepository categoryRepository,
                           UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public Page<TaskDto> findAll(String email, String search, Long categoryId, Boolean completed, Pageable pageable) {
        Specification<Task> spec = belongsTo(email)
                .and(matchesSearch(search))
                .and(hasCategory(categoryId))
                .and(hasCompleted(completed));
        return taskRepository.findAll(spec, pageable).map(this::toDto);
    }

    public TaskDto findById(String email, Long id) {
        return toDto(taskRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Task not found")));
    }

    public TaskDto create(String email, TaskRequest request) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("User not found"));
        Task task = new Task();
        apply(task, request, email);
        task.setUser(user);
        return toDto(taskRepository.save(task));
    }

    public TaskDto update(String email, Long id, TaskRequest request) {
        Task task = taskRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        apply(task, request, email);
        return toDto(taskRepository.save(task));
    }

    public void delete(String email, Long id) {
        Task task = taskRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
        taskRepository.delete(task);
    }

    private void apply(Task task, TaskRequest request, String email) {
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setCompleted(request.isCompleted());
        task.setDueDate(request.getDueDate());
        if (request.getCategoryId() == null) {
            task.setCategory(null);
        } else {
            Category category = categoryRepository.findByIdAndUserEmail(request.getCategoryId(), email)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            task.setCategory(category);
        }
    }

    private Specification<Task> belongsTo(final String email) {
        return (root, query, cb) -> cb.equal(root.get("user").get("email"), email);
    }

    private Specification<Task> matchesSearch(final String search) {
        return (root, query, cb) -> {
            if (search == null || search.trim().isEmpty()) {
                return cb.conjunction();
            }
            String pattern = "%" + search.trim().toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }

    private Specification<Task> hasCategory(final Long categoryId) {
        return (root, query, cb) -> categoryId == null ? cb.conjunction() : cb.equal(root.get("category").get("id"), categoryId);
    }

    private Specification<Task> hasCompleted(final Boolean completed) {
        return (root, query, cb) -> completed == null ? cb.conjunction() : cb.equal(root.get("completed"), completed);
    }

    private TaskDto toDto(Task task) {
        TaskDto dto = new TaskDto();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setCompleted(task.isCompleted());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());
        if (task.getCategory() != null) {
            dto.setCategoryId(task.getCategory().getId());
            dto.setCategoryName(task.getCategory().getName());
            dto.setCategoryColor(task.getCategory().getColor());
        }
        return dto;
    }
}
