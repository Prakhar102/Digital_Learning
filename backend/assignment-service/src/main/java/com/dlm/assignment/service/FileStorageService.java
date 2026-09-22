package com.dlm.assignment.service;

import java.io.IOException;
import java.nio.file.*;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private final String uploadDir =
            "uploads/assignments";

    public String saveFile(
            MultipartFile file)
            throws IOException {

        Path uploadPath =
                Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {

            Files.createDirectories(
                    uploadPath);
        }

        String fileName =
                System.currentTimeMillis()
                        + "_"
                        + file.getOriginalFilename();

        Path filePath =
                uploadPath.resolve(
                        fileName);

        Files.copy(
                file.getInputStream(),
                filePath,
                StandardCopyOption.REPLACE_EXISTING);

        return fileName;
    }
}