package ma.enset.orderservice.controller;

import lombok.RequiredArgsConstructor;
import ma.enset.orderservice.dtos.OrderRequest;
import ma.enset.orderservice.dtos.OrderResponse;
import ma.enset.orderservice.services.OrderService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private String getUserId(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return authentication.getName();
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_CLIENT') or hasAuthority('SCOPE_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse createOrder(@RequestBody OrderRequest request, Authentication authentication) {
        String userId = getUserId(authentication);
        return orderService.createOrder(request, userId);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('SCOPE_CLIENT') or hasAuthority('SCOPE_ADMIN')")
    public List<OrderResponse> myOrders(Authentication authentication) {
        String userId = getUserId(authentication);
        return orderService.getMyOrders(userId);
    }

    @GetMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public List<OrderResponse> allOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_CLIENT') or hasAuthority('SCOPE_ADMIN')")
    public OrderResponse orderById(@PathVariable Long id, Authentication authentication) {
        String userId = getUserId(authentication);
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("SCOPE_ADMIN"));
        return orderService.getOrderById(id, userId, isAdmin);
    }
}
