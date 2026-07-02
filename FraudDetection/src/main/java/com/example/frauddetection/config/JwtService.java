package com.example.frauddetection.config;

import com.example.frauddetection.entity.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.beans.factory.annotation.Value;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String secret;
//    nên encode nó trước khi sử dụng

    @Value("${jwt.expiration}")
    private long expiration;

private Key getSignKey(){return Keys.hmacShaKeyFor(secret.getBytes());}

private Claims extractAllClaims(String token){
return Jwts.parserBuilder()//khởi tạo
        .setSigningKey(getSignKey())//lấy key
        .build()//hoàn thiện cấu hình và bắt đầu tạo ra parser
        .parseClaimsJws(token)//check key và token
        .getBody();//tạo body và trả lại payload
}
public <T> T extractClaim(String token, Function<Claims , T>claimResolver){
    final Claims claims = extractAllClaims(token);
    return claimResolver.apply(claims);
}

public Boolean isValid(String token,UserDetails userDetails){
final String username = extractUsername(token);
return (username.equals(userDetails.getUsername()))&&!isTokenExpired(token);
}

    private boolean isTokenExpired(String token) {
    return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
    return extractClaim(token, Claims::getExpiration);
    }


    //warning
public String extractUsername(String token){
return extractAllClaims(token).getSubject();
}

public String generateToken(UserDetails userDetails){
    return generateToken(new HashMap<>(),userDetails);
}
public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails){
return Jwts.builder()
        .setClaims(extraClaims)
        .setSubject(userDetails.getUsername())
        .setIssuedAt(new Date(System.currentTimeMillis()))
        .setExpiration(new Date(System.currentTimeMillis()+ expiration))
        .signWith(getSignKey(), SignatureAlgorithm.HS256)
        .compact();
}


}
