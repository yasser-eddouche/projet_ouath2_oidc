package ma.enset.productservice.service;

import lombok.RequiredArgsConstructor;
import ma.enset.productservice.dtos.ProductDto;
import ma.enset.productservice.entities.Product;
import ma.enset.productservice.mappers.ProductMapper;
import ma.enset.productservice.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Override
    public List<ProductDto> findAll() {
        return productRepository.findAll().stream()
                .map(productMapper::toDto)
                .toList();
    }

    @Override
    public ProductDto findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
        return productMapper.toDto(product);
    }

    @Override
    public ProductDto create(ProductDto productDto) {
        Product toSave = productMapper.toEntity(productDto);
        toSave.setId(null);
        Product saved = productRepository.save(toSave);
        return productMapper.toDto(saved);
    }

    @Override
    public ProductDto update(Long id, ProductDto productDto) {
        Product existing = productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        productMapper.updateEntity(productDto, existing);
        Product saved = productRepository.save(existing);
        return productMapper.toDto(saved);
    }

    @Override
    public void delete(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
        }
        productRepository.deleteById(id);
    }
}
