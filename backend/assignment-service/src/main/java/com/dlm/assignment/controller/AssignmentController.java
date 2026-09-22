package com.dlm.assignment.controller;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.dlm.assignment.dto.*;
import com.dlm.assignment.service.AssignmentService;
import com.dlm.assignment.service.FileStorageService;


@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    private final FileStorageService fileStorageService;

    @PostMapping
    public AssignmentResponse
    createAssignment(
            @RequestBody
            AssignmentRequest request) {

        return assignmentService
                .createAssignment(
                        request);
    }

    @GetMapping("/instructor/{id}")
    public List<AssignmentResponse>
    getInstructorAssignments(
            @PathVariable Long id) {

        return assignmentService
                .getInstructorAssignments(
                        id);
    }

    @GetMapping("/course/{id}")
    public List<AssignmentResponse>
    getCourseAssignments(
            @PathVariable Long id) {

        return assignmentService
                .getCourseAssignments(
                        id);
    }


    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<String> uploadAssignmentFile(
                @RequestParam("file")
                MultipartFile file)
                throws Exception {

            String fileName =
                    fileStorageService
                            .saveFile(file);

            return ResponseEntity.ok(
                    fileName);
        }


    @GetMapping("/download/{fileName}")
    public ResponseEntity<Resource>
    downloadFile(
            @PathVariable
            String fileName)
            throws Exception {

        Path path =
                Paths.get(
                        "uploads/assignments")
                        .resolve(fileName);

        Resource resource =
                new UrlResource(
                        path.toUri());

        return ResponseEntity.ok()
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename="
                                +
                                resource
                                        .getFilename())
                .body(resource);
    }
}