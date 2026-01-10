package ma.enset.orderservice.services;

import ma.enset.orderservice.dtos.OrderRequest;
import ma.enset.orderservice.dtos.OrderResponse;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(OrderRequest request, String userId);
    List<OrderResponse> getMyOrders(String userId);
    List<OrderResponse> getAllOrders();
    OrderResponse getOrderById(Long id, String userId, boolean isAdmin);
}

