package com.deloitte.absolute_cinema;

import com.deloitte.absolute_cinema.service.NotificationService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AbsoluteCinemaApplication {

	public static void main(String[] args) {
		SpringApplication.run(AbsoluteCinemaApplication.class, args);
	}

}
