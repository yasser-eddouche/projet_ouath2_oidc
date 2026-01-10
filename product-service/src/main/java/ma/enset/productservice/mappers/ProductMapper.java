package ma.enset.productservice.mappers;

import ma.enset.productservice.dtos.ProductDto;
import ma.enset.productservice.entities.Product;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDto toDto(Product product) {
        if (product == null) return null;
        return ProductDto.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .quantity(product.getQuantity())
                .build();
    }

    public Product toEntity(ProductDto dto) {
        if (dto == null) return null;
        return Product.builder()
                .id(dto.getId())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .quantity(dto.getQuantity())
                .build();
    }

    public void updateEntity(ProductDto dto, Product entity) {
        if (dto == null || entity == null) return;
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setPrice(dto.getPrice());
        entity.setQuantity(dto.getQuantity());
    }
}

