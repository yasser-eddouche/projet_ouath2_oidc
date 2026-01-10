package ma.enset.orderservice.services;

import lombok.RequiredArgsConstructor;
import ma.enset.orderservice.dtos.OrderItemRequest;
import ma.enset.orderservice.dtos.OrderRequest;
import ma.enset.orderservice.dtos.OrderResponse;
import ma.enset.orderservice.entities.Order;
import ma.enset.orderservice.entities.OrderStatus;
import ma.enset.orderservice.feign.ProductClient;
import ma.enset.orderservice.mappers.OrderMapper;
import ma.enset.orderservice.models.Product;
import ma.enset.orderservice.repository.OrderRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductClient productClient;
    private final OrderMapper orderMapper;

    @Override
    public OrderResponse createOrder(OrderRequest request, String userId) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order must contain at least one item");
        }

        List<Product> items = new ArrayList<>();
        double total = 0d;

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getQuantity() <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be positive");
            }
            Product product = productClient.getProduct(itemReq.getProductId());
            if (product == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found: " + itemReq.getProductId());
            }
            if (product.getQuantity() < itemReq.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Insufficient stock for product " + product.getId());
            }
            total += product.getPrice() * itemReq.getQuantity();

            Product ordered = Product.builder()
                    .id(product.getId())
                    .name(product.getName())
                    .description(product.getDescription())
                    .price(product.getPrice())
                    .quantity(itemReq.getQuantity())
                    .build();
            items.add(ordered);
        }

        Order order = Order.builder()
                .orderDate(LocalDateTime.now())
                .status(OrderStatus.PENDING)
                .totalAmount(total)
                .userId(userId)
                .items(items)
                .build();

        Order saved = orderRepository.save(order);
        return orderMapper.toResponse(saved);
    }

    @Override
    public List<OrderResponse> getMyOrders(String userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Override
    public OrderResponse getOrderById(Long id, String userId, boolean isAdmin) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
        if (!isAdmin && !order.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        return orderMapper.toResponse(order);
    }
}
