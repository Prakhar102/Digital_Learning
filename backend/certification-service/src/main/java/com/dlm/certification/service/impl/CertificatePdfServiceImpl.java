package com.dlm.certification.service.impl;

import java.io.ByteArrayOutputStream;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import com.dlm.certification.service.CertificatePdfService;

@Service
public class CertificatePdfServiceImpl
        implements CertificatePdfService {

    @Override
    public byte[] generateCertificatePdf(
            String learnerName,
            String courseName,
            String certificateNumber) {

        try (
                PDDocument document = new PDDocument();
                ByteArrayOutputStream baos = new ByteArrayOutputStream()
        ) {

            PDPage page = new PDPage();

            document.addPage(page);

            PDPageContentStream content = new PDPageContentStream(document, page);

            content.beginText();
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 22);
            content.newLineAtOffset(100, 700);
            content.showText("CERTIFICATE OF COMPLETION");
            content.endText();

            content.beginText();
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 14);
            content.newLineAtOffset(100, 650);
            content.showText("This certifies that:");
            content.endText();

            content.beginText();
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
            content.newLineAtOffset(100, 600);
            content.showText(learnerName);
            content.endText();

            content.beginText();
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 14);
            content.newLineAtOffset(100, 550);
            content.showText("has successfully completed:");
            content.endText();

            content.beginText();
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 16);
            content.newLineAtOffset(100, 500);
            content.showText(courseName);
            content.endText();

            content.beginText();
            content.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 12);
            content.newLineAtOffset(100, 450);
            content.showText("Certificate Number: " + certificateNumber);
            content.endText();

            content.close();

            document.save(baos);

            return baos.toByteArray();

        } catch (Exception ex) {

            throw new RuntimeException("Failed to generate PDF",ex);
        }
    }
}