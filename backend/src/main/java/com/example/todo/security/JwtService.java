package com.example.todo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class JwtService {
    private final String secret;
    private final long expirationMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-minutes}") long expirationMinutes) {
        this.secret = secret;
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(String email) {
        Date now = new Date();
        Date expires = new Date(now.getTime() + expirationMinutes * 60 * 1000);
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expires)
                .signWith(key(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String extractEmail(String token) {
        return claims(token).getSubject();
    }

    public boolean isValid(String token, String email) {
        return email.equals(extractEmail(token)) && claims(token).getExpiration().after(new Date());
    }

    private Claims claims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key key() {
        byte[] bytes;
        try {
            bytes = Decoders.BASE64.decode(secret);
        } catch (IllegalArgumentException ex) {
            bytes = secret.getBytes();
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}
