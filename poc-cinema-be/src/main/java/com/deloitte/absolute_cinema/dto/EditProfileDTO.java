package com.deloitte.absolute_cinema.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EditProfileDTO
{
    @NotBlank(message = "Full name is required")
    String fullName;
    @NotBlank(message = "username is required")
    String username;
    @NotBlank(message = "password is required")
    String password;
    @NotBlank(message = "phone number is required")
    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number format")
    String phoneNumber;
    @NotBlank(message = "email is required")
    @Email(message = "Invalid email format")
    String email;
    String profilePictureUrl;
}
