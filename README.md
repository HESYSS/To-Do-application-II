# Full-Stack To-Do App

To-Do application with Java REST API and React UI.

## Features

- Register, log in, and log out
- Create, view, edit, delete tasks
- Create, edit, delete categories
- Search tasks by title or description
- Filter by category and completion status
- Paginated task list

## Backend

Stack:

- Java 8 compatible Spring Boot 2.7
- Spring Web
- Spring Security with JWT
- Spring Data JPA / Hibernate
- H2 by default, PostgreSQL profile included
- 4-layer structure: controllers, services, interfaces, repositories/data access

Run with H2:

```powershell
cd backend
mvn spring-boot:run
```

Run with PostgreSQL:

```powershell
docker compose up -d postgres
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=postgres
```

API base URL:

```text
http://localhost:8080/api
```

Main endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{id}`
- `DELETE /api/tasks/{id}`
- `GET /api/categories`
- `POST /api/categories`
- `PUT /api/categories/{id}`
- `DELETE /api/categories/{id}`

## Frontend

Stack:

- React 18
- Vite
- TypeScript
- Bootstrap 5
- lucide-react icons
- JWT stored in localStorage and sent with API requests

Install and run:

```powershell
cd frontend
npm.cmd install
npm.cmd start
```

Open:

```text
http://localhost:4200
```

## Notes

This implementation uses Spring Data JPA/Hibernate because EF Core is a .NET/C# ORM, not a Java ORM. The Java equivalent for this stack is JPA/Hibernate with Spring Dependency Injection.
