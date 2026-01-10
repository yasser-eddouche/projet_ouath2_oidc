package ma.enset.orderservice.mappers;

import ma.enset.orderservice.dtos.OrderResponse;
import ma.enset.orderservice.entities.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {

    public OrderResponse toResponse(Order order) {
        return OrderResponse.builder()
                .id(order.getId())
                .orderDate(order.getOrderDate())
                .status(order.getStatus().name())
                .totalAmount(order.getTotalAmount())
                .items(order.getItems())
                .build();
    }
}
