package ma.enset.orderservice.dtos;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long productId;
    private int quantity;
}

