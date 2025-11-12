package com.example.bookfair.client;

import com.example.bookfair.user.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Component
public class UserClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${user.service.url}")
    private String userServiceUrl;

    /**
     * Fetch user info by email
     * @param email user's email
     * @return Optional of User
     */
    public Optional<User> getUserByEmail(String email) {
        String url = userServiceUrl + "/users/by-email?email=" + email;
        User user = restTemplate.getForObject(url, User.class);
        return Optional.ofNullable(user);
    }
}
