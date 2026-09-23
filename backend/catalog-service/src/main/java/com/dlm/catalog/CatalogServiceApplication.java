package com.dlm.catalog;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import com.dlm.catalog.entity.Category;
import com.dlm.catalog.entity.Course;
import com.dlm.catalog.entity.CourseLevel;
import com.dlm.catalog.entity.CourseStatus;
import com.dlm.catalog.entity.Module;
import com.dlm.catalog.entity.Lesson;
import com.dlm.catalog.repository.CategoryRepository;
import com.dlm.catalog.repository.CourseRepository;
import com.dlm.catalog.repository.ModuleRepository;
import com.dlm.catalog.repository.LessonRepository;

import java.util.List;

@SpringBootApplication
public class CatalogServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CatalogServiceApplication.class, args);
	}

	@Bean
	CommandLineRunner initCatalogData(
			CategoryRepository categoryRepository,
			CourseRepository courseRepository,
			ModuleRepository moduleRepository,
			LessonRepository lessonRepository) {
		return args -> {
			// 1. Purge legacy hardcoded courses (Bootcamp / Masterclass mock courses)
			List<Course> allCourses = courseRepository.findAll();
			for (Course c : allCourses) {
				if (c.getTitle() != null && (
					c.getTitle().contains("The Complete Full Stack AI & Microservices Engineering Bootcamp") ||
					c.getTitle().contains("Python, FastAPI & Enterprise Distributed Systems Masterclass") ||
					c.getId() == 1L || c.getId() == 2L
				)) {
					var modules = moduleRepository.findByCourseId(c.getId());
					for (var m : modules) {
						var lessons = lessonRepository.findByModuleId(m.getId());
						lessonRepository.deleteAll(lessons);
					}
					moduleRepository.deleteAll(modules);
					courseRepository.delete(c);
				}
			}

			// 2. Remove "General Engineering" if present
			categoryRepository.findAll().stream()
				.filter(cat -> "General Engineering".equalsIgnoreCase(cat.getName()))
				.findFirst()
				.ifPresent(genCat -> {
					try {
						categoryRepository.delete(genCat);
					} catch (Exception ignored) {}
				});

			if (categoryRepository.count() == 0) {
				List<Category> defaultCategories = List.of(
					Category.builder().name("Python & Full Stack").description("Modern Python, FastAPI & React").build(),
					Category.builder().name("AI & Machine Learning").description("LLMs, RAG, PyTorch & Agents").build(),
					Category.builder().name("Java & Spring Boot").description("Enterprise Microservices & JPA").build(),
					Category.builder().name("Cybersecurity & SOC").description("Zero-Trust Architecture & Threat Hunting").build(),
					Category.builder().name("Cloud & DevOps (K8s)").description("Kubernetes, Docker & CI/CD Pipelines").build(),
					Category.builder().name("Frontend (React & Next.js)").description("Modern UI/UX & Web Development").build(),
					Category.builder().name("System Design & Architecture").description("Scalability, Gateways & Event Loops").build(),
					Category.builder().name("Data Science & Analytics").description("Big Data, Spark & Machine Learning").build()
				);
				categoryRepository.saveAll(defaultCategories);
			}
		};
	}
}


