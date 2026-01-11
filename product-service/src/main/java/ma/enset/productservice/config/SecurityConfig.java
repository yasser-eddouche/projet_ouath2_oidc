package ma.enset.productservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()   // ZERO TRUST : tout est protégé
                )
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter()))
                );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter());
        return converter;
    }

    @Bean
    public Converter<Jwt, Collection<GrantedAuthority>> jwtGrantedAuthoritiesConverter() {
        return jwt -> {
            // Get realm roles
            Map<String, Object> realmAccess = jwt.getClaim("realm_access");
            List<String> realmRoles = realmAccess != null 
                ? (List<String>) realmAccess.get("roles") 
                : List.of();

            // Get resource roles for microservices-app
            Map<String, Object> resourceAccess = jwt.getClaim("resource_access");
            List<String> resourceRoles = List.of();
            if (resourceAccess != null && resourceAccess.containsKey("microservices-app")) {
                Map<String, Object> clientAccess = (Map<String, Object>) resourceAccess.get("microservices-app");
                resourceRoles = (List<String>) clientAccess.get("roles");
            }

            // Combine and convert to authorities with SCOPE_ prefix
            return Stream.concat(realmRoles.stream(), resourceRoles.stream())
                    .map(role -> new SimpleGrantedAuthority("SCOPE_" + role))
                    .collect(Collectors.toList());
        };
    }
}
