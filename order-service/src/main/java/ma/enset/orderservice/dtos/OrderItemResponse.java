package ma.enset.orderservice.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderItemResponse {
    private Long productId;
    private int quantity;
    private double unitPrice;
    private double lineTotal;
}

