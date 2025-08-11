package com.deloitte.absolute_cinema.service;

import com.deloitte.absolute_cinema.entity.Guest;
import com.deloitte.absolute_cinema.repository.GuestRepository;
import com.deloitte.absolute_cinema.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class GuestService {

    @Autowired
    private GuestRepository guestRepository;
    private final UserRepository userRepository;

    public GuestService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Guest createGuest(String email) {
        // Check if email belongs to a registered user
        if (userRepository.existsByEmail(email)) {
            throw new IllegalStateException("Email is already associated with a user account. Please log in.");
        }

        // Check if email is already used by a guest
        return guestRepository.findByEmail(email)
                .orElseGet(() -> guestRepository.save(new Guest(email)));
    }
}
