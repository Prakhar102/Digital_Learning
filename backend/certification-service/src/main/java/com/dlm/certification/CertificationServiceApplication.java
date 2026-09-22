package com.dlm.certification;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;


@SpringBootApplication
@EnableFeignClients
public class CertificationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CertificationServiceApplication.class, args);
	}

}
