package ma.enset.orderservice.dtos;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Long id;
    private LocalDateTime orderDate;
    private String status;
    private double totalAmount;
    private List<OrderItemResponse> items;
}
