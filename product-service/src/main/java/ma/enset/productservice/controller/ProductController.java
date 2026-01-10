package ma.enset.productservice.controller;

import lombok.RequiredArgsConstructor;
import ma.enset.productservice.dtos.ProductDto;
import ma.enset.productservice.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN','SCOPE_CLIENT')")
    public List<ProductDto> getProducts() {
        return productService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('SCOPE_ADMIN','SCOPE_CLIENT')")
    public ProductDto getProduct(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto createProduct(@RequestBody ProductDto product) {
        return productService.create(product);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    public ProductDto updateProduct(@PathVariable Long id, @RequestBody ProductDto product) {
        return productService.update(id, product);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SCOPE_ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Long id) {
        productService.delete(id);
    }
}
