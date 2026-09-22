package com.dlm.progress.service.impl;

import org.springframework.stereotype.Service;

import com.dlm.progress.dto.ProgressDashboardResponse;
import com.dlm.progress.dto.ProgressRequest;
import com.dlm.progress.dto.ProgressResponse;
import com.dlm.progress.entity.CourseProgress;
import com.dlm.progress.exception.ResourceNotFoundException;
import com.dlm.progress.repository.CourseProgressRepository;
import com.dlm.progress.service.ProgressService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final CourseProgressRepository courseProgressRepository;

    @Override
    public ProgressResponse updateProgress(
            ProgressRequest request) {

        CourseProgress progress =
                courseProgressRepository
                        .findByUserIdAndCourseId(
                                request.getUserId(),
                                request.getCourseId())
                        .orElse(
                                CourseProgress.builder()
                                        .userId(request.getUserId())
                                        .courseId(request.getCourseId())
                                        .build());

        progress.setCompletedLessons(
                request.getCompletedLessons());

        progress.setTotalLessons(
                request.getTotalLessons());

        double percentage =
                ((double) request.getCompletedLessons()
                        / request.getTotalLessons()) * 100;

        boolean completed =
                request.getCompletedLessons()
                        .equals(request.getTotalLessons());

        progress.setCompletionPercentage(percentage);

        progress.setCompleted(completed);

        progress = courseProgressRepository.save(progress);

        return map(progress);
    }

    @Override
    public ProgressResponse getProgress(
            Long userId,
            Long courseId) {

        CourseProgress progress =
                courseProgressRepository
                        .findByUserIdAndCourseId(
                                userId,
                                courseId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Progress not found"));

        return map(progress);
    }

    private ProgressResponse map(
            CourseProgress progress) {

        return ProgressResponse.builder()
                .userId(progress.getUserId())
                .courseId(progress.getCourseId())
                .completedLessons(
                        progress.getCompletedLessons())
                .totalLessons(
                        progress.getTotalLessons())
                .completionPercentage(
                        progress.getCompletionPercentage())
                .completed(
                        progress.getCompleted())
                .build();
    }

    @Override
    public ProgressDashboardResponse getDashboard(
            Long userId) {

        long totalCourses =
                courseProgressRepository
                        .countByUserId(userId);

        long completedCourses =
                courseProgressRepository
                        .countByUserIdAndCompleted(
                                userId,
                                true);

        long inProgressCourses =
                totalCourses - completedCourses;

        return ProgressDashboardResponse
                .builder()
                .totalCourses(totalCourses)
                .completedCourses(completedCourses)
                .inProgressCourses(inProgressCourses)
                .build();
    }

}