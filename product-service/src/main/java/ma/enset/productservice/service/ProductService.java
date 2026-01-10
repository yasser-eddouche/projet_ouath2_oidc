package ma.enset.productservice.service;

import ma.enset.productservice.dtos.ProductDto;

import java.util.List;

public interface ProductService {
    List<ProductDto> findAll();
    ProductDto findById(Long id);
    ProductDto create(ProductDto product);
    ProductDto update(Long id, ProductDto product);
    void delete(Long id);
}
