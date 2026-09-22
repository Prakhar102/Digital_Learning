package com.dlm.assessment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dlm.assessment.entity.Question;

public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByAssessmentId(Long assessmentId);
}